import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  RefreshControl,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  APPROVED_PP_SWITCHER_TYPES,
  normalized,
  PP_SWITCHER_TYPES,
  ScreenProps,
} from "../../Utils/AppConstants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppRootStore } from "../../Redux/AppStore";
import { AppStyles } from "../../Utils/AppStyles";
import CustomHeader from "../Components/CustomHeader";
import { apiHandler } from "../../Network/Services/ApiHandler";
import { Base_Url, ENDPOINTS } from "../../Network/Urls";
import { setShowToast } from "../../Redux/AppReducers";
import { AppStrings } from "../../Utils/AppStrings";
import {
  capitalizeEachWord,
  formatAmountToUSD,
  formatStatus,
  getAvailableVehicleSlots,
  getErrorMessage,
  getFileNameFromPath,
  getStatusColor,
} from "../../Utils/Helper";
import AppImageViewer from "../Components/AppImageView";
import moment from "moment";
import FileViewer from "../Components/MediaPreviewModal";
import { useDeepLinkGuard } from "../../Hooks/DeepLinkGuard";
import RequestAttachmentsGallery, {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from "../ResidentIssuePortal/Components/FileListing";
import { useSignedDocResolver } from "../../Hooks/getSignedUrl";
import PdfIcon from "../Svg/PdfIcon";
import ImageIcon from "../Svg/ImageIcon";
import PlayIcon from "../Svg/VideoSVG";
import AudioIcon from "../Svg/AudioIcon";
import WordIcon from "../Svg/WordIcon";
import MailVector from "../Svg/MailVector";
import ExcelIcon from "../Svg/ExcelIcon";
import DocumentIcon from "../Svg/DocumentIcon";
import CustomSwitcher from "../Components/CustomSwitcher";
import RequestCommentsSection from "../Components/RequestCommentsSection";
import { requestCommentsService } from "../../Network/Services/RequestCommentsService";
import { removeHtmlTags } from "../../Utils/Helper";
import { paymentIntentReq } from "../../Network/Services/StripeServices";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import { PaymentAlert } from "../Components/ConfirmationModal";
import CustomButton from "../Components/CustomButton";
import { Routes } from "../../Utils/Routes";

const ParkingPermitReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
    [colors],
  );
  const dispatch = useDispatch();
  const userData = selector?.residentUserData;
  const [data, setData] = useState<any>({});
  const [contractdata, setcontractData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { resolveDocUrl } = useSignedDocResolver(
    {},
    "RESIDENT",
    ENDPOINTS.ParkingSignedUrl,
    "",
  );
  const [index, setIndex] = useState(0);
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    filename: string;
    url: string;
  } | null>(null);

  const openDocument = async (
    item: any,
    docType:
      | "document/proofOfResidency"
      | "document/vehicleRegistration"
      | "invoice/pdf",
  ) => {
    if (!item) return;
    const filename =
      item.fileName ?? getFileNameFromPath(item?.bucketPath) ?? "document";
    const signedUrl = await resolveDocUrl(item, docType);
    openFileViewer(filename, signedUrl);
  };
  const { isBlocked } = useDeepLinkGuard(userData);
  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }

  useEffect(() => {
    fetchRequestDetail();
  }, []);
  useEffect(() => {
    if (data?.permitType?.type === "association" && data?.permitType?.id) {
      fetchContractList();
    }
  }, [data?.permitType?.id, data?.permitType?.type]);

  const onPayment = async (payload: any, amount?: any) => {
    console.log("payload ==0===. ", payload, amount);

    const isZero = String(amount) === "0.00";
    const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;

    if (isMinimum) {
      PaymentAlert.show("Sorry", "this amount cannot be processed");
      return;
    }
    setPaymentLoading(true);
    try {
      await paymentIntentReq(
        payload,
        "RESIDENT",
        ENDPOINTS.parkingPermitPaymentIntent,
        async (response: any) => {
          console.log("paymentIntent API Response:", response);

          const clientSecret = response?.clientSecret;

          if (!isZero) {
            if (!clientSecret) {
              PaymentAlert.show("Error", "Payment client secret is missing.");
              return;
            }

            const { error: initError } = await initPaymentSheet({
              merchantDisplayName: "FOIA",
              paymentIntentClientSecret: clientSecret,
              allowsDelayedPaymentMethods: false,
            });

            if (initError) {
              PaymentAlert.show("Stripe Init Error", initError.message);
              return;
            }

            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
              PaymentAlert.show("Payment Failed", paymentError.message);
              return;
            }
          }

          PaymentAlert.show("Success", "Payment completed successfully.", [
            {
              text: "OK",
              onPress: () => {
                fetchRequestDetail();
              },
            },
          ]);
        },
      );
    } catch (err) {
      console.log("PaymentSheet Init Error:", err);
      PaymentAlert.show(
        "Error",
        "Something went wrong initializing payment sheet.",
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchRequestDetail = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    console.log(props?.route?.params?.formId);
    apiHandler({
      endpoint: ENDPOINTS.getParkingPermitReqDetail,
      method: "GET",
      queryParams: {
        id: props?.route?.params?.id ?? props?.route?.params?.formId,
      },
      authContext: "RESIDENT",
      onComplete: (resp: any) => {
        if (resp?.status) {
          setRefreshing(false);
          setIsLoading(false);
          setData(resp?.data?.data);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.message,
            }),
          );
        }
      },
    });
  };

  const fetchContractList = async () => {
    apiHandler({
      endpoint: ENDPOINTS.allParkingCompany,
      method: "GET",
      authContext: "RESIDENT",
      onComplete: (resp: any) => {
        if (resp?.status) {
          const list: any[] = Array.isArray(resp?.data?.data)
            ? resp.data.data
            : [];

          setcontractData(
            list.find((item: any) => item?.appliedPermit?.id === data?.id) ??
              {},
          );
        }
      },
    });
  };

  const addVehicle = (vehicles: any[]) => {
    const formData = new FormData();

    const keyMap = {
      parkingSite: "parkingSite",
      makeOf: "makeOfVehicle",
      model: "vehicleModel",
      color: "vehicleColor",
      license: "licensePlate",
      state: "vehicleState",
      ownerName: "ownerName",
      ownerPhoneNumber: "ownerPhoneNumber",
      ownerEmail: "ownerEmail",
    } as const;

    vehicles.forEach((v: any, i: number) => {
      Object.entries(keyMap).forEach(([k, api]) => {
        formData.append(`vehicles[${i}][${api}]`, String(v[k] ?? "").trim());
      });

      formData.append(`vehicles[${i}][ownerSameAsApplicant]`, "false");

      formData.append(`vehicles[${i}][carRegistration]`, {
        uri: v.image?.uri,
        type: v.image?.type || "application/octet-stream",
        name: v.image?.filename || "attachment",
      } as any);
    });

    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.companyaddVehicle,
      method: "POST",
      queryParams: { id: data?.id },
      isFormData: true,
      useRecaptcha: true,
      payload: formData,
      authContext: "RESIDENT",
      onComplete: (resp: any) => {
        setIsLoading(false);
        if (resp?.status) {
          fetchRequestDetail();
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: "Vehicle(s) has been added",
            }),
          );
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
        }
      },
    });
  };

  const openFileViewer = (filename: string, url: string) => {
    setSelectedFile({ filename, url });
    setFileViewerVisible(true);
  };
  // for company
  const availableVehicle = getAvailableVehicleSlots(
    contractdata,
    data?.vehicles,
  );

  const isAssociation = data?.permitType?.type === "association";
  const canAddVehicle =
    ["pending", "approved"].includes(data?.formStatus?.toLowerCase()) &&
    availableVehicle > 0;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == "ios" ? 15 : 0),
          paddingBottom: Platform.OS == "android" ? insects.bottom : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={selector?.isDarkTheme ? "light-content" : "dark-content"}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={props?.route?.params?.formId}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={"large"} color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ marginHorizontal: normalized(20) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRequestDetail(true)}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }
        >
          <View style={{ height: normalized(12) }} />

          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text style={styles.nameTxt}>{"Applicant Details"}</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Name</Text>
                <Text style={styles.valueTxt}>
                  {`${data?.firstName} ${data?.lastName}`}
                </Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Permit Type</Text>
                <Text style={styles.valueTxt}>
                  {data?.permitType?.type ?? "N / A"}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={[styles.keyTxt]}>Email</Text>
                <Text style={[styles.valueTxt, { fontSize: normalized(12) }]}>
                  {data?.email}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Phone Number</Text>
                <Text style={styles.valueTxt}>{data?.phoneNumber}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Address</Text>
                <Text style={[styles.valueTxt]}>{`${data?.address}`}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Permit Rate</Text>
                <Text style={styles.valueTxt}>
                  {formatAmountToUSD(data?.permitType?.rate)}
                </Text>
              </View>
              {data?.employerName && (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Employer Name</Text>
                  <Text style={styles.valueTxt}>{data.employerName}</Text>
                </View>
              )}

              {data?.proofOfResidency && (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Proof of Residency Type</Text>
                  <Text style={styles.valueTxt}>
                    {formatStatus(data.proofOfResidency.documentType)}
                  </Text>
                </View>
              )}
            </View>
            {data?.workAddress && (
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Work Address</Text>
                <Text style={styles.valueTxt}>{data.workAddress}</Text>
              </View>
            )}
            <View style={styles.item}>
              {data?.proofOfResidency && (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Proof of Residency Document</Text>
                  <View style={[styles.docBlock, { marginTop: normalized(8) }]}>
                    <TouchableOpacity
                      style={styles.docTapArea}
                      onPress={() =>
                        openDocument(
                          data?.proofOfResidency,
                          "document/proofOfResidency",
                        )
                      }
                    >
                      {(() => {
                        const ext = data?.proofOfResidency?.fileName
                          ?.split(".")
                          ?.pop()
                          ?.toLowerCase();
                        if (ext === "pdf") return <PdfIcon />;
                        if (IMAGE_EXTENSIONS.includes(ext))
                          return <ImageIcon size={30} />;
                        if (VIDEO_EXTENSIONS.includes(ext)) return <PlayIcon />;
                        if (AUDIO_EXTENSIONS.includes(ext))
                          return <AudioIcon />;
                        if (ext === "doc" || ext === "docx")
                          return <WordIcon />;
                        if (ext === "eml") return <MailVector />;
                        if (["xls", "xlsx", "csv"].includes(ext))
                          return <ExcelIcon />;
                        return (
                          <DocumentIcon
                            width={30}
                            height={30}
                            primary={colors.Desc_Txt}
                          />
                        );
                      })()}
                      <View style={styles.filenameCont}>
                        <Text style={styles.valueTxt}>
                          {data?.proofOfResidency?.fileName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <Text style={styles.keyTxt}>Signature</Text>
              <View
                style={[
                  styles.regImgCont,
                  {
                    backgroundColor: "#FFFFFF",
                  },
                ]}
              >
                <AppImageViewer
                  source={{
                    uri: `${Base_Url}${data?.signature}`,
                  }}
                  style={{
                    width: "100%",
                    height: normalized(150),
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          <View style={{ height: normalized(12) }} />

          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <Text style={styles.nameTxt}>{"Permit Status"}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Form Status</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: getStatusColor(data?.formStatus, colors),
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(data?.formStatus)}
                  </Text>
                </View>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Payment Status</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: getStatusColor(
                        data?.paymentStatus,
                        colors,
                      ),
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(data?.paymentStatus)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              {data?.zone && (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Zone</Text>
                  <Text style={styles.valueTxt}>{`${data?.zone?.name}`}</Text>
                </View>
              )}
              <View style={styles.item}>
                <Text style={styles.keyTxt}>City Site</Text>
                <Text style={styles.valueTxt}>
                  {data?.parkingSite?.buildingName}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Start Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.startDate).format("LL")}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Submission Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.deductionDate).format("LL")}
                </Text>
              </View>
            </View>

            {/* {data?.formStatus?.toLowerCase() === 'pending' &&
            data?.paymentStatus?.toLowerCase() === 'unpaid' ? (
              <View style={styles.row}>
                <Text style={styles.Desc_Txt_Main_Card}>
                  "Pending" Form Status is not billable — no further invoices
                  will be generated.
                </Text>
              </View>
            ) : null} */}
            {data?.formStatus?.toLowerCase() === "expired" ? (
              <View style={styles.row}>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Expiry Date</Text>
                  <Text style={styles.valueTxt}>
                    {moment(data?.expiryDate).format("LL")}
                  </Text>
                </View>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Permit ID</Text>
                  <Text style={styles.valueTxt}>{data?.permitId}</Text>
                </View>
              </View>
            ) : null}
            {data?.formStatus?.toLowerCase() === "approved" ? (
              <View style={styles.row}>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Permit Color</Text>
                  <Text style={styles.valueTxt}>
                    {data?.permitColor ?? "N/A"}
                  </Text>
                </View>
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Pickup Status</Text>
                  <View
                    style={[
                      styles.statusCont,
                      {
                        backgroundColor: getStatusColor(
                          data?.pickupStatus,
                          colors,
                        ),
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    <Text style={styles.statusTxt}>
                      {formatStatus(data?.pickupStatus) ?? "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>

          <View style={{ height: normalized(12) }} />
          <CustomSwitcher
            list={
              data?.formStatus?.toLowerCase() === "approved" ||
              (data?.invoices?.length ?? 0) > 0
                ? APPROVED_PP_SWITCHER_TYPES
                : PP_SWITCHER_TYPES
            }
            selectedIndex={index}
            onChange={(i) => {
              setIndex(i);
            }}
          />
          {index === 0 && (
            <RequestCommentsSection
              comments={data?.comments || []}
              loading={commentLoading}
              getIsOwner={(item) => item?.authorType === "resident"}
              getAuthorName={(item) =>
                `${item?.commentBy?.firstName ?? ""} ${
                  item?.commentBy?.lastName ?? ""
                }`.trim() || "User"
              }
              getInitial={(item) =>
                (item?.commentBy?.firstName ?? "U").charAt(0)
              }
              getCommentHtml={(item) => item?.comment}
              getCommentDate={(item) => item?.createdAt}
              canShowEdit={(item) =>
                data?.formStatus?.toLowerCase() !== "declined" &&
                !item?.isEdited &&
                item?.authorType === "resident"
              }
              showComposer={data?.formStatus?.toLowerCase() !== "declined"}
              onCreateComment={async (comment) => {
                if (commentLoading) return false;

                const htmlComment = String(comment || "").trim();

                if (!htmlComment) {
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: "Please enter a comment.",
                    }),
                  );
                  return false;
                }

                setCommentLoading(true);

                try {
                  const resp = await requestCommentsService.createComment({
                    endpoint: ENDPOINTS.parkingPermitCreateComment,
                    authContext: "RESIDENT",
                    queryParams: { id: data?.id },
                    payload: {
                      id: data?.id,
                      comment: htmlComment,
                      isInternal: false,
                    },
                  });

                  if (resp?.status) {
                    fetchRequestDetail(false);
                    dispatch(
                      setShowToast({
                        type: AppStrings.ToastType.success,
                        message: "Comment Successfully Posted",
                      }),
                    );
                    return true;
                  }

                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: resp?.message ?? "Something went wrong",
                    }),
                  );
                  return false;
                } finally {
                  setCommentLoading(false);
                }
              }}
              onUpdateComment={async (comment, item) => {
                if (commentLoading) return false;

                const htmlComment = String(comment || "").trim();

                if (!htmlComment) {
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: "Please enter a comment.",
                    }),
                  );
                  return false;
                }

                setCommentLoading(true);

                try {
                  const resp = await requestCommentsService.updateComment({
                    endpoint: ENDPOINTS.parkingPermitUpdateComment,
                    authContext: "RESIDENT",
                    queryParams: { commentId: item?.id },
                    payload: { commentId: item?.id, comment: htmlComment },
                  });

                  if (resp?.status) {
                    fetchRequestDetail(false);
                    dispatch(
                      setShowToast({
                        type: AppStrings.ToastType.success,
                        message: "Comment Updated",
                      }),
                    );
                    return true;
                  }

                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: resp?.message ?? "Something went wrong",
                    }),
                  );
                  return false;
                } finally {
                  setCommentLoading(false);
                }
              }}
            />
          )}
          {index === 1 && (
            <View>
              {isAssociation && canAddVehicle && (
                <CustomButton
                  text={"Add Vehicle"}
                  style={styles.addVehicleButton}
                  loading={false}
                  onPress={() =>
                    props?.navigation?.navigate(
                      Routes.ParkingPermit.CompanyVehicle,
                      {
                        availableVehicle: availableVehicle,
                        data: contractdata,
                        addVehiclefromRequest: true,
                        onAdd: addVehicle,
                        existingVehicles: data?.vehicles ?? [],
                      },
                    )
                  }
                />
              )}
              <View style={styles.itemCont}>
                <View style={styles.rowCont}>
                  <Text style={styles.nameTxt}>{"Vehicles"}</Text>
                </View>

                {data?.vehicles?.map((item: any, index: any) => (
                  <View key={item?.id ?? index}>
                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Model</Text>
                        <Text style={styles.valueTxt}>
                          {`${item?.vehicleModel}`}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Make</Text>
                        <Text style={styles.valueTxt}>
                          {item?.makeOfVehicle}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Color</Text>
                        <Text style={styles.valueTxt}>
                          {`${item?.vehicleColor}`}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>License Plate</Text>
                        <Text style={styles.valueTxt}>
                          {item?.licensePlate}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Garage State</Text>
                        <Text style={styles.valueTxt}>
                          {item?.vehicleState}
                        </Text>
                      </View>
                      {item?.parkingSite?.buildingName && (
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>Parking Site</Text>
                          <Text style={styles.valueTxt}>
                            {item?.parkingSite?.buildingName}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Car Registration</Text>
                      <View
                        style={[styles.docBlock, { marginTop: normalized(8) }]}
                      >
                        <TouchableOpacity
                          style={styles.docTapArea}
                          onPress={() =>
                            openDocument(item, "document/vehicleRegistration")
                          }
                        >
                          {(() => {
                            const ext = item?.fileName
                              ?.split(".")
                              ?.pop()
                              ?.toLowerCase();
                            if (ext === "pdf") return <PdfIcon />;
                            if (IMAGE_EXTENSIONS.includes(ext))
                              return <ImageIcon size={30} />;
                            if (VIDEO_EXTENSIONS.includes(ext))
                              return <PlayIcon />;
                            if (AUDIO_EXTENSIONS.includes(ext))
                              return <AudioIcon />;
                            if (ext === "doc" || ext === "docx")
                              return <WordIcon />;
                            if (ext === "eml") return <MailVector />;
                            if (["xls", "xlsx", "csv"].includes(ext))
                              return <ExcelIcon />;
                            return (
                              <DocumentIcon
                                width={30}
                                height={30}
                                primary={colors.Desc_Txt}
                              />
                            );
                          })()}
                          <View style={styles.filenameCont}>
                            <Text style={styles.valueTxt}>
                              {item?.fileName}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {data?.vehicles?.length != index + 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          {index === 2 && (
            <>
              {(data?.invoices ?? []).map((invoice: any, i: number) => {
                const fileName = getFileNameFromPath(invoice?.bucketPath ?? "");
                const ext = fileName?.split(".")?.pop()?.toLowerCase() ?? "";
                const payStatus = invoice?.paymentStatus ?? data?.paymentStatus;

                return (
                  <View
                    key={invoice?.id ?? i}
                    style={[styles.itemCont, { marginBottom: normalized(12) }]}
                  >
                    <View style={styles.rowCont}>
                      <Text style={styles.nameTxt}>{`Invoice ${i + 1}`}</Text>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Invoice Number</Text>
                        <Text style={styles.valueTxt}>
                          {invoice?.invoiceNumber ?? "N/A"}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Billing Period</Text>
                        <Text style={styles.valueTxt}>
                          {moment(invoice?.billingPeriodStart).format(
                            "MMM DD, YYYY",
                          )}
                          {" to "}
                          {moment(invoice?.billingPeriodEnd).format(
                            "MMM DD, YYYY",
                          )}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Amount</Text>
                        <Text style={styles.valueTxt}>
                          {formatAmountToUSD(invoice?.amount)}
                        </Text>
                      </View>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Due Date</Text>
                        <Text style={styles.valueTxt}>
                          {moment(invoice?.dueDate).format("MMM DD, YYYY")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>Status</Text>
                        <View
                          style={[
                            styles.statusCont,
                            {
                              backgroundColor: getStatusColor(
                                payStatus,
                                colors,
                              ),
                              alignSelf: "flex-start",
                            },
                          ]}
                        >
                          <Text style={styles.statusTxt}>
                            {capitalizeEachWord(payStatus)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.item}>
                      <Text style={styles.keyTxt}>Invoice</Text>
                      <View
                        style={[styles.docBlock, { marginTop: normalized(8) }]}
                      >
                        <TouchableOpacity
                          style={styles.docTapArea}
                          onPress={() => openDocument(invoice, "invoice/pdf")}
                        >
                          {ext === "pdf" ? (
                            <PdfIcon />
                          ) : IMAGE_EXTENSIONS.includes(ext) ? (
                            <ImageIcon size={30} />
                          ) : VIDEO_EXTENSIONS.includes(ext) ? (
                            <PlayIcon />
                          ) : AUDIO_EXTENSIONS.includes(ext) ? (
                            <AudioIcon />
                          ) : ext === "doc" || ext === "docx" ? (
                            <WordIcon />
                          ) : ext === "eml" ? (
                            <MailVector />
                          ) : ["xls", "xlsx", "csv"].includes(ext) ? (
                            <ExcelIcon />
                          ) : (
                            <DocumentIcon
                              width={30}
                              height={30}
                              primary={colors.Desc_Txt}
                            />
                          )}
                          <View style={styles.filenameCont}>
                            <Text style={styles.valueTxt}>{fileName}</Text>
                          </View>
                        </TouchableOpacity>
                      </View>

                      {payStatus?.toLowerCase() !== "paid" &&
                        data?.formStatus?.toLowerCase() === "approved" && (
                          <CustomButton
                            style={styles.paymentBtn}
                            text="Pay Now"
                            disabled={paymentLoading}
                            loading={paymentLoading}
                            onPress={() =>
                              onPayment(
                                { invoiceId: invoice?.id },
                                invoice?.amount,
                              )
                            }
                          />
                        )}
                      {/* <Text style={styles.btnTxt}>Pay Now</Text> */}
                    </View>
                  </View>
                );
              })}
            </>
          )}

          <View style={{ height: normalized(35) }} />
        </ScrollView>
      )}
      <FileViewer
        visible={fileViewerVisible}
        onClose={() => {
          setFileViewerVisible(false);
          setSelectedFile(null);
        }}
        filename={selectedFile?.filename ?? ""}
        resolveUrl={() => Promise.resolve(selectedFile?.url ?? "")}
      />
    </View>
  );
};

export default ParkingPermitReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    loaderCont: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    docBlock: {
      flexDirection: "row",
      alignItems: "center",
      gap: normalized(12),
      padding: normalized(12),
      borderRadius: normalized(10),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    docTapArea: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: normalized(10),
    },
    regImgCont: {
      borderWidth: 1,
      borderRadius: normalized(12),
      borderColor: colors.Grey_2,
      padding: normalized(12),
      borderStyle: "dashed",
      width: "100%",
      marginTop: normalized(8),
    },
    filenameCont: {
      flex: 1,
      alignItems: "flex-start",
      gap: normalized(4),
    },
    // paymentBtn: {
    //   backgroundColor: colors.Primary,
    //   flex: 1,
    //   height: normalized(40),
    //   alignItems: "center",
    //   justifyContent: "center",
    //   borderRadius: normalized(8),
    //   marginVertical: normalized(10),
    // },
    paymentBtn: {
      width: "100%",
      alignSelf: "stretch",
    },
    addVehicleButton: {
      marginVertical: normalized(10),
    },
    divider: {
      flex: 1,
      height: normalized(1),
      backgroundColor: colors.Grey_2,
      marginVertical: normalized(8),
    },
  });
