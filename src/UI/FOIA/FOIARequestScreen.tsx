import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated as RNAnimated,
  Easing,
  ScrollViewInstance,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {
  AppColors,
  AppFonts,
  normalized,
  Payment_Status,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import {Routes} from '../../Utils/Routes';
import CustomInput from '../Components/CustomInput';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import FOIACard from '../Components/FOIACard';
import {setIsLoader, setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
  lightenHexColor,
} from '../../Utils/Helper';
import {useIsFocused} from '@react-navigation/native';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import AttachmentIcon from '../Svg/AttachmentIcon';
import {handleFileDownload} from '../../Utils/DownloadHelper';
import moment from 'moment';
import CustomCheckBox from '../Components/CustomCheckBox';
import DownloadIcon from '../Svg/DownloadIcon';
import DocumentIcon from '../Svg/DocumentIcon';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import WordIcon from '../Svg/WordIcon';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {paymentIntentReq} from '../../Network/Services/StripeServices';
import GenerateReportModal from '../Components/GenerateReportModal';
import SecurityIcon from '../Svg/SecurityIcon';
import PhoneIcon from '../Svg/PhoneIcon';
import CarIcon from '../Svg/CarIcon';
import PoliceReportIcon from '../Svg/PoliceReportIcon';
import CameraIcon from '../Svg/CameraIcon';
import GalleryIcon from '../Svg/GalleryIcon';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import DropDownIcon from '../Svg/DropDownIcon';
import CustomDrawer from '../Components/CustomDrawer';
import TopRightArrowIcon from '../Svg/TopRightArrowIcon';
import OfflineIcon from '../Svg/OfflineIcon';
import LinearGradient from 'react-native-linear-gradient';
import EmptyComp from '../Components/EmptyComp';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useFocusRefresh} from '../../Network/Services/FocusRefresh';
import {PaymentAlert} from '../Components/ConfirmationModal';

