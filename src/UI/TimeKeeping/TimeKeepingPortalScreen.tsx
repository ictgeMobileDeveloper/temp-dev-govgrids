import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import {DeviceEventEmitter} from 'react-native';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import MainHeader from '../Components/MainHeader';
import {Routes} from '../../Utils/Routes';
import ThemeModal from '../Modal/ThemeModal';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import CustomInput from '../Components/CustomInput';
import TimeKeepingButton from '../Components/TimeKeepingButton';
import BranchIcon from '../Svg/BranchIcon';
import ClockIcon from '../Svg/ClockIcon';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS, websocketUrl} from '../../Network/Urls';
import {
  setIsAlertShow,
  setShowToast,
  setTimeKeepingUserData,
} from '../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  AUTH_CONTEXT_CONFIG,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {getErrorMessage, resetToWelcomeAndHome} from '../../Utils/Helper';
import {
  WebSocketProvider,
  useWebSocket,
} from '../../Network/Services/WebSocketProvider';
import {removeSingleData} from '../../Utils/AsyncStorage';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';
import EmptyComp from '../Components/EmptyComp';
import {forceLogout} from '../../Network/Services/ForceLogout';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';
import CustomDrawer from '../Components/CustomDrawer';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useSessionExpirySocket} from '../../Network/Services/useSessionExpirySocket';
import {clearAuthContext} from '../../Network/Services/AuthTokenService';

const Comp = ({item}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.employee?.employeeId}</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor:
                item?.attendanceStatus === 'Clocked Out'
                  ? colors.ToastColors.Error
                  : colors.Primary,
            },
          ]}>
          <Text style={styles.statusTxt}>{item?.attendanceStatus}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Employee Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.employee?.firstName} ${item?.employee?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Hours</Text>
          <Text style={styles.valueTxt}>{item?.hours}</Text>
        </View>
      </View>

      <View style={[styles.row, {gap: normalized(12)}]}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Clock In</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.clockInTime).format('LLL')}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Clock Out</Text>
          {item?.clockOutTime && (
            <Text style={styles.valueTxt}>
              {moment(item?.clockOutTime).format('LLL')}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Site</Text>
        <Text style={styles.valueTxt}>{item?.site?.buildingName}</Text>
      </View>
    </View>
  );
};

/** --- Wrapper: provides WebSocket context --- */
const TimeKeepingPortalScreen = (props: ScreenProps) => {
  const selector = useSelector((s: AppRootStore) => s.SliceReducer);
  const userData = selector?.TimeKeepingUserData;
  const dispatch = useDispatch();

  const forceLogout = () => {
    resetToWelcomeAndHome(props.navigation, Routes.Staff.HomeScreen);
    dispatch(setTimeKeepingUserData(null));
    clearAuthContext('TIMEKEEPING');
    dispatch(
      setShowToast({
        type: AppStrings.ToastType.error,
        message: 'Token Expired, Please Login Again',
      }),
    );
  };

  useSessionExpirySocket({
    authContext: 'TIMEKEEPING',
    endpoint: SOCKET_ENDPOINTS.TKSession,
    label: 'TimeKeeping',
    dependencyKey: selector?.TimeKeepingUserData?.id,
    enabled: Boolean(selector?.TimeKeepingUserData?.id),
    onExpired: forceLogout,
  });

  // useEffect(() => {
  //   const endpoint = `${websocketUrl}${SOCKET_ENDPOINTS.TKSession}`;

  //   let handled = false;

  //   const onMessage = (data: any) => {
  //     const remaining = Number(data?.remainingSeconds);
  //     const timekeeping = data?.message;
  //     console.log(': TK : ', timekeeping, data?.status, remaining);

  //     if (remaining === 0 && !handled) {
  //       console.log('TK Logged Out----->>>>');

  //       handled = true;

  //       forceLogout({
  //         dispatch,
  //         navigation: props.navigation,
  //         authContext: 'TIMEKEEPING',
  //         homeRoute: Routes.Staff.HomeScreen,
  //       });

  //       sessionSocketRegistry.disconnect('TIMEKEEPING', endpoint);
  //     }
  //   };

  //   const connectSocket = () => {
  //     sessionSocketRegistry.connect('TIMEKEEPING', endpoint, onMessage);
  //   };

  //   const disconnectSocket = () => {
  //     sessionSocketRegistry.disconnect('TIMEKEEPING', endpoint);
  //   };

  //   // Initial connect
  //   connectSocket();

  //   // Handle app state changes
  //   const subscription = AppState.addEventListener('change', nextState => {
  //     if (nextState === 'active') {
  //       handled = false;
  //       connectSocket();
  //     } else if (nextState === 'background') {
  //       disconnectSocket();
  //     }
  //   });

  //   return () => {
  //     handled = true;
  //     disconnectSocket();
  //     sessionSocketRegistry.removeListener('TIMEKEEPING', endpoint, onMessage);
  //     subscription.remove();
  //   };
  // }, [selector?.TimeKeepingUserData]);

  return <TimeKeepingPortalScreenInner {...props} />;
};

export default TimeKeepingPortalScreen;

