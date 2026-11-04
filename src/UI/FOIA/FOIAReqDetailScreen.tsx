import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  ScrollViewInstance,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppColors,
  AppFonts,
  FOIA_PAYMENT_LIST,
  FOIADeclineLIST,
  FOIALIST,
  getFOIASortedReqList,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {Base_Url} from '../../Network/Urls';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setIsLoader, setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
  getStatusFontSize,
  groupCommentsByDate,
  lightenHexColor,
} from '../../Utils/Helper';
import AttachmentIcon from '../Svg/AttachmentIcon';
import CustomSwitcher from '../Components/CustomSwitcher';
import SecurityIcon from '../Svg/SecurityIcon';
import PhoneIcon from '../Svg/PhoneIcon';
import CarIcon from '../Svg/CarIcon';
import PoliceReportIcon from '../Svg/PoliceReportIcon';
import CameraIcon from '../Svg/CameraIcon';
import EyeIcon from '../Svg/EyeIcon';
import GalleryIcon from '../Svg/GalleryIcon';
import CustomCheckBox from '../Components/CustomCheckBox';
import DropDownIcon from '../Svg/DropDownIcon';
import WordIcon from '../Svg/WordIcon';
import moment from 'moment';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CustomButton from '../Components/CustomButton';
import CustomDropDownList from '../Components/CustomDropDownList';
import {Routes} from '../../Utils/Routes';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import DocumentIcon from '../Svg/DocumentIcon';
import GenerateReportModal from '../Components/GenerateReportModal';
import {paymentIntentReq} from '../../Network/Services/StripeServices';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {useIsFocused} from '@react-navigation/native';
import RequestCommentsSection from '../Components/RequestCommentsSection';
import {requestCommentsService} from '../../Network/Services/RequestCommentsService';
import {openFileExternally} from '../../Utils/ExternalFileViewer';
import {
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../ResidentIssuePortal/Components/FileListing';
import PlayIcon from '../Svg/VideoSVG';
import AudioIcon from '../Svg/AudioIcon';
import AppImageViewer from '../Components/AppImageView';
import ImageIcon from '../Svg/ImageIcon';
import FileViewer from '../Components/MediaPreviewModal';
import MailVector from '../Svg/MailVector';
import {requestPermission} from '@react-native-firebase/messaging';
import {useSignedDocResolver} from '../../Hooks/getSignedUrl';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';
import {PaymentAlert} from '../Components/ConfirmationModal';

const PaymentItem = ({
  release,
  index,
  isOpen,
  colors,
  openIndex,
  setOpenIndex,
  onOpenReportModal,
  isPayLoading,
  onPay,
}: any) => {
  const rotation = useSharedValue(isOpen ? 180 : 0);
  const expand = useSharedValue(isOpen ? 1 : 0);
  const opacity = useSharedValue(isOpen ? 1 : 0);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, {duration: 250});
    expand.value = withTiming(isOpen ? 1 : 0, {duration: 300});
    opacity.value = withTiming(isOpen ? 1 : 0, {duration: 250});
  }, [isOpen]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  const expandStyle = useAnimatedStyle(() => ({
    height: interpolate(expand.value, [0, 1], [0, 50], Extrapolate.CLAMP),
    opacity: opacity.value,
  }));

  const payment = release?.payment || {};

  const toggleDropdown = () => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View
      key={index}
      style={{
        padding: normalized(12),
        borderRadius: normalized(8),
        borderWidth: 1,
        borderColor: colors.BorderColor,
        backgroundColor: isOpen
          ? colors.Background
          : lightenHexColor(colors.Primary, 0.2),
        marginTop: normalized(12),
      }}>
      <View style={styles.payRow}>
        <Text style={styles.nameTxt}>{release?.releaseId}</Text>
        <View style={styles.innerRowCont}>
          {payment?.status?.toLowerCase() !== 'fulfilled' &&
          payment?.paymentMethod?.toLowerCase() === 'online' ? (
            <TouchableOpacity
              activeOpacity={1}
              disabled={isPayLoading}
              onPress={onPay}
              style={[styles.payBtnCont, isPayLoading && {opacity: 0.7}]}>
              {isPayLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.btnTxt, {color: colors.Heading_Txt}]}>
                  Pay Now
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={onOpenReportModal}
              style={styles.reportCont}>
              <DocumentIcon primary="#fff" width={22} height={22} />
            </TouchableOpacity>
          )}

          <TouchableOpacity activeOpacity={1} onPress={toggleDropdown}>
            <Animated.View style={rotateStyle}>
              <DropDownIcon
                width={24}
                height={24}
                primary={colors.Heading_Txt}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          expandStyle,
          {overflow: 'hidden', marginTop: isOpen ? normalized(10) : 0},
        ]}>
        <View style={styles.threeColRow}>
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Amount</Text>
            <Text style={[styles.valueTxt, {fontSize: normalized(20)}]}>
              {`$${payment?.amount ?? 0}`}
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Status</Text>
            <View
              style={[
                styles.paymentStatusCont,
                {
                  backgroundColor: lightenHexColor(
                    payment?.status === 'Pending'
                      ? colors.ToastColors.Alarm
                      : colors.Primary,
                    0.9,
                  ),
                  borderColor:
                    payment?.status === 'Pending'
                      ? colors.ToastColors.Alarm
                      : colors.Primary,
                },
              ]}>
              <Text
                style={[
                  styles.paymentStatusTxt,
                  {
                    color:
                      payment?.status === 'Pending'
                        ? colors.ToastColors.Alarm
                        : colors.Primary,
                  },
                ]}>
                {payment?.status ?? 'N/A'}
              </Text>
            </View>
          </View>
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Method</Text>
            <Text style={[styles.valueTxt, {fontSize: normalized(16)}]}>
              {payment?.paymentMethod ?? 'N/A'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const FOIAReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const colors = selector.themeColors;
  const userData = selector?.residentUserData;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const data = props?.route?.params?.data;
  const isTracked = props?.route?.params?.isTracked;
  const isOffline = data?.isOffline;
  const [isLoading, setIsLoading] = useState(false);
  const [listIndex, setListIndex] = useState(0);
  const [reqDetails, setReqDetails] = useState<any>(
    isOffline ? data?.item : isTracked ? data : null,
  );
  const isCommentDisabled = ['withdrawn', 'closed'].includes(
    data?.status?.toLowerCase(),
  );
  const [refreshing, setRefreshing] = useState(false);

  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false); // NEW
  const [urls, setUrls] = useState<any>(null);
  const [redactionReports, setRedactionReports] = useState<any>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<any>([]);
  const [paymentTypeIndex, setPaymentTypeIndex] = useState(0);
  const [payLoadingId, setPayLoadingId] = useState<any>();
  const scrollRef = useRef<ScrollViewInstance>(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState({
    isVisible: false,
    value: null,
  });
  const isResidentLoggedIn = Boolean(selector?.residentUserData);
  const flatComments = useMemo(
    () =>
      Array.isArray(comments)
        ? comments.flatMap((item: any) =>
            Array.isArray(item?.[1]) ? item[1] : item,
          )
        : [],
    [comments],
  );

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerItem = viewerIndex !== null ? urls?.[viewerIndex] : null;

  const [redactionViewerIndex, setRedactionViewerIndex] = useState<
    number | null
  >(null);
  const redactionViewerItem =
    redactionViewerIndex !== null
      ? redactionReports?.[redactionViewerIndex]
      : null;

  const {isBlocked} = useDeepLinkGuard(userData);

  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }
  const {resolveDocUrl, downloadAll, downloadAllLoading} = useSignedDocResolver(
    {
      requestId: reqDetails?.id,
      securityKey: reqDetails?.securityKey,
    },
    'RESIDENT',
    ENDPOINTS.generateSignedUrl,
    ENDPOINTS.getAllSignedUrl,
  );
  const onPayment = async (id: any, amount?: any) => {
    if (isOffline) {
      Alert.alert('Please Connect to Internet');
      return;
    }
    const isZero = String(amount) === '0.00';
    const isMinimum = Number(amount) > 0 && Number(amount) < 0.5;
    if (isMinimum) {
      Alert.alert('Sorry , this amount cannot be processed');
      return;
    }
    try {
      setPayLoadingId(id);

      await paymentIntentReq(
        {releaseId: id},
        'RESIDENT',
        ENDPOINTS.foiaPaymentIntent,
        async (response: any) => {
          try {
            if (
              response?.detail ===
              'Authentication credentials were not provided.'
            ) {
              PaymentAlert.show('Authentication Error', 'Please login again.');
              return;
            }

            const clientSecret = response?.clientSecret;
            if (!isZero) {
              if (!clientSecret) {
                PaymentAlert.show('Error', 'Something went wrong!.');
                return;
              }

              const {error: initError} = await initPaymentSheet({
                merchantDisplayName: 'FOIA',
                paymentIntentClientSecret: clientSecret,
                allowsDelayedPaymentMethods: false,
              });

              if (initError) {
                PaymentAlert.show('Stripe Init Error', initError.message);
                return;
              }

              const {error: paymentError} = await presentPaymentSheet();

              if (paymentError) {
                PaymentAlert.show('Payment Failed', paymentError.message);
                return;
              }
            }
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.success,
                message: 'Payment completed successfully.',
              }),
            );

            getReqDetails();
          } catch (error) {
            PaymentAlert.show(
              'Error',
              'Something went wrong with the payment.',
            );
          } finally {
            setPayLoadingId(null);
          }
        },
      );
    } catch (error) {
      setPayLoadingId(null);

      PaymentAlert.show(
        'Error',
        'Something went wrong while creating the payment.',
      );
    }
  };

  const hasAttachment = Boolean(reqDetails?.attachments);
  useEffect(() => {
    if (data?.isOffline || isTracked) return;

    getReqDetails();
  }, [props?.route?.params?.refreshedAt, isTracked]);

  const getReqDetails = async (isRefresh = false) => {
    if (isOffline) return;

    if (isRefresh) {
      if (isTracked) return;
      setRefreshing(true); // NEW
    } else {
      setIsLoading(true);
    }

    setIsLoading(true);
    apiHandler({
      endpoint: `${ENDPOINTS.requestDetail}${
        data?.id ?? reqDetails?.id ?? props?.route?.params?.id
      }/`,
      method: 'GET',
      authContext: isResidentLoggedIn ? 'RESIDENT' : undefined,
      useRecaptcha: true,
      recaptchaAction: 'signup',
      onComplete: (resp: any) => {
        console.log('Request Detail Response: ', resp);
        if (resp?.status) {
          setIsLoading(false);
          setRefreshing(false);
          setReqDetails(resp?.data?.data);
          const index = FOIA_PAYMENT_LIST.findIndex(
            item =>
              item.name.toLowerCase() ===
              resp?.data?.data?.paymentMethod.toLowerCase(),
          );

          // Update state (index starts from 0)
          if (index !== -1) {
            setPaymentTypeIndex(index);
          }
          setUrls(resp?.data?.URLS);
          setRedactionReports(resp?.data?.redactionReports);
        } else {
          setIsLoading(false);
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

  const sortedReqList = getFOIASortedReqList(reqDetails, {
    SecurityIcon,
    PhoneIcon,
    CarIcon,
    PoliceReportIcon,
    CameraIcon,
    EyeIcon,
    GalleryIcon,
  });

  const onViewDocument = (index: number) => {
    setViewerIndex(index);
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const getCompleteAttachmentUrl = (path?: string) => {
    if (!path) return '';
    if (/^(https?:\/\/|file:\/\/|content:\/\/)/i.test(path)) return path; // already a full URL

    const baseUrl = Base_Url.endsWith('/') ? Base_Url.slice(0, -1) : Base_Url;
    const relativeUrl = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${relativeUrl}`;
  };

  const fetchComments = () => {
    if (isOffline || isTracked) {
      return;
    }

    setCommentLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.getComments,
      method: 'GET',
      queryParams: {citizenRequest: reqDetails?.id},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          const data = groupCommentsByDate(resp?.data?.data);
          setComments(data);

          setCommentLoading(false);
        } else {
          setCommentLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    if (!isOffline && reqDetails?.id) {
      fetchComments();
    }
  }, [isOffline, reqDetails]);

  const onUpdatePaymentMethod = () => {
    if (isOffline) {
      return;
    }

    if (
      reqDetails?.paymentMethod == FOIA_PAYMENT_LIST[paymentTypeIndex]?.name
    ) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.warning,
          message: 'No changes were made.',
        }),
      );
      return;
    }

    setUpdateLoading(true);
    const payload = {
      paymentMethod: FOIA_PAYMENT_LIST[paymentTypeIndex]?.name,
      requestId: reqDetails?.id,
    };
    apiHandler({
      authContext: 'RESIDENT',
      method: 'PATCH',
      endpoint: ENDPOINTS.changePaymentMethod,
      payload,
      onComplete: (resp: any) => {
        if (resp?.status) {
          setUpdateLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message,
            }),
          );
          getReqDetails();
        } else {
          setUpdateLoading(false);
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

  const requestStatus = reqDetails?.status?.toLowerCase();
  const BlockUpdateDetails =
    requestStatus === 'declined' ||
    requestStatus === 'published' ||
    requestStatus === 'closed' ||
    requestStatus === 'withdrawn' ||
    requestStatus === 'ready to publish' ||
    requestStatus === 'ready to publish partially';

  const BlockComment =
    requestStatus === 'declined' ||
    requestStatus === 'published' ||
    requestStatus === 'closed' ||
    requestStatus === 'withdrawn';

  if (!reqDetails) {
    return (
      <View style={styles.loaderCont}>
        <ActivityIndicator size={'large'} color={colors.Primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={reqDetails?.requestReference ?? 'Request Details'}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size={'large'} color={colors.Primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => getReqDetails(true)}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(30),
          }}>
          {/* // ---------- first */}
          <View style={{height: normalized(20)}} />
          <View style={styles.itemCont}>
            <Text style={styles.nameTxt}>Request Details</Text>
            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Request Form Type'}</Text>
                <Text style={styles.valueTxt}>
                  {reqDetails?.formType == 'publicSafetyRequest'
                    ? 'Public Safety Request'
                    : 'City Hall Request'}
                </Text>
              </View>
              <View style={[styles.item]}>
                <Text style={styles.keyTxt}>{'Status'}</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: reqDetails?.status
                        ? getStatusColor(reqDetails?.status, colors)
                        : AppColors.ToastColors.Alarm,
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusTxt,
                      {fontSize: getStatusFontSize(reqDetails?.status)},
                    ]}>
                    {capitalizeEachWord(
                      String(reqDetails?.status ?? 'Not Submitted')
                        .replace(/([A-Z])/g, ' $1')
                        .trim(),
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <View style={{height: normalized(3)}} />
            <View style={[styles.row, {gap: normalized(10)}]}>
              <View style={[styles.item, {flex: 1}]}>
                <Text style={styles.keyTxt}>{'Attachments'}</Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.rowCont, {gap: normalized(8), flex: 1}]}
                  onPress={() => {
                    if (!hasAttachment) {
                      return;
                    }
                    setShowAttachmentViewer(true);
                  }}>
                  <AttachmentIcon
                    primary={
                      selector?.isDarkTheme ? colors.White : colors.Black
                    }
                    width={16}
                    height={16}
                  />
                  <Text
                    style={[styles.valueTxt, {color: colors.Primary, flex: 1}]}>
                    {reqDetails?.attachmentName}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Request Submission Date'}</Text>
                <Text style={styles.valueTxt}>
                  {moment(reqDetails?.date).format('LL')}
                </Text>
              </View>
            </View>
            <View style={{height: normalized(3)}} />

            <View style={[styles.row]}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Payment Status'}</Text>
                <View style={{maxWidth: normalized(170)}}>
                  <View
                    style={[
                      styles.statusCont,
                      {
                        backgroundColor: reqDetails?.status
                          ? getStatusColor(reqDetails?.paymentStatus, colors)
                          : AppColors.ToastColors.Alarm,
                        // alignSelf: 'flex-start',
                      },
                    ]}>
                    <Text style={styles.statusTxt}>
                      {capitalizeEachWord(reqDetails?.paymentStatus)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.item]}>
                <Text style={styles.keyTxt}>{'Payment Type'}</Text>
                <View
                  style={[
                    styles.statusCont,
                    {backgroundColor: colors.Ice_Blue, alignSelf: 'flex-start'},
                  ]}>
                  <Text style={[styles.statusTxt, {color: colors.Heading_Txt}]}>
                    {capitalizeEachWord(reqDetails?.requestPayStatus)}
                  </Text>
                </View>
              </View>
            </View>
            {!!reqDetails?.reason && (
              <>
                <View style={{height: normalized(3)}} />

                <View style={[styles.row, {gap: normalized(10)}]}>
                  <View style={[styles.item, {flex: 1}]}>
                    <Text style={styles.keyTxt}>Decline Reason</Text>
                    <Text style={styles.valueTxt}>{reqDetails.reason}</Text>
                  </View>
                </View>
              </>
            )}
            <View style={{height: normalized(3)}} />
            <View style={styles.item}>
              <Text style={styles.keyTxt}>{'Description'}</Text>
              <Text style={styles.valueTxt}>
                {reqDetails?.descriptionOfRequest}
              </Text>
            </View>
          </View>
          {/* -------------------- Second block  */}
          {reqDetails?.formType == 'publicSafetyRequest' && (
            <>
              <View style={{height: normalized(12)}} />
              <View style={styles.itemCont}>
                <Text style={styles.nameTxt}>Public Safety Details</Text>

                <FlatList
                  data={sortedReqList}
                  numColumns={2}
                  columnWrapperStyle={{
                    justifyContent: 'space-between',
                    marginBottom: normalized(8),
                  }}
                  renderItem={({item}) => (
                    <View style={styles.listRow}>
                      <CustomCheckBox
                        checked={item?.value}
                        onChange={() => {}}
                      />

                      <item.icon
                        width={18}
                        height={18}
                        primary={colors.Desc_Txt}
                      />

                      <View style={{flex: 1}}>
                        <Text style={styles.valueTxt}>{item?.label}</Text>
                      </View>
                    </View>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />

                <View style={styles.threeColRow}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>{'Police Case Number'}</Text>
                    <Text style={styles.valueTxt}>
                      {reqDetails?.policeCaseNumber ?? 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>{'Office Name'}</Text>
                    <Text style={styles.valueTxt}>
                      {reqDetails?.officeName ? reqDetails?.officeName : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>{'Client Name'}</Text>
                    <Text style={styles.valueTxt}>
                      {reqDetails?.clientName ? reqDetails?.clientName : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.threeColRow}>
                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>{'Incident Date'}</Text>
                    <Text style={styles.valueTxt}>
                      {reqDetails?.incidentDate
                        ? moment(reqDetails?.incidentDate).format('LL')
                        : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>{'Incident Time'}</Text>
                    <Text style={styles.valueTxt}>
                      {reqDetails?.incidentTime
                        ? moment(reqDetails?.incidentTime, 'hh:mm A').format(
                            'hh:mm A',
                          )
                        : 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.keyTxt}>{'Other'}</Text>
                    <Text style={styles.valueTxt}>
                      {reqDetails?.other?.length > 0
                        ? reqDetails?.other
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
          {/* ----------------------- third block payments  */}
          {reqDetails?.documentReleases?.length > 0 && (
            <>
              <View style={{height: normalized(12)}} />
              <View style={styles.itemCont}>
                <Text style={styles.nameTxt}>Payment Details</Text>
                {reqDetails.documentReleases.map(
                  (release: any, index: number) => (
                    <>
                      <PaymentItem
                        key={index}
                        release={release}
                        index={index}
                        isOpen={openIndex === index}
                        colors={colors}
                        openIndex={openIndex}
                        setOpenIndex={setOpenIndex}
                        onPay={() =>
                          onPayment(release?.id, release?.payment?.amount)
                        }
                        isPayLoading={payLoadingId === release?.id}
                        onOpenReportModal={() =>
                          setShowGenerateReportModal({
                            isVisible: true,
                            value: {
                              ...release,
                              name: `${reqDetails?.firstName} ${reqDetails?.lastName}`,
                              address: reqDetails?.address,
                              phoneNumber: reqDetails?.phoneNumber,
                              receiptId: `${release?.releaseId}-${reqDetails?.requestReference}`,
                              requestId: reqDetails?.requestReference,
                            },
                          })
                        }
                      />
                    </>
                  ),
                )}
              </View>
            </>
          )}
          {/* ----------------------- Redaction Reports  */}
          {redactionReports?.length > 0 && (
            <>
              <View style={{height: normalized(12)}} />
              <View style={styles.itemCont}>
                <Text style={styles.nameTxt}>Redaction Reports</Text>

                {redactionReports.map((item: any, index: number) => {
                  const type = item?.filename?.split('.').pop();
                  return (
                    <View
                      key={index}
                      style={[styles.docBlock, {marginTop: normalized(8)}]}>
                      <TouchableOpacity
                        style={styles.docTapArea}
                        onPress={() => setRedactionViewerIndex(index)}>
                        {type == 'pdf' ? (
                          <PdfIcon />
                        ) : (
                          <DocumentIcon
                            width={30}
                            height={30}
                            primary={colors.Desc_Txt}
                          />
                        )}
                        <View style={styles.filenameCont}>
                          <Text style={styles.nameTxt}>{item?.filename}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </>
          )}
          {/* ----------------------- fourth block Documents  */}
          {urls?.length > 0 && (
            <>
              <View style={{height: normalized(12)}} />
              <View style={styles.itemCont}>
                <Text style={styles.nameTxt}>Request Documents</Text>

                {urls.slice(0, 3).map((item: any, index: number) => {
                  const type = item?.filename?.split('.').pop();
                  return (
                    <View
                      key={index}
                      style={[styles.docBlock, {marginTop: normalized(8)}]}>
                      <TouchableOpacity
                        style={styles.docTapArea}
                        onPress={() => onViewDocument(index)}>
                        {type == 'pdf' ? (
                          <PdfIcon />
                        ) : IMAGE_EXTENSIONS.includes(type) ? (
                          <ImageIcon size={30} />
                        ) : VIDEO_EXTENSIONS.includes(type) ? (
                          <PlayIcon />
                        ) : AUDIO_EXTENSIONS.includes(type) ? (
                          <AudioIcon />
                        ) : type == 'doc' || type == 'docx' ? (
                          <WordIcon />
                        ) : type == 'eml' ? (
                          <MailVector />
                        ) : ['xls', 'xlsx', 'csv'].includes(type) ? (
                          <ExcelIcon />
                        ) : (
                          <DocumentIcon
                            width={30}
                            height={30}
                            primary={colors.Desc_Txt}
                          />
                        )}
                        <View style={styles.filenameCont}>
                          <Text style={styles.nameTxt}>{item?.filename}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {urls?.length > 5 ? (
                  <CustomButton
                    text={`See All (${urls.length})`}
                    onPress={() =>
                      props.navigation.navigate(Routes.DocumentListScreen, {
                        singleSignedURL: ENDPOINTS.generateSignedUrl,
                        AllSignedURL: ENDPOINTS.getAllSignedUrl,
                        navigation: 'RESIDENT',
                        urls,
                        payload: {
                          requestId: reqDetails?.id,
                          securityKey: reqDetails?.securityKey,
                        },
                      })
                    }
                  />
                ) : (
                  urls?.length > 1 && (
                    <CustomButton
                      text={'Download All'}
                      onPress={() => downloadAll()}
                      loading={downloadAllLoading}
                    />
                  )
                )}
              </View>
            </>
          )}
          {/* ----------------------- fifth block Requester  */}
          <View style={{height: normalized(12)}} />
          <View style={styles.itemCont}>
            <Text style={styles.nameTxt}>Requester Details</Text>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Name'}</Text>
                <Text style={styles.valueTxt}>{`${
                  reqDetails?.citizenUser?.firstName ?? reqDetails?.firstName
                } ${
                  reqDetails?.citizenUser?.lastName ?? reqDetails?.lastName
                }`}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Email'}</Text>
                <Text style={styles.valueTxt}>
                  {reqDetails?.citizenUser?.email ?? reqDetails?.email}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Phone Number'}</Text>
                <Text style={styles.valueTxt}>
                  {reqDetails?.citizenUser?.phoneNumber ??
                    reqDetails?.phoneNumber}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Address'}</Text>
                <Text style={styles.valueTxt}>
                  {reqDetails?.citizenUser?.address ?? reqDetails?.address}
                </Text>
              </View>
            </View>

            {reqDetails?.citizenUser?.addressLine2 && (
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Address Line 2'}</Text>
                <Text style={styles.valueTxt}>
                  {reqDetails?.citizenUser?.addressLine2}
                </Text>
              </View>
            )}
          </View>
          {/* ----------------------- six block Comments  */}
          {!isTracked && (
            <CustomSwitcher
              list={BlockUpdateDetails ? FOIADeclineLIST : FOIALIST}
              selectedIndex={listIndex}
              onChange={i => setListIndex(i)}
            />
          )}

          {!isOffline &&
            !isTracked &&
            (BlockComment || !listIndex ? (
              <RequestCommentsSection
                comments={flatComments}
                loading={commentLoading}
                disabled={isCommentDisabled}
                disabledMessage="Comments will unlock after changing the status"
                getIsOwner={item => Boolean(item?.citizenCommentBy)}
                getAuthorName={item =>
                  item?.citizenCommentBy
                    ? `${item?.citizenCommentByFirstName ?? ''} ${
                        item?.citizenCommentByLastName ?? ''
                      }`.trim()
                    : `${item?.orgCommentByFirstName ?? ''} ${
                        item?.orgCommentByLastName ?? ''
                      }`.trim()
                }
                getAvatarPath={item =>
                  item?.citizenCommentBy
                    ? item?.citizenCommentByProfilePicture
                    : item?.orgCommentByProfilePicture ??
                      selector?.baseData?.logo
                }
                getInitial={item => item?.citizenCommentByFirstName?.charAt(0)}
                getCommentHtml={item => item?.comment}
                getCommentDate={item => item?.commentAt}
                canEditComment={item => !item?.isEdited}
                canShowEdit={item =>
                  !BlockComment &&
                  Boolean(item?.citizenCommentBy) &&
                  !item?.isEdited
                }
                showComposer={!BlockComment}
                onCreateComment={async comment => {
                  if (isOffline || !comment) return false;
                  setCommentLoading(true);

                  const resp = await requestCommentsService.createComment({
                    endpoint: ENDPOINTS.comment,
                    authContext: 'RESIDENT',
                    payload: {citizenRequest: reqDetails?.id, comment},
                  });

                  if (resp?.status) {
                    fetchComments();
                    dispatch(
                      setShowToast({
                        type: AppStrings.ToastType.success,
                        message: 'Comment Successfully Posted',
                      }),
                    );
                    return true;
                  }
                  setCommentLoading(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: getErrorMessage(resp),
                    }),
                  );
                  return false;
                }}
                onUpdateComment={async (comment, item) => {
                  if (isOffline) return false;
                  setCommentLoading(true);

                  const resp = await requestCommentsService.updateComment({
                    endpoint: ENDPOINTS.editComment,
                    authContext: 'RESIDENT',
                    queryParams: {commentId: item?.id},
                    payload: {comment, citizenRequest: reqDetails?.id},
                  });

                  if (resp?.status) {
                    fetchComments();
                    dispatch(
                      setShowToast({
                        type: AppStrings.ToastType.success,
                        message: 'Comment Updated',
                      }),
                    );
                    return true;
                  }
                  setCommentLoading(false);
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: getErrorMessage(resp),
                    }),
                  );
                  return false;
                }}
              />
            ) : (
              !isOffline && (
                <>
                  <Text style={styles.Input_Heading}>Payment Method</Text>
                  <CustomDropDownList
                    parentScrollRef={scrollRef}
                    list={FOIA_PAYMENT_LIST}
                    selectedIndex={paymentTypeIndex}
                    onChange={i => setPaymentTypeIndex(i)}
                  />
                  <View style={styles.updateBtnCont}>
                    <CustomButton
                      text={'Update'}
                      onPress={onUpdatePaymentMethod}
                      loading={updateLoading}
                    />
                  </View>
                </>
              )
            ))}
        </ScrollView>
      )}
      {viewerItem && (
        <FileViewer
          visible={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          filename={viewerItem?.filename ?? ''}
          resolveUrl={() => resolveDocUrl(viewerItem)}
          onPrevious={
            viewerIndex! > 0
              ? () => setViewerIndex(viewerIndex! - 1)
              : undefined
          }
          onNext={
            viewerIndex! < (urls?.length ?? 0) - 1
              ? () => setViewerIndex(viewerIndex! + 1)
              : undefined
          }
        />
      )}
      {redactionViewerItem && (
        <FileViewer
          visible={redactionViewerIndex !== null}
          onClose={() => setRedactionViewerIndex(null)}
          filename={redactionViewerItem?.filename ?? ''}
          resolveUrl={() => resolveDocUrl(redactionViewerItem)}
          onPrevious={
            redactionViewerIndex! > 0
              ? () => setRedactionViewerIndex(redactionViewerIndex! - 1)
              : undefined
          }
          onNext={
            redactionViewerIndex! < (redactionReports?.length ?? 0) - 1
              ? () => setRedactionViewerIndex(redactionViewerIndex! + 1)
              : undefined
          }
        />
      )}
      {showAttachmentViewer && (
        <FileViewer
          visible={showAttachmentViewer}
          onClose={() => setShowAttachmentViewer(false)}
          filename={reqDetails?.attachmentName ?? 'No attachment'}
          resolveUrl={() =>
            Promise.resolve(getCompleteAttachmentUrl(reqDetails?.attachments))
          }
        />
      )}
      <GenerateReportModal
        isVisible={showGenerateReportModal?.isVisible}
        onClose={() =>
          setShowGenerateReportModal({
            isVisible: false,
            value: null,
          })
        }
        item={showGenerateReportModal?.value}
        onGenerateReport={() => {}}
      />
    </View>
  );
};

export default FOIAReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    listRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: normalized(5),
      padding: normalized(6),
      borderWidth: 1,
      borderColor: lightenHexColor(colors.Grey_2, 0.4),
      borderRadius: normalized(8),
      minWidth: '49%',
      maxWidth: '49%',
    },
    threeColRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(8),
    },
    payBtnCont: {
      width: normalized(80),
      height: normalized(30),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(6),
    },
    innerRowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
    },
    payRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    paymentStatusCont: {
      height: normalized(23),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderRadius: normalized(25),
      paddingHorizontal: normalized(12),
    },
    paymentStatusTxt: {
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
    dateCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(20),
      marginHorizontal: normalized(50),
    },
    dateHeading: {
      color: colors.Black,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
    },
    updateBtnCont: {
      width: normalized(110),
      alignSelf: 'flex-end',
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Background,
    },
    reportCont: {
      width: normalized(40),
      height: normalized(40),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(20),
      borderWidth: 2,
      borderColor: colors.White,
    },
    docBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      padding: normalized(12),
      borderRadius: normalized(10),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    docTapArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
    },
    docIconWrap: {
      width: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    docDownloadBtn: {
      width: normalized(36),
      height: normalized(36),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
