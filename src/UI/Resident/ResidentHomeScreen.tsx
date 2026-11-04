import {
  AppState,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  Linking,
  Animated as RNAnimated,
  View,
  Easing,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DeviceEventEmitter} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import ModuleComp from '../Components/ModuleComp';
import MainHeader from '../Components/MainHeader';
import ThemeModal from '../Modal/ThemeModal';
import {Routes} from '../../Utils/Routes';
import {
  useWebSocket,
  WebSocketProvider,
} from '../../Network/Services/WebSocketProvider';
import {
  setIsAlertShow,
  setResidentState,
  setResidentUserData,
  setShowToast,
} from '../../Redux/AppReducers';
import {AppStrings, AuthContext} from '../../Utils/AppStrings';
import {SOCKET_ENDPOINTS, websocketUrl} from '../../Network/Urls';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';
import {resetToWelcomeAndHome} from '../../Utils/Helper';
import {
  clearAuthContext,
  subscribeAuthTokenChange,
} from '../../Network/Services/AuthTokenService';
import {
  hasValidAccessToken,
  resolveAccessToken,
} from '../../Network/Services/ApiHandler';
import {useIsFocused} from '@react-navigation/native';
import {forceLogout} from '../../Network/Services/ForceLogout';
import CustomDrawer from '../Components/CustomDrawer';
import {useDrawer} from '../../Hooks/DrawerAnimation';

const ResidentHomeScreen = (props: ScreenProps) => {
  return (
    // <WebSocketProvider authContext="RESIDENT">
    <ResidentHomeScreenInner {...props} />
    // </WebSocketProvider>
  );
};

