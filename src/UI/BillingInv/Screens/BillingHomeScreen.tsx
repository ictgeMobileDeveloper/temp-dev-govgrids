import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import {useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppStrings,
  Help_Desk_Card_Type,
  AuthContext,
  Billing_Card_Type,
} from '../../../Utils/AppStrings';
import {
  hasValidAccessToken,
  resolveAccessToken,
} from '../../../Network/Services/ApiHandler';
import {Routes} from '../../../Utils/Routes';
import BillingCard from '../Component/BillingDeskCard';
import ThemeModal from '../../Modal/ThemeModal';
import MainHeader from '../../Components/MainHeader';
import {useWebSocket} from '../../../Network/Services/WebSocketProvider';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {getErrorMessage} from '../../../Utils/Helper';
import {useSessionExpirySocket} from '../../../Network/Services/useSessionExpirySocket';
import {forceLogout} from '../../../Network/Services/ForceLogout';
import PermissionDeniedScreen from '../../Components/PermissionDenied';
import CustomDrawer from '../../Components/CustomDrawer';
import {useDrawer} from '../../../Hooks/DrawerAnimation';

const BillingHomeScreen = (props: ScreenProps) => {
  return <BillingHomeScreenInner {...props} />;
};

const BillingHomeScreenInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const userData = selector?.damUserData;
  console.log('DAM user Data', userData);
  const {getUnreadCount, notifications, markAllAsRead, reconnect} =
    useWebSocket('DAM');
  const unreadCount = getUnreadCount();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isManualRefreshRef = useRef(false);
  const [details, setDetails] = useState<any>(null);

  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const handleForceLogout = () => {
    forceLogout({
      dispatch,
      navigation: props.navigation,
      authContext: 'DAM',
      homeRoute: Routes.Vender.HomeScreen,
    });
  };

  useSessionExpirySocket({
    authContext: 'DAM',
    endpoint: SOCKET_ENDPOINTS.vendorSession,
    label: 'DAM',
    dependencyKey: selector?.damUserData?.id,
    enabled: Boolean(selector?.damUserData?.id),
    onExpired: handleForceLogout,
  });

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'NOTIFICATIONS_MARKED_READ',
      payload => {
        if (payload?.type === 'DAM') {
          markAllAsRead();
        }
      },
    );

    return () => sub.remove();
  }, [markAllAsRead]);
  useEffect(() => {
    fetchDetails();
  }, []);

  const onRefresh = () => {
    isManualRefreshRef.current = true;
    setRefreshing(true);
    fetchDetails();
  };

  const fetchDetails = () => {
    const isManualRefresh = isManualRefreshRef.current;

    if (!isManualRefresh) {
      setIsLoading(true);
    }
    apiHandler({
      endpoint: ENDPOINTS.getBillingCategories,
      method: 'GET',
      authContext: 'DAM',
      onComplete: (resp: any) => {
        console.log('Get Dashboard Data ', resp);
        if (resp?.status) {
          setIsLoading(false);
          setRefreshing(false);
          setDetails(resp?.data);
        } else if (resp?.httpStatus === 403) {
          setIsLoading(false);
          setRefreshing(false);
          setIsPermissionDenied(true);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
          setRefreshing(false);
        }
      },
    });
  };
  const isApproved = (code: string) =>
    Array.isArray(details?.data) &&
    details.data.some(
      (item: any) =>
        item?.category?.code === code && item?.accountStatus === 'approved',
    );
  const hasApprovedBillingAccess =
    isApproved('PDI') ||
    isApproved('MJB') ||
    isApproved('MDB') ||
    isApproved('PAB');
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
      <MainHeader
        onNotiPress={() =>
          props?.navigation?.navigate(Routes.NotificationScreen, {
            type: 'DAM',
            initialNotifications: notifications,
          })
        }
        onProfilePress={() =>
          props?.navigation?.navigate(Routes.SIR.ProfileScreen, {
            isDamUser: true,
          })
        }
        name={`${userData?.vendorName}`}
        unreadNoti={unreadCount}
        img={userData?.profilePicture ? userData?.profilePicture : null}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : isPermissionDenied || (details && !hasApprovedBillingAccess) ? (
        <PermissionDeniedScreen
          message="You don't have permission to view billing for this account."
          onGoBack={() => props?.navigation?.goBack()}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Primary}
              colors={[colors.Primary]}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: AppHorizontalMargin,
            paddingBottom: normalized(30),
          }}>
          {isApproved('PDI') && (
            <BillingCard
              type={Billing_Card_Type.Police_Duty}
              onFirstPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.InvoiceScreen, {
                  code: 'PDI',
                })
              }
              onSecondPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.BillingJobListing)
              }
              onThirdPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.SubmitJobScreen)
              }
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.PoliceDuty.BillingTypeScreen,
                  {
                    code: 'PDI',
                  },
                )
              }
            />
          )}
          {isApproved('MJB') && (
            <BillingCard
              type={Billing_Card_Type.Marijuana_Billing}
              onFirstPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.InvoiceScreen, {
                  code: 'MJB',
                })
              }
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.PoliceDuty.BillingTypeScreen,
                  {
                    code: 'MJB',
                  },
                )
              }
            />
          )}
          {isApproved('MDB') && (
            <BillingCard
              type={Billing_Card_Type.Medical_Billing}
              onFirstPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.InvoiceScreen, {
                  code: 'MDB',
                })
              }
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.PoliceDuty.BillingTypeScreen,
                  {
                    code: 'MDB',
                  },
                )
              }
            />
          )}
          {isApproved('PAB') && (
            <BillingCard
              type={Billing_Card_Type.Police_Academy_Billing}
              onPress={() =>
                props?.navigation?.navigate(Routes.PoliceDuty.InvoiceScreen, {
                  code: 'PAB',
                })
              }
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default BillingHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createTicketBtn: {
      height: normalized(40),
      borderRadius: normalized(10),
      backgroundColor: colors.Primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: normalized(22),
      marginTop: normalized(16),
    },

    createTicketTxt: {
      fontSize: normalized(15),
      color: colors.White,
      fontFamily: AppFonts.UbuntuBold,
    },

    createTicketArrow: {
      fontSize: normalized(42),
      color: colors.White,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(-4),
    },
  });
