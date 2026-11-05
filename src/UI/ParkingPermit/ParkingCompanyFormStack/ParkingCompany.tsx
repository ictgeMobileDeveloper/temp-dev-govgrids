import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { AppRootStore } from "../../../Redux/AppStore";
import { AppStyles } from "../../../Utils/AppStyles";
import {
  normalized,
  P_Company_STEPPER_LIST,
  PP_STEPPER_LIST,
  ScreenProps,
} from "../../../Utils/AppConstants";
import { AppStrings } from "../../../Utils/AppStrings";
import { Routes } from "../../../Utils/Routes";
import {
  capitalizeEachWord,
  formatAmountToUSD,
  getStatusColor,
} from "../../../Utils/Helper";
import { apiHandler } from "../../../Network/Services/ApiHandler";
import { ENDPOINTS } from "../../../Network/Urls";
import {
  setShowToast,
  updateParkingPermitDraft,
} from "../../../Redux/AppReducers";
import Stepper from "../../Components/Stepper";
import CustomButton from "../../Components/CustomButton";
import SimpleButton from "../../Components/SimpleButton";

const ParkingPermitCompanyForm = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector?.themeColors;
  const dispatch = useDispatch();
  const userData = selector?.residentUserData;
  const draft = selector?.parkingPermitDraft ?? {};

  const styles = useMemo(
    () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
    [colors],
  );

  const [list, setList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(
    draft?.association?.id ?? null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const selected = useMemo(
    () => list.find((a) => a?.id === selectedId) ?? null,
    [list, selectedId],
  );

  const fetchAssociations = useCallback(() => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.allParkingCompany,
      method: "GET",
      authContext: "RESIDENT",
      requiresAuth: true,
      useRecaptcha: true,
      queryParams: {
        page: 1,
        pageSize: "all",
        search: "",
        contractBillingFrequency: "",
      },
      onComplete: (resp: any) => {
        setIsLoading(false);
        if (resp?.status) {
          const data: any[] = (
            Array.isArray(resp?.data?.data) ? resp.data.data : []
          ).filter((a: any) => a?.canApply === true);

          setList(data);

          setSelectedId((prev) =>
            data.some((a) => a?.id === prev) ? prev : data[0]?.id ?? null,
          );
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.message ?? "Something went wrong",
            }),
          );
        }
      },
    });
  }, [dispatch]);

  useEffect(() => {
    fetchAssociations();
  }, [fetchAssociations]);

  const onNext = () => {
    if (!selected) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: "Please select a company.",
        }),
      );
      return;
    }
    dispatch(updateParkingPermitDraft({ ...draft, association: selected }));
    props?.navigation?.navigate(Routes.ParkingPermit.CompanyVehicle, {
      maxVehicle: selected?.permitType?.maxVehiclesAllowed ?? undefined,
    });
  };

  const renderCompanyCard = ({ item }: { item: any }) => {
    const active = item?.id === selectedId;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedId(item?.id)}
          style={[
            styles.itemCont,
            active && {
              borderColor: colors.Primary,
              borderWidth: 1.5,
            },
          ]}
        >
          <View style={styles.rowCont}>
            <Text style={styles.nameTxt} numberOfLines={1}>
              {`${capitalizeEachWord(item?.contractBillingFrequency)}`}
            </Text>
            <Text style={styles.keyTxt}>{`#${item?.id}`}</Text>
          </View>
          <Text style={[styles.keyTxt, { fontSize: normalized(12) }]}>
            {item?.contractStartDate
              ? moment(item.contractStartDate).format("MMM DD, YYYY")
              : "N/A"}
            {" - "}
            {item?.contractEndDate
              ? moment(item.contractEndDate).format("MMM DD, YYYY")
              : "N/A"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const sites: any[] = selected?.sites ?? [];

  return (
    <View
      style={[
        styles.container,
        // {paddingBottom: Platform.OS === 'android' ? insets.bottom : 0},
      ]}
    >
      <Stepper
        list={P_Company_STEPPER_LIST}
        completedSteps={[0]}
        activeStep={P_Company_STEPPER_LIST[1]}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(20),
          }}
        >
          <Text style={styles.nameTxt}>Which company is this permit for?</Text>

          {list.length === 0 ? (
            <Text style={[styles.valueTxt, { marginTop: normalized(12) }]}>
              Kindly Refresh the page.
            </Text>
          ) : (
            <FlatList
              horizontal
              data={list}
              keyExtractor={(a) => String(a?.id)}
              renderItem={renderCompanyCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: normalized(10),
                paddingVertical: normalized(12),
              }}
            />
          )}

          {selected && (
            <>
              <Text style={styles.nameTxt}>Selected Company</Text>
              <View style={{ height: normalized(10) }} />

              {/* Contract */}
              <View style={styles.itemCont}>
                <View style={styles.rowCont}>
                  <Text style={styles.nameTxt}>Contract</Text>
                </View>

                <View style={styles.row}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Permit Type</Text>
                    <Text style={styles.valueTxt}>
                      {capitalizeEachWord(selected?.permitType?.type)}
                    </Text>
                  </View>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Billing Frequency</Text>
                    <Text style={styles.valueTxt}>
                      {capitalizeEachWord(selected?.contractBillingFrequency) ||
                        "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>Contract Period</Text>
                    <Text style={styles.valueTxt}>
                      {selected?.contractStartDate
                        ? moment(selected.contractStartDate).format(
                            "MMM DD, YYYY",
                          )
                        : "N/A"}
                      {" - "}
                      {selected?.contractEndDate
                        ? moment(selected.contractEndDate).format(
                            "MMM DD, YYYY",
                          )
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.nameTxt}>{`Sites (${sites.length})`}</Text>

                {sites.map((data: any, i: number) => {
                  const lateFee = data?.lateFeeEnabled ? "enabled" : "disabled";
                  return (
                    <View key={data?.id ?? i}>
                      <View style={styles.itemCont}>
                        <View style={styles.row}>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Parking Site</Text>
                            <Text style={styles.valueTxt}>
                              {data?.site?.buildingName ?? "N/A"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.row}>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Vehicle Capacity</Text>
                            <Text style={styles.valueTxt}>
                              {data?.vehicleCapacity ?? "N/A"}
                            </Text>
                          </View>

                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Late Fee</Text>
                            <View
                              style={[
                                styles.statusCont,
                                {
                                  backgroundColor: getStatusColor(
                                    lateFee,
                                    colors,
                                  ),
                                  alignSelf: "flex-start",
                                },
                              ]}
                            >
                              <Text style={styles.statusTxt}>
                                {capitalizeEachWord(lateFee)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>Rate</Text>
                          <Text style={styles.Heading1}>
                            {formatAmountToUSD(data?.rate)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <View style={styles.footerRow}>
            <View style={styles.nextBtnCont}>
              <SimpleButton
                text="Back"
                onPress={() => props?.navigation?.goBack()}
                loading={false}
              />
            </View>
            <View style={styles.nextBtnCont}>
              <CustomButton text="Next" onPress={onNext} loading={false} />
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ParkingPermitCompanyForm;

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
    // contractCard: {
    //   flexDirection: 'row',
    //   flexWrap: 'wrap',
    //   justifyContent: 'space-between',
    // },
  });
