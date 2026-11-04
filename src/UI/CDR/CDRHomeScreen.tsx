import {
  ActivityIndicator,
  AppState,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import CustomInput from '../Components/CustomInput';
import {DeviceEventEmitter} from 'react-native';
import CustomDropDownList from '../Components/CustomDropDownList';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppFonts,
  CDR_Status_List,
  IS_TABLET_DEVICE,
  normalized,
  ScreenProps,
  ScreenSize,
  sortingList,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import MainHeader from '../Components/MainHeader';
import {Routes} from '../../Utils/Routes';
import CustomButton from '../Components/CustomButton';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';
import ThemeModal from '../Modal/ThemeModal';
import {useIsFocused} from '@react-navigation/native';
import {
  apiHandler,
  hasValidAccessToken,
  resolveAccessToken,
} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS, websocketUrl} from '../../Network/Urls';
import {
  setCDRUserData,
  setIsAlertShow,
  setShowToast,
} from '../../Redux/AppReducers';
import {
  AppStrings,
  AsyncKeyStrings,
  AuthContext,
  Empty_Screen_Type,
} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
  resetToWelcomeAndHome,
} from '../../Utils/Helper';
import moment from 'moment';
import {
  useWebSocket,
  WebSocketProvider,
} from '../../Network/Services/WebSocketProvider';
import CustomDrawer from '../Components/CustomDrawer';
import ClockBlock from '../Components/ClockBlock';
import {removeSingleData} from '../../Utils/AsyncStorage';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';
import EmptyComp from '../Components/EmptyComp';
import OfflineIcon from '../Svg/OfflineIcon';
import LinearGradient from 'react-native-linear-gradient';
import SideFilterIcon from '../Svg/SideFilterIcon';
import {
  clearAuthContext,
  subscribeAuthTokenChange,
} from '../../Network/Services/AuthTokenService';
import {useSessionExpirySocket} from '../../Network/Services/useSessionExpirySocket';
import {forceLogout} from '../../Network/Services/ForceLogout';
import {useDrawer} from '../../Hooks/DrawerAnimation';
import {useFocusRefresh} from '../../Network/Services/FocusRefresh';