const ResidentHomeScreenInner = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const themeColors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const moduleList = useSelector(
    (state: AppRootStore) => state.SliceReducer.moduleList,
  );
  const residentUserData = useSelector(
    (state: AppRootStore) => state.SliceReducer.residentUserData,
  );
  const isDarkTheme = useSelector(
    (state: AppRootStore) => state.SliceReducer.isDarkTheme,
  );

  const guestDirectRouteMap: Record<string, string> = {
    // [Routes.FOIA.RequestScreen]: Routes.FOIA.NewReqScreen,
    // [Routes.ParkingPermit.Dashboard]: Routes.ParkingPermit.FormSubmit,
    // [Routes.RIP.HomeScreen]: Routes.RIP.SubmitReqScreen,
    [Routes.ParkingPermit.Dashboard]: Routes.ParkingPermit.ParkingTypes,
  };
  const colors = themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors],
  );
  const dispatch = useDispatch();

  const userData = selector?.residentUserData;
  const isOnline = selector?.isNetConnected;

  const {getUnreadCount, reconnect, notifications, markAllAsRead} =
    useWebSocket('RESIDENT');
  // const isFocused = useIsFocused();

  // useEffect(() => {
  //   if (isFocused) {
  //     reconnect();
  //   }
  // }, [isFocused]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'NOTIFICATIONS_MARKED_READ',
      payload => {
        if (payload?.type === 'RESIDENT') {
          markAllAsRead();
          // reconnect();
        }
      },
    );

    return () => sub.remove();
  }, [markAllAsRead, reconnect]);

  useEffect(() => {
    const authContext: AuthContext = 'RESIDENT';
    const endpoint = `${websocketUrl}${SOCKET_ENDPOINTS.publicSessionTimer}`;
    const currentState = selector?.residentState;

    let handled = false;
    let unsubscribe: (() => void) | null = null;
    let hasReceivedValidRemaining = false;

    let invalidTimer: ReturnType<typeof setTimeout> | null = null;
    const INVALID_GRACE_MS = 5000; // you can tune 3000–8000ms

    const clearInvalidTimer = () => {
      if (invalidTimer) {
        clearTimeout(invalidTimer);
        invalidTimer = null;
      }
    };

    const scheduleInvalidLogout = () => {
      if (invalidTimer || handled) return;

      // console.log(
      //   `🟠 remainingSeconds invalid → waiting ${INVALID_GRACE_MS}ms before logout...`,
      // );

      invalidTimer = setTimeout(() => {
        if (handled) return;

        console.log('🔴 Session invalid (remainingSeconds stayed invalid)');
        handled = true;
        handleForceLogout();
      }, INVALID_GRACE_MS);
    };

    const onMessage = (data: any) => {
      const raw = data?.remainingSeconds;
      const remaining = Number(raw);

      console.log('⏱️ Resident remainingSeconds:', raw, '→', remaining);

      // ✅ Case: valid remaining
      if (Number.isFinite(remaining)) {
        hasReceivedValidRemaining = true;
        clearInvalidTimer();
        console.log(
          '🔍 expiry check — remaining:',
          remaining,
          'currentState:',
          currentState,
        );
        if (
          remaining === 0 &&
          !handled
          // && ['PPP1', 'PPD1', 'PFR1', 'PCR1'].includes(currentState)
        ) {
          console.log('🔴 Session expired (remaining === 0)');
          handled = true;
          handleForceLogout();
        }

        return;
      }

      if (!hasReceivedValidRemaining) {
        return;
      }
      scheduleInvalidLogout();
    };

    const connectIfPossible = async () => {
      const hasToken = await hasValidAccessToken(authContext);

      if (!hasToken) {
        console.log('🟡 WS skipped — no resident token');
        return;
      }

      const token = await resolveAccessToken(authContext);
      if (!token) return;

      // IMPORTANT: connect using authContext so registry can resolve token internally
      // sessionSocketRegistry.connect(authContext, endpoint, onMessage);
      sessionSocketRegistry.connect(
        authContext,
        websocketUrl + SOCKET_ENDPOINTS.publicSessionTimer,
      );
    };

    connectIfPossible();

    unsubscribe = subscribeAuthTokenChange(() => {
      console.log('🔁 Token changed → reconnect session socket');
      handled = false;
      hasReceivedValidRemaining = false;
      clearInvalidTimer();
      connectIfPossible();
    });

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        handled = false;
        hasReceivedValidRemaining = false;
        clearInvalidTimer();
        connectIfPossible();
      } else if (state === 'background') {
        // ✅ DO NOT disconnect here (gallery/file picker safe)
        // Only disconnect if you want to, but your current requirement says don't.
      }
    });

    return () => {
      handled = true;
      clearInvalidTimer();
      unsubscribe?.();
      sessionSocketRegistry.disconnect(authContext, endpoint);
      sessionSocketRegistry.removeListener(authContext, endpoint, onMessage);
      sub.remove();
    };
  }, [selector?.residentState]);

  const handleForceLogout = () => {
    forceLogout({
      dispatch,
      navigation: props.navigation,
      authContext: 'RESIDENT',
      homeRoute: Routes.MainScreen,
    });
  };

  return (
    <View
      style={[
        styles.container,
        styles.safeArea,
        // {
        //   paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
        //   paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        // },
      ]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
      <MainHeader
        onNotiPress={() => {
          if (userData)
            props?.navigation?.navigate(Routes.NotificationScreen, {
              type: 'RESIDENT',
              initialNotifications: notifications,
            });
          // dispatch(
          //   setShowToast({
          //     type: AppStrings.ToastType.warning,
          //     message: 'Now Allowed in Guest Mode.',
          //   }),
          // );
          else
            props?.navigation?.navigate(Routes.Auth.Login, {
              route: Routes.Resident.HomeScreen,
            });
        }}
        onProfilePress={() => {
          if (userData) props?.navigation?.navigate(Routes.EditProfileScreen);
          else
            props?.navigation?.navigate(Routes.Auth.Login, {
              route: Routes.Resident.HomeScreen,
            });
          // dispatch(
          //   setShowToast({
          //     type: AppStrings.ToastType.warning,
          //     message: 'Now Allowed in Guest Mode.',
          //   }),
          // );
        }}
        showSettings
        onSettingPress={() =>
          props?.navigation?.navigate(Routes.SettingsScreen, {
            showChangePass: false,
          })
        }
        name={
          userData
            ? `${userData?.firstName} ${userData?.lastName}`
            : 'Guest User'
        }
        unreadNoti={getUnreadCount()}
        img={
          selector?.residentUserData?.profilePicture
            ? selector?.residentUserData?.profilePicture
            : null
        }
        hideNoti={userData ? false : true}
      />
      <View style={{paddingHorizontal: normalized(20), flex: 1}}>
        <View style={{height: normalized(10)}} />
        <Text style={styles.headingTxt}>Resident Services</Text>
        <View style={{height: normalized(10)}} />
        <View style={{width: '100%', flex: 1}}>
          <FlatList
            data={moduleList}
            windowSize={5}
            maxToRenderPerBatch={6}
            initialNumToRender={6}
            removeClippedSubviews={true}
            keyExtractor={(item, index) =>
              item?.id ? item.id.toString() : `key-${index}`
            }
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={{
              gap: normalized(12),
              marginTop: normalized(12),
            }}
            renderItem={({item, index}) => {
              return (
                <View
                  style={{
                    flex: 1,
                  }}>
                  <ModuleComp
                    item={item}
                    lastOddItem={
                      moduleList?.length % 2 !== 0 &&
                      moduleList?.length === index + 1
                    }
                    onPress={async () => {
                      if (item?.isExternal === true && item?.externalSiteLink) {
                        const canOpen = await Linking.canOpenURL(
                          item.externalSiteLink,
                        );
                        if (canOpen) {
                          await Linking.openURL(item.externalSiteLink);
                          return;
                        }
                      }
                      const allowOfflineGuestAccess =
                        !isOnline &&
                        [
                          Routes.ParkingPermit.HomeScreen,
                          Routes.CartRental.HomeScreen,
                        ].includes(item?.route);

                      if (
                        item?.isPublic ||
                        userData?.id ||
                        allowOfflineGuestAccess
                      ) {
                        dispatch(setResidentState(item?.code));
                        props?.navigation.navigate(
                          !userData?.id && guestDirectRouteMap[item?.route]
                            ? guestDirectRouteMap[item?.route]
                            : item?.route,
                        );
                      } else
                        props?.navigation?.navigate(Routes.Auth.Login, {
                          route: item?.route,
                        });
                    }}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => (
              <View style={{height: normalized(40)}} />
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default ResidentHomeScreen;

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
  });
