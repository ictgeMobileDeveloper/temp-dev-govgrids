import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import {DeviceEventEmitter} from 'react-native';
import moment from 'moment';

import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import MainHeader from '../Components/MainHeader';
import {Routes} from '../../Utils/Routes';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import CustomInput from '../Components/CustomInput';
import ThemeModal from '../Modal/ThemeModal';

import {
  apiHandler,
  hasValidAccessToken,
  resolveAccessToken,
} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS, websocketUrl} from '../../Network/Urls';
import {
  setIsAlertShow,
  setShowToast,
  setSIRUserData,
} from '../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  AuthContext,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {getErrorMessage, resetToWelcomeAndHome} from '../../Utils/Helper';

// WebSocket
import {
  useWebSocket,
  WebSocketProvider,
} from '../../Network/Services/WebSocketProvider';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';
import {removeSingleData} from '../../Utils/AsyncStorage';
import EmptyComp from '../Components/EmptyComp';
import LinearGradient from 'react-native-linear-gradient';
import OfflineIcon from '../Svg/OfflineIcon';
import {
  clearAuthContext,
  subscribeAuthTokenChange,
} from '../../Network/Services/AuthTokenService';
import {useSessionExpirySocket} from '../../Network/Services/useSessionExpirySocket';
import {forceLogout} from '../../Network/Services/ForceLogout';
import CustomDrawer from '../Components/CustomDrawer';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useFocusRefresh} from '../../Network/Services/FocusRefresh';

const Comp = ({item, onPress}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.itemCont}>
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.reportId}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Security Guard Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.securityGuard?.firstName} ${item?.securityGuard?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Responding Officer</Text>
          <Text style={styles.valueTxt}>{item?.respondingOfficer}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Date Occurred</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.dateOccurred).format('LL')}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Date Reported</Text>
          <Text style={styles.valueTxt}>
            {moment(item?.dateReported).format('LL')}
          </Text>
        </View>
      </View>

      <View style={styles.item}>
        <Text style={styles.keyTxt}>Incident Type</Text>
        <Text style={styles.valueTxt}>{item?.incidentType}</Text>
      </View>
    </TouchableOpacity>
  );
};

/** Wrapper puts the WebSocketProvider *outside* the screen that uses the hook */
const SIRHomeScreen = (props: ScreenProps) => {
  const selector = useSelector((s: AppRootStore) => s.SliceReducer);
  const userData = selector?.SIRUserData;

  return <SIRHomeScreenInner {...props} />;
};

export default SIRHomeScreen;