/** --- Inner: safe to use useWebSocket here --- */
const TimeKeepingPortalScreenInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const userData = selector?.TimeKeepingUserData;

  const [reportId, setReportId] = useState('');
  const [reportIdError, setReportIdError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [reportList, setReportList] = useState<any>([]);
  const [reportLoader, setReportLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<any>('');

  const {isBlocked} = useDeepLinkGuard(userData);
  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }
  // SAFE now: inside provider
  const {getUnreadCount, notifications, markAllAsRead} =
    useWebSocket('TIMEKEEPING');

  const buttonList = [
    {
      id: 1,
      icon: BranchIcon,
      text: 'Requests',
      route: Routes.TimeKeeping.RequestsScreen,
    },
    {
      id: 2,
      icon: ClockIcon,
      text: 'Hours',
      route: Routes.TimeKeeping.HoursScreen,
    },
  ];

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'NOTIFICATIONS_MARKED_READ',
      payload => {
        if (payload?.type === 'TIMEKEEPING') {
          markAllAsRead();
        }
      },
    );

    return () => sub.remove();
  }, [markAllAsRead]);

  useEffect(() => {
    getUserAttendance();
  }, [page]);

  useEffect(() => {
    if (reportId === '') getUserAttendance();
  }, [reportId]);

  const getUserAttendance = () => {
    page === 1 && setReportLoader(true);
    apiHandler({
      endpoint: ENDPOINTS.getUserAttendance,
      method: 'GET',
      queryParams: {page, pageSize: 10, query: reportId},
      authContext: 'TIMEKEEPING',
      onComplete: (resp: any) => {
        setTotalItems(resp?.data?.pagination?.totalItems);
        if (resp?.status) {
          setReportLoader(false);
          setSearchLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems);
          if (page === 1) {
            setReportList(resp?.data?.data?.data || []);
          } else {
            setReportList((prevList: any) => [
              ...prevList,
              ...resp?.data?.data?.data?.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem?.id === item?.id),
              ),
            ]);
          }
        } else {
          setReportLoader(false);
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

  const onTrack = () => {
    if (reportId === '') {
      setReportIdError('...');
      return;
    }
    setSearchLoader(true);
    setPage(1);
    getUserAttendance();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <MainHeader
        onNotiPress={() => {
          props?.navigation?.navigate(Routes.NotificationScreen, {
            type: 'TIMEKEEPING',
            initialNotifications: notifications,
          });
        }}
        onProfilePress={() =>
          props?.navigation?.navigate(Routes.SIR.ProfileScreen, {isTK: true})
        }
        name={`${userData?.firstName} ${userData?.lastName}`}
        unreadNoti={getUnreadCount()}
      />

      <FlatList
        data={[1, 2, 3, 4]}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        // ListHeaderComponent={() => (
        //     <ClockBlock time={selector?.tkTime?.logoutTime} />
        // )}
        renderItem={({item, index}) => (
          <>
            {index === 0 ? (
              <CustomButton
                text={'Submit New Request'}
                onPress={() =>
                  props?.navigation?.navigate(Routes.TimeKeeping.NewReqScreen)
                }
                RightIcon={ForwardArrowIcon}
                loading={false}
              />
            ) : index === 1 ? (
              <View style={styles.btnCont}>
                {buttonList.map((el: any, i: number) => (
                  <TimeKeepingButton
                    key={i}
                    item={el}
                    onPress={() => props?.navigation?.navigate(el?.route)}
                  />
                ))}
              </View>
            ) : index === 2 ? (
              <>
                <Text style={styles.trackTxt}>Search Report</Text>
                <View style={styles.reqCont}>
                  <View style={{flex: 1}}>
                    <CustomInput
                      placeholder="Enter Report ID"
                      placeholderColor={colors.Heading_Txt}
                      value={reportId}
                      setValue={(v: string) => {
                        setReportIdError('');
                        setReportId(v);
                      }}
                      errorMsg={reportIdError}
                    />
                  </View>
                  <View
                    style={{
                      width: normalized(65),
                      marginBottom: normalized(3),
                    }}>
                    <CustomButton
                      text={'Search'}
                      onPress={onTrack}
                      loading={searchLoader}
                      style={{marginTop: 0}}
                    />
                  </View>
                </View>
              </>
            ) : index === 3 ? (
              <>
                <Text style={styles.headTxt}>Reports</Text>

                {reportList?.length === 0 && reportLoader ? (
                  <View style={styles.loaderCont}>
                    <ActivityIndicator color={colors.Primary} size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={reportList}
                    keyExtractor={(item, index) => String(item?.id ?? index)}
                    style={{
                      marginTop: normalized(10),
                      marginBottom: normalized(30),
                      gap: normalized(12),
                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => <Comp item={item} />}
                    ListFooterComponent={() =>
                      reportList?.length < totalItems ? (
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
                    onEndReachedThreshold={0.2}
                    onEndReached={() => {
                      if (!reportLoader && reportList?.length < totalItems) {
                        setPage(prev => prev + 1);
                      }
                    }}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyCont}>
                        <EmptyComp
                          type={Empty_Screen_Type.Report}
                          subText="No Reports Found"
                        />
                      </View>
                    )}
                  />
                )}
              </>
            ) : null}
          </>
        )}
      />
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    headingTxt: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.InterExtraBold,
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
      marginBottom: normalized(3),
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
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // (styles used by Comp)
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusCont: {
      paddingHorizontal: normalized(8),
      paddingVertical: normalized(4),
      borderRadius: normalized(6),
    },
    statusTxt: {
      color: 'white',
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(12),
    },
    nameTxt: {
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
    row: {
      flexDirection: 'row',
      gap: normalized(12),
      marginTop: normalized(8),
    },
    item: {
      flex: 1,
    },
    keyTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(12),
      color: colors.Desc_Txt,
    },
    valueTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
    itemCont: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      padding: normalized(12),
      marginTop: normalized(12),
      backgroundColor: colors.Card_Bg ?? 'transparent',
    },
    emptyCont: {
      height: ScreenSize.height * 0.55,
    },
  });