/* ------------ Item component ------------ */
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
        <Text style={styles.nameTxt}>{item?.requestId}</Text>
        <View
          style={[
            styles.statusCont,
            {
              backgroundColor: getStatusColor(item?.status, colors),
              alignSelf: 'flex-start',
            },
          ]}>
          <Text style={styles.statusTxt}>
            {capitalizeEachWord(item?.status)}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Requester&apos;s Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.requesterUser?.firstName} ${item?.requesterUser?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Email</Text>
          <Text
            style={[
              styles.valueTxt,
              {fontSize: IS_TABLET_DEVICE ? normalized(14) : normalized(12)},
            ]}>
            {item?.requesterUser?.email}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Submission Date</Text>
          <Text style={styles.valueTxt}>
            {item?.requestDate ? moment(item?.requestDate).format('LL') : 'N/A'}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Archive Date</Text>
          <Text style={styles.valueTxt}>
            {item?.expireAt ? moment(item?.expireAt).format('LL') : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ------------ Wrapper: provides WS context ------------ */
const CDRHomeScreen = (props: ScreenProps) => {
  return <CDRHomeScreenInner {...props} />;
};

export default CDRHomeScreen;

const CDRHomeScreenInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const userData = selector?.CDRUserData;
  const isOnline = selector?.isNetConnected;
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const [requestId, setRequestId] = useState('');
  const [requestIdError, setRequestIdError] = useState('');
  const [searchLoader, setSearchLoader] = useState(false);
  const [requestList, setRequestList] = useState<any[]>([]);
  const [requestLoader, setRequestLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sortIndex, setSortIndex] = useState<any>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const [queryParams, setQueryParams] = useState<Record<string, any>>({});

  const {getUnreadCount, notifications, markAllAsRead} = useWebSocket('CDR');

  // console.log('CDR notification', notifications);

  const {isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer} =
    useDrawer();
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'NOTIFICATIONS_MARKED_READ',
      payload => {
        if (payload?.type === 'CDR') {
          markAllAsRead();
        }
      },
    );

    return () => sub.remove();
  }, [markAllAsRead]);

  // useEffect(() => {
  //   if (page > 1) {
  //     getReqHistory(page);
  //   }
  // }, [page]);

  // useEffect(() => {
  //   if (!isFocused || !isOnline) return;

  //   const timer = setTimeout(() => {
  //     setPage(1);
  //     getReqHistory(1);
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [requestId, sortIndex, queryParams, isFocused]);
  const getReqHistory = (pageNumber = page, {silent = false} = {}) => {
    if (!isOnline) return;

    if (pageNumber === 1 && !silent) {
      setRequestLoader(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.getReqOnPublic,
      method: 'GET',
      queryParams: {
        page: pageNumber,
        pageSize: 10,
        query: requestId,
        sort: sortingList[sortIndex]?.key ? sortingList[sortIndex]?.key : '',
        ...queryParams,
      },
      authContext: 'CDR',
      onComplete: (resp: any) => {
        setRequestLoader(false);
        setSearchLoader(false);
        setInitialLoadComplete(true);
        setRefreshing(false);

        if (resp?.status) {
          setTotalItems(resp?.data?.pagination?.totalItems ?? 0);
          const payload = resp?.data?.data;
          const data = Array.isArray(payload?.data) ? payload.data : [];

          if (pageNumber === 1) {
            setRequestList(data);
          } else {
            setRequestList(prev => [
              ...prev,
              ...data.filter(
                (it: any) =>
                  !prev.some(
                    (p: any) => (p?.id ?? p?.NO) === (it?.id ?? it?.NO),
                  ),
              ),
            ]);
          }
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

  useEffect(() => {
    if (page > 1) {
      getReqHistory(page);
    }
  }, [page]);

  const debouncedFetch = ({silent = false} = {}) => {
    if (!isOnline) return;
    const timer = setTimeout(
      () => {
        if (!silent) setPage(1);
        getReqHistory(1, {silent});
      },
      silent ? 0 : 500,
    );
    return () => clearTimeout(timer);
  };
  useFocusRefresh(debouncedFetch, [requestId, sortIndex, queryParams]);
  const handleForceLogout = () => {
    forceLogout({
      dispatch,
      navigation: props.navigation,
      authContext: 'CDR',
      homeRoute: Routes.Staff.HomeScreen, // optional — omit for direct-to-Main reset
    });
  };

  useSessionExpirySocket({
    authContext: 'CDR',
    endpoint: SOCKET_ENDPOINTS.SIRSession,
    label: 'CDR',
    dependencyKey: selector?.CDRUserData?.id,
    enabled: Boolean(selector?.CDRUserData?.id),
    onExpired: handleForceLogout,
  });
  // const onTrack = () => {
  //   if (requestId.trim() === '') {
  //     setRequestIdError('...');
  //     return;
  //   }
  //   setRequestIdError('');
  //   setSearchLoader(true);
  //   setPage(1);

  // };
  const onRefresh = () => {
    if (!isOnline) return;

    setRefreshing(true);
    setPage(1);
    getReqHistory(1);
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
            type: 'CDR',
            initialNotifications: notifications,
          });
        }}
        onProfilePress={() =>
          props?.navigation?.navigate(Routes.SIR.ProfileScreen, {isCDR: true})
        }
        name={
          isOnline
            ? `${userData?.firstName} ${userData?.lastName}`
            : 'Guest User'
        }
        unreadNoti={getUnreadCount()}
        img={userData?.profilePicture ? userData?.profilePicture : null}
        hideNoti={!isOnline}
      />

      <FlatList
        data={[1, 2, 3]}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.Primary}
            colors={[colors.Primary]}
          />
        }
        // ListHeaderComponent={() => (
        //     <ClockBlock time={selector?.cdrTime?.logoutTime} />
        // )}
        renderItem={({index}) => (
          <>
            {index === 0 ? (
              <CustomButton
                text={
                  isOnline ? 'Submit New Request' : 'Submit Offline Request'
                }
                onPress={() =>
                  props?.navigation?.navigate(Routes.CDR.NewReqScreen)
                }
                RightIcon={ForwardArrowIcon}
                loading={false}
              />
            ) : index === 1 ? (
              <View
                style={[
                  styles.row,
                  {
                    marginTop: normalized(12),
                    gap: normalized(10),
                  },
                ]}>
                <View style={{flex: 1}}>
                  <CustomInput
                    value={requestId}
                    setValue={(val: string) => {
                      setRequestId(val);
                      setRequestIdError('');
                    }}
                    placeholder="Search"
                    placeholderColor={colors.Heading_Txt}
                  />
                </View>
                <LinearGradient
                  colors={[colors.Primary, colors.Secondary]}
                  style={styles.sidePanelCont}>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      openDrawer();
                    }}>
                    <SideFilterIcon />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ) : index === 2 ? (
              <>
                <View style={[styles.rowCont, {marginTop: normalized(15)}]}>
                  <Text style={styles.headTxt}>Reports</Text>
                  {/* <LinearGradient
                    colors={[colors.Primary, colors.Secondary]}
                    style={styles.sidePanelCont}>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() =>
                        props?.navigation?.navigate(Routes.CDR.OfflineReqScreen)
                      }>
                      <OfflineIcon />
                    </TouchableOpacity>
                  </LinearGradient> */}
                </View>

                {requestList.length === 0 && requestLoader ? (
                  <View style={styles.loaderCont}>
                    <ActivityIndicator color={colors.Primary} size="large" />
                  </View>
                ) : (
                  <FlatList
                    data={requestList}
                    keyExtractor={(item, index) =>
                      String(item?.id ?? item?.NO ?? index)
                    }
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
                            Routes.CDR.ReqDetailScreen,
                            {item: item},
                          )
                        }
                      />
                    )}
                    ListFooterComponent={() =>
                      requestList.length < totalItems ? (
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
                      if (!requestLoader && requestList.length < totalItems) {
                        setPage(prev => prev + 1);
                      }
                    }}
                    ListEmptyComponent={() =>
                      initialLoadComplete && !requestLoader ? (
                        <View style={styles.emptyCont}>
                          <EmptyComp
                            type={Empty_Screen_Type.Report}
                            subText="No Report Found"
                          />
                        </View>
                      ) : null
                    }
                  />
                )}
              </>
            ) : null}
          </>
        )}
      />

      {/* <ThemeModal
        isVisible={isShowThemeModal}
        onClose={() => setIsShowThemeModal(false)}
        onThemeChange={() => {}}
      /> */}
      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        overlayAnim={overlayAnim}
        onClose={closeDrawer}
        statusList={CDR_Status_List}
        hidePaymentStatus={true}
        topOffset={insects.top + normalized(Platform.OS == 'ios' ? -10 : 0)}
        closeDrawer={closeDrawer}
        onApply={(queryString: any, params: any) => {
          setQueryParams(params);
          setPage(1);
        }}
      />
    </View>
  );
};

/* ------------ Styles ------------ */
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
    dropdownList: {
      position: 'absolute',
      zIndex: 99,
      top: normalized(45),
      width: '100%',
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
      minHeight: ScreenSize.height * 0.7,
      alignItems: 'center',
      justifyContent: 'center',
    },
    /* used by Comp */
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sidePanelCont: {
      width: normalized(40),
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(8),
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