const PaymentItem = ({
  release,
  index,
  isOpen,
  colors,
  openIndex,
  setOpenIndex,
  onOpenReportModal,
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
          : lightenHexColor(colors.Primary, 0.6),
        marginTop: normalized(12),
      }}>
      <View style={styles.payRow}>
        <Text style={styles.nameTxt}>{release?.releaseId}</Text>
        <View style={styles.innerRowCont}>
          {payment?.status != 'Fulfilled' ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={onPay}
              style={styles.payBtnCont}>
              <Text style={styles.btnTxt}>Pay Now</Text>
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
              <DropDownIcon width={24} height={24} />
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

const FOIARequestScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();

  const [requestId, setRequestId] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [requestIdError, setRequestIdError] = useState('');
  const [securityKeyError, setSecurityKeyError] = useState('');
  const [historyLoader, setHistoryLoader] = useState(false);
  const [searchLoader, setSearchLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [historyList, setHistoryList] = useState<any>([]);
  const [isFetched, setIsFetched] = useState(false);
  const [totalItems, setTotalItems] = useState<any>('');
  const [keyHide, setKeyHide] = useState(true);
  const [trackData, setTrackData] = useState<any>(null);
  const [urls, setUrls] = useState<any>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState({
    isVisible: false,
    value: null,
  });
  const [queryParams, setQueryparams] = useState({});

  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();
  const isResidentLoggedin = selector?.residentUserData;

  const fetchReqHistory = ({silent = false} = {}) => {
    if (!selector?.residentUserData) {
      setRefreshing(false);
      return;
    }
    if (!silent) setHistoryLoader(true);
    historyList?.length == 0 && setHistoryLoader(true);
    apiHandler({
      endpoint: ENDPOINTS.RequestHistory,
      method: 'GET',
      token: selector?.residentUserData?.token,
      queryParams: {page, pageSize: 5, ...queryParams},
      ...(selector?.residentUserData && {
        authContext: 'RESIDENT',
      }),
      onComplete: (resp: any) => {
        setRefreshing(false);
        if (resp?.status) {
          setHistoryLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems);
          setIsFetched(false);
          if (page == 1) {
            setHistoryList(resp?.data?.data?.data || []);
          } else {
            setHistoryList((prevList: any) => [
              ...prevList,
              ...resp?.data?.data?.data?.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem.id == item.id),
              ),
            ]);
          }
        } else {
          setHistoryLoader(false);
          setIsFetched(false);
        }
      },
    });
  };
  useFocusRefresh(fetchReqHistory, [page, queryParams]);
  const onRefresh = () => {
    setRefreshing(true);
    if (!selector?.residentUserData) {
      setRefreshing(false);
      return;
    }
    if (page !== 1) {
      setPage(1);
      return;
    }
    fetchReqHistory();
  };

  const onTrack = async () => {
    let isFormValid = true;

    if (!requestId) {
      setRequestIdError('.');
      isFormValid = false;
    }
    if (!securityKey) {
      isFormValid = false;
      setSecurityKeyError('.');
    }

    if (!isFormValid) return;

    const params = {
      requestReference: requestId,
      securityKey: securityKey,
    };
    setSearchLoader(true);

    apiHandler({
      endpoint: ENDPOINTS.trackRequest,
      method: 'POST',
      payload: params,
      authContext: 'RESIDENT',
      useRecaptcha: true,
      recaptchaAction: 'signup',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setSearchLoader(false);
          console.log('FIOA Tracking', resp);

          props?.navigation?.navigate(Routes.FOIA.ReqDetailScreen, {
            data: resp?.data?.data,
            isTracked: true,
          });
          setIsLoader(false);
        } else {
          setSearchLoader(false);
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

  const onDownload = async (attachments: any) => {
    await handleFileDownload(attachments, selector?.residentUserData, dispatch);
  };

  const reqList = [
    {label: 'CAD Report', value: trackData?.cadReport, icon: SecurityIcon},
    {label: '911Calls', value: trackData?.calls911, icon: PhoneIcon},
    {label: 'Dash Cam Video', value: trackData?.dashCamVideo, icon: CarIcon},
    {
      label: 'Police Report',
      value: trackData?.policeReport,
      icon: PoliceReportIcon,
    },
    {
      label: 'Body Worn Camera',
      value: trackData?.bodyWornCamera,
      icon: CameraIcon,
    },
    {
      label: 'Surveillance Video',
      value: trackData?.surveillanceVideo,
      icon: EyeIcon,
    },
    {label: 'Photographs', value: trackData?.photographs, icon: GalleryIcon},
  ];

  const sortedReqList = [
    ...reqList?.filter((item: any) => item.value === true),
    ...reqList?.filter((item: any) => item.value === false),
  ];

  const onPayment = async (id: any) => {
    if (Platform.OS == 'ios') {
      try {
        await paymentIntentReq(
          {releaseId: id},
          'RESIDENT',
          ENDPOINTS.foiaPaymentIntent,
          async (response: any) => {
            console.log('paymentIntent API Response:', response);
            const {error} = await initPaymentSheet({
              merchantDisplayName: 'FOIA',
              paymentIntentClientSecret: response?.clientSecret,
              allowsDelayedPaymentMethods: false,
            });

            if (!error) {
              openPaymentSheet();
            } else {
              PaymentAlert.show('Stripe Init Error', error.message);
            }
          },
        );
      } catch (err) {
        console.log('PaymentSheet Init Error:', err);
        PaymentAlert.show(
          'Error',
          'Something went wrong initializing payment sheet.',
        );
      }
    } else {
      props?.navigation?.navigate(Routes.Payment.paymentScreen, {
        releaseId: id,
      });
    }
  };

  const openPaymentSheet = async () => {
    const {error} = await presentPaymentSheet();

    if (error) {
      PaymentAlert.show('Payment Failed', error.message);
    } else {
      PaymentAlert.show('Success', 'Payment completed!');
    }
  };

  const generateUrl = (obj: any) => {
    dispatch(setIsLoader(true));
    apiHandler({
      endpoint: ENDPOINTS.generateSignedUrl,
      method: 'GET',
      queryParams: {
        requestId: obj?.requestId,
        documentId: obj?.documentId,
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          dispatch(setIsLoader(false));
          onDownload({
            url: resp?.data?.signedURL,
            name: obj?.filename,
            isCompleteUrl: true,
          });
        } else {
          dispatch(setIsLoader(false));
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
        text={'Online FOIA Requests'}
        onSidePanel={selector?.residentUserData ? openDrawer : undefined}
        // RightIcon={
        //   <LinearGradient
        //     colors={[colors.Primary, colors.Secondary]}
        //     style={styles.sidePanelCont}>
        //     <TouchableOpacity
        //       activeOpacity={1}
        //       onPress={() =>
        //         props?.navigation?.navigate(Routes.FOIA.OfflineReqScreen)
        //       }>
        //       <OfflineIcon />
        //     </TouchableOpacity>
        //   </LinearGradient>
        // }
      />
      <FlatList
        data={[1, 2, 3, 4, 5]}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.Primary}
            colors={[colors.Primary]}
          />
        }
        renderItem={({item, index}) => (
          <>
            {index === 0 ? (
              <CustomButton
                text={'Submit New Request'}
                onPress={() => {
                  props?.navigation?.navigate(Routes.FOIA.NewReqScreen);
                }}
                RightIcon={ForwardArrowIcon}
                loading={false}
              />
            ) : index == 2 ? (
              <>
                <Text style={styles.trackTxt}>Track Request</Text>
                <View style={[styles.rowCont, {gap: normalized(10)}]}>
                  <View style={{flex: 1}}>
                    <CustomInput
                      placeholder="Request ID"
                      placeholderColor={colors.Heading_Txt}
                      value={requestId}
                      setValue={(val: any) => {
                        setRequestId(val);
                        setRequestIdError('');
                      }}
                      errorMsg={requestIdError}
                    />
                  </View>
                  {/* <View style={{height: normalized(10)}} /> */}
                  <View style={{flex: 1}}>
                    <CustomInput
                      placeholder="Security Key"
                      placeholderColor={colors.Heading_Txt}
                      value={securityKey}
                      setValue={(val: any) => {
                        setSecurityKey(val);
                        setSecurityKeyError('');
                      }}
                      RightIcon={keyHide ? EyeIcon : HideEyeIcon}
                      onRightIconPress={() => {
                        setKeyHide((prev: any) => !prev);
                      }}
                      secureEntry={keyHide}
                      errorMsg={securityKeyError}
                    />
                  </View>
                </View>
                <View
                  style={{
                    // width: normalized(55),
                    marginVertical: normalized(7),
                  }}>
                  <CustomButton
                    text={'Track'}
                    onPress={onTrack}
                    loading={searchLoader}
                    style={{marginTop: 0}}
                  />
                </View>
                {/* </View> */}
              </>
            ) : index == 3 ? (
              <>
                {historyList?.length > 0 && (
                  <Text style={styles.headTxt}>History</Text>
                )}
                <FlatList
                  data={historyList}
                  keyExtractor={(item, index) => item?.id ?? index.toString()}
                  style={{
                    marginTop: normalized(10),
                    marginBottom: historyList?.length > 0 ? normalized(30) : 0,
                    gap: normalized(12),
                  }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item}) => (
                    <FOIACard
                      item={item}
                      onPress={() =>
                        props?.navigation?.navigate(
                          Routes.FOIA.ReqDetailScreen,
                          {data: item},
                        )
                      }
                    />
                  )}
                  onEndReachedThreshold={0.2}
                  onEndReached={() => {
                    if (!historyLoader && historyList.length < totalItems) {
                      setPage(prev => prev + 1);
                    }
                  }}
                  ListEmptyComponent={() =>
                    historyLoader ? (
                      <View style={styles.emptyCont}>
                        <ActivityIndicator
                          size="large"
                          color={colors.Primary}
                        />
                      </View>
                    ) : !trackData && isResidentLoggedin ? (
                      <View style={styles.emptyCont}>
                        <EmptyComp
                          type={Empty_Screen_Type.List}
                          subText="No Request Found"
                        />
                      </View>
                    ) : null
                  }
                  ListFooterComponent={() =>
                    historyList.length < totalItems ? (
                      <View
                        style={{
                          height: normalized(20),
                          marginTop: normalized(12),
                        }}>
                        <ActivityIndicator
                          size="large"
                          color={colors.Primary}
                        />
                      </View>
                    ) : (
                      <View style={{height: normalized(10)}} />
                    )
                  }
                />
                {/* // )} */}
              </>
            ) : (
              <>
                {index == 4 && trackData && (
                  <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      // paddingHorizontal: normalized(20),
                      paddingBottom: normalized(30),
                    }}>
                    {/* // ---------- first */}

                    <View style={styles.itemCont}>
                      <Text style={styles.nameTxt}>Request Details</Text>

                      <View style={styles.row}>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>
                            {'Request Form Type'}
                          </Text>
                          <Text style={styles.valueTxt}>
                            {trackData?.formType == 'publicSafetyRequest'
                              ? 'Public Safety Request'
                              : 'City Hall Request'}
                          </Text>
                        </View>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>{'Status'}</Text>
                          <View style={{maxWidth: normalized(170)}}>
                            <View
                              style={[
                                styles.statusCont,
                                {
                                  backgroundColor:
                                    getStatusColor(
                                      trackData?.status ?? '',
                                      colors,
                                    ) ?? AppColors.ToastColors.Alarm,
                                  // alignSelf: 'flex-start'
                                },
                              ]}>
                              <Text style={styles.statusTxt}>
                                {capitalizeEachWord(trackData?.status)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={{height: normalized(3)}} />

                      <View style={[styles.row, {gap: normalized(10)}]}>
                        <View style={[styles.item, {flex: 1}]}>
                          <Text style={styles.keyTxt}>{'Attachments'}</Text>
                          <TouchableOpacity
                            activeOpacity={1}
                            style={[
                              styles.rowCont,
                              {gap: normalized(8), flex: 1},
                            ]}
                            onPress={() => {
                              onDownload({
                                url: trackData?.attachments,
                                name: trackData?.attachmentName,
                              });
                            }}>
                            <AttachmentIcon
                              primary={
                                selector?.isDarkTheme
                                  ? colors.White
                                  : colors.Black
                              }
                              width={16}
                              height={16}
                            />
                            <Text
                              style={[
                                styles.valueTxt,
                                {color: colors.Primary, flex: 1},
                              ]}>
                              {trackData?.attachmentName}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>{'Request Date'}</Text>
                          <Text style={styles.valueTxt}>
                            {moment(trackData?.date).format('LL')}
                          </Text>
                        </View>
                      </View>

                      <View style={{height: normalized(3)}} />

                      <View style={styles.item}>
                        <Text style={styles.keyTxt}>{'Description'}</Text>
                        <Text style={styles.valueTxt}>
                          {trackData?.descriptionOfRequest}
                        </Text>
                      </View>
                    </View>

                    {/* -------------------- Second block  */}
                    {trackData?.formType == 'publicSafetyRequest' && (
                      <>
                        <View style={{height: normalized(12)}} />
                        <View style={styles.itemCont}>
                          <Text style={styles.nameTxt}>
                            Public Safety Details
                          </Text>

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

                                <item.icon width={18} height={18} />

                                <View style={{flex: 1}}>
                                  <Text style={styles.valueTxt}>
                                    {item?.label}
                                  </Text>
                                </View>
                              </View>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                          />

                          <View style={styles.threeColRow}>
                            <View style={styles.item}>
                              <Text style={styles.keyTxt}>
                                {'Police Case Number'}
                              </Text>
                              <Text style={styles.valueTxt}>
                                {trackData?.policeCaseNumber ?? 'N/A'}
                              </Text>
                            </View>

                            <View style={styles.item}>
                              <Text style={styles.keyTxt}>{'Office Name'}</Text>
                              <Text style={styles.valueTxt}>
                                {trackData?.officeName
                                  ? trackData?.officeName
                                  : 'N/A'}
                              </Text>
                            </View>

                            <View style={styles.item}>
                              <Text style={styles.keyTxt}>{'Client Name'}</Text>
                              <Text style={styles.valueTxt}>
                                {trackData?.clientName
                                  ? trackData?.clientName
                                  : 'N/A'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.threeColRow}>
                            <View style={styles.item}>
                              <Text style={styles.keyTxt}>
                                {'Incident Date'}
                              </Text>
                              <Text style={styles.valueTxt}>
                                {trackData?.incidentDate
                                  ? moment(trackData?.incidentDate).format('LL')
                                  : 'N/A'}
                              </Text>
                            </View>

                            <View style={styles.item}>
                              <Text style={styles.keyTxt}>
                                {'Incident Time'}
                              </Text>
                              <Text style={styles.valueTxt}>
                                {trackData?.incidentTime
                                  ? trackData?.incidentTime
                                  : 'N/A'}
                              </Text>
                            </View>

                            <View style={styles.item}>
                              <Text style={styles.keyTxt}>{'Other'}</Text>
                              <Text style={styles.valueTxt}>
                                {trackData?.other ? trackData?.other : 'N/A'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    )}
                    {/* ----------------------- third block payments  */}

                    {trackData?.documentReleases?.length > 0 && (
                      <>
                        <View style={{height: normalized(12)}} />
                        <View style={styles.itemCont}>
                          <Text style={styles.nameTxt}>Payment Details</Text>
                          {trackData.documentReleases.map(
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
                                  onPay={() => onPayment(release?.id)}
                                  onOpenReportModal={() =>
                                    setShowGenerateReportModal({
                                      isVisible: true,
                                      value: {
                                        ...release,
                                        name: `${trackData?.firstName} ${trackData?.lastName}`,
                                        address: trackData?.address,
                                        phoneNumber: trackData?.phoneNumber,
                                        receiptId: `${release?.releaseId}-${trackData?.requestReference}`,
                                        requestId: trackData?.requestReference,
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

                    {/* ----------------------- fourth block Documents  */}

                    {urls?.length > 0 && (
                      <>
                        <View style={{height: normalized(12)}} />
                        <View style={styles.itemCont}>
                          <Text style={styles.nameTxt}>Request Documents</Text>

                          {urls.map((item: any, index: number) => {
                            const type = item?.filename?.split('.').pop();
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.docBlock,
                                  {marginTop: normalized(8)},
                                ]}>
                                {type == 'pdf' ? (
                                  <PdfIcon />
                                ) : type == 'xls' ? (
                                  <ExcelIcon />
                                ) : type == 'doc' || type == 'docx' ? (
                                  <WordIcon />
                                ) : (
                                  <DocumentIcon
                                    width={30}
                                    height={30}
                                    primary={colors.Desc_Txt}
                                  />
                                )}
                                <View style={styles.filenameCont}>
                                  <Text style={styles.nameTxt}>
                                    {item?.filename}
                                  </Text>
                                  <Text>{item?.filename}</Text>
                                </View>
                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={() => {
                                    generateUrl({
                                      requestId: trackData?.id,
                                      documentId: item?.id,
                                      filename: item?.filename,
                                    });
                                  }}>
                                  <DownloadIcon
                                    primary={colors.Desc_Txt}
                                    width={40}
                                    height={40}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
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
                          <Text
                            style={
                              styles.valueTxt
                            }>{`${trackData?.firstName} ${trackData?.lastName}`}</Text>
                        </View>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>{'Email'}</Text>
                          <Text style={styles.valueTxt}>
                            {trackData?.email}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>{'Phone Number'}</Text>
                          <Text style={styles.valueTxt}>
                            {trackData?.phoneNumber}
                          </Text>
                        </View>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>{'Address'}</Text>
                          <Text style={styles.valueTxt}>
                            {trackData?.address}
                          </Text>
                        </View>
                      </View>

                      {trackData?.addressLine2 && (
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>{'Address Line 2'}</Text>
                          <Text style={styles.valueTxt}>
                            {trackData?.addressLine2}
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                )}
              </>
            )}
          </>
        )}
      />

      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        overlayAnim={overlayAnim}
        onClose={closeDrawer}
        hideSearchBar={false}
        paymentStatusParamKey="requestPaymentStatus"
        paymentStatusList={Payment_Status}
        topOffset={insects.top + normalized(Platform.OS == 'ios' ? 36 : 52)}
        closeDrawer={closeDrawer}
        onApply={(queryString: any, params: any) => {
          setQueryparams(params);
          setPage(1);
        }}
      />

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

export default FOIARequestScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    btnCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      marginTop: normalized(12),
    },
    trackTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(12),
      marginBottom: normalized(10),
    },
    reqCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      width: '100%',
      justifyContent: 'center',
    },
    headTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(5),
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
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
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    docBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      padding: normalized(10),
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    payRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    sidePanelCont: {
      width: normalized(36),
      height: normalized(36),
      borderRadius: normalized(10000),
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCont: {
      height: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