/** Inner screen safely calls useWebSocket() */
const SIRHomeScreenInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const userData = selector?.SIRUserData;
  const isOnline = selector?.isNetConnected;

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [reportId, setReportId] = useState('');
  const [reportIdError, setReportIdError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [reportList, setReportList] = useState<any[]>([]);
  const [reportLoader, setReportLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  // useEffect(() => {
  //   const sub = DeviceEventEmitter.addListener(
  //     'NOTIFICATIONS_MARKED_READ',
  //     payload => {
  //       if (payload?.type === 'SIR') {
  //         markAllAsRead();
  //       }
  //     },
  //   );

  //   return () => sub.remove();
  // }, [markAllAsRead]);

  // useEffect(() => {
  //   if (!isFocused) return;
  //   setReportLoader(true);
  //   const timer = setTimeout(() => {
  //     setPage(1);
  //     getReports(1);
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [reportId, isFocused]);

  // useEffect(() => {
  //   if (page > 1) {
  //     getReports(page);
  //   }
  // }, [page]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);

    getReports(1, {silent: true});
    setRefreshing(false);
  };

  const getReports = (pageNumber = page, {silent = false} = {}) => {
    if (!isOnline || !selector?.SIRUserData?.id) return;

    if (pageNumber === 1 && !silent) {
      setReportLoader(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.reportsHistory,
      method: 'GET',
      queryParams: {
        page: pageNumber,
        pageSize: 10,
        query: reportId,
      },
      authContext: 'SIR',
      onComplete: (resp: any) => {
        setRefreshing(false);

        if (resp?.status) {
          setReportLoader(false);
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);

          if (pageNumber === 1) {
            setReportList(resp?.data?.data?.data || []);
          } else {
            setReportList(prevList => [
              ...prevList,
              ...resp?.data?.data?.data?.filter(
                (item: any) => !prevList.some(p => p?.id === item?.id),
              ),
            ]);
          }
        } else {
          setReportLoader(false);

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

  useEffect(() => {
    if (page > 1) {
      getReports(page);
    }
  }, [page]);

  const debounceTimerRef = useRef<any>(null);

  const debouncedFetch = ({silent = false} = {}) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => {
        if (!silent) setPage(1);
        getReports(1, {silent});
      },
      silent ? 0 : 500,
    );
  };

  useFocusRefresh(debouncedFetch, [reportId]);

  const onTrack = () => {
    if (reportId.trim() === '') {
      setReportIdError('...');
      return;
    }
    // new search: reset to page 1 then fetch
    setReportIdError('');
    setSearchLoader(true);
    setPage(1);
    getReports();
  };

  const handleForceLogout = () => {
    forceLogout({
      dispatch,
      navigation: props.navigation,
      authContext: 'SIR',
      homeRoute: Routes.Staff.HomeScreen,
    });
  };

  useSessionExpirySocket({
    authContext: 'SIR',
    endpoint: SOCKET_ENDPOINTS.SIRSession,
    label: 'SIR',
    dependencyKey: selector?.SIRUserData?.id,
    enabled: Boolean(selector?.SIRUserData?.id),
    onExpired: handleForceLogout,
  });

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
        onProfilePress={() =>
          props?.navigation?.navigate(Routes.SIR.ProfileScreen, {
            isSIR: true,
          })
        }
        name={
          isOnline
            ? `${userData?.firstName} ${userData?.lastName}`
            : 'Guest User'
        }
        img={userData?.profilePicture ? userData?.profilePicture : null}
        hideNoti={true}
      />

      <FlatList
        data={[1, 2, 3]}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => {
          setPage(1);
          getReports(1, {silent: true});
        }}
        renderItem={({index}) => (
          <>
            {index === 0 ? (
              <CustomButton
                text={
                  isOnline ? 'Submit New Request' : 'Submit Offline Request'
                }
                onPress={() =>
                  props?.navigation?.navigate(Routes.SIR.NewReqScreen)
                }
                RightIcon={ForwardArrowIcon}
                loading={false}
              />
            ) : index === 1 && isOnline ? (
              <>
                <Text style={styles.trackTxt}>Track Report</Text>
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
                  {/* <View
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
                  </View> */}
                </View>
              </>
            ) : index === 2 ? (
              <>
                <View style={[styles.rowCont, {marginTop: normalized(15)}]}>
                  <Text style={styles.headTxt}>Reports</Text>
                  {/* <LinearGradient
                    colors={[colors.Primary, colors.Secondary]}
                    style={styles.sidePanelCont}>
                    <TouchableOpacity activeOpacity={1} onPress={openDrawer}>
                      <SideFilterIcon />
                    </TouchableOpacity>
                  </LinearGradient> */}
                </View>

                {reportList.length === 0 && reportLoader ? (
                  <View style={styles.loaderCont}>
                    <ActivityIndicator color={colors.Primary} size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={reportList}
                    keyExtractor={(item, idx) => String(item?.id ?? idx)}
                    style={{
                      marginTop: normalized(10),
                      marginBottom: normalized(30),
                      gap: normalized(12),
                    }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => (
                      <Comp
                        item={item}
                        onPress={() =>
                          props?.navigation?.navigate(
                            Routes.SIR.ReqDetailScreen,
                            {item: item},
                          )
                        }
                      />
                    )}
                    ListFooterComponent={() =>
                      page * 10 < totalItems ? (
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
                      if (!reportLoader && page * 10 < totalItems) {
                        setPage(prev => prev + 1);
                      }
                    }}
                    ListEmptyComponent={() => (
                      <View style={styles.emptyCont}>
                        <EmptyComp
                          type={Empty_Screen_Type.Report}
                          subText="No Report Found"
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
    // Used by Comp:
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      height: ScreenSize.height * 0.7,
    },
  });
