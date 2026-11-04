import {
  ActivityIndicator,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
  Linking,
  AppState,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {MainStack} from './Navigation/MainStack';
import {useDispatch, useSelector} from 'react-redux';
import {StackActions} from '@react-navigation/native';
import {websocketUrl} from './Network/Urls';
import {
  setBaseData,
  setCDRUserData,
  setCityCartCategories,
  setDAMUserData,
  setHelpDeskUserData,
  setIsAlertShow,
  setIsShowNoti,
  setModuleList,
  setNetState,
  setOfflineFoiaReq,
  setParkingSites,
  setofflineAutismReq,
  setofflineCityCartReq,
  setofflineParkingPermitReq,
  setofflineCDRReq,
  setofflineSIRReq,
  setPushNotifiObj,
  setResidentUserData,
  setSIRUserData,
  setStaffModuleList,
  setTimeKeepingUserData,
  setShowToast,
  setVenderModuleList,
} from './Redux/AppReducers';
import {AppRootStore} from './Redux/AppStore';
import {
  apiHandler,
  initializeSecurityContext,
} from './Network/Services/ApiHandler';
import {ENDPOINTS} from './Network/Urls';
import ToastComp from './UI/Components/ToastComp';
import {WebSocketProvider} from './Network/Services/WebSocketProvider';
import AlertModal from './UI/Components/AlertModal';
import BootSplash from 'react-native-bootsplash';
import {
  RESIDENT_MODULES_LIST,
  STAFF_MODULES_LIST,
  VENDER_MODULES_LIST,
  navigationRef,
} from './Utils/AppConstants';

import {getApp} from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getAPNSToken,
  getInitialNotification,
  getMessaging,
  deleteToken,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import {bootstrapAuthState} from './Network/Services/AuthBootstrapService';
// import {startStartupSessionValidation} from './Network/Services/StartupSessionValidationService';
import {
  AppStrings,
  AsyncKeyStrings,
  AUTH_CONTEXT_CONFIG,
} from './Utils/AppStrings';
import {
  getDataAsync,
  removeSingleData,
  setDataInAsync,
} from './Utils/AsyncStorage';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {resetToWelcomeAndHome} from './Utils/Helper';
import {PUSH_DETAIL_ROUTES} from './Utils/AppConstants';
import {Routes} from './Utils/Routes';
import HelpDeskComp from './UI/Components/HelpDeskComp';
import MaintenanceModal from './UI/Components/MaintainanceModal';
import NotificationModal from './UI/Components/NotificationModal';
import {CommonActions} from '@react-navigation/native';
import {clearAuthContext} from './Network/Services/AuthTokenService';
import {subscribeSessionExpired} from './Network/Services/AuthTokenService';
import notifee, {EventType} from 'react-native-notify-kit';
import ReactNativeBlobUtil from 'react-native-blob-util';
import SplashLogo from './UI/Svg/SplashLogo';
import {
  fetchActiveParkingSessions,
  rehydrateGuestParkingSessions,
} from './Network/Services/ParkingSessionService';

const APP_START_TIME = Date.now();
const AppContainer = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(true);
  const pendingPushNotificationRef = useRef<any>(null);
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>(
    undefined,
  );
  const notificationPermissionRequestedRef = useRef(false);
  const iosNativeSplashHiddenRef = useRef(false);
  const splashScale = useRef(new Animated.Value(1)).current;
  const previousOnlineRef = useRef<boolean | null>(null);
  const colors = selector?.themeColors;
  const residentId = selector?.residentUserData?.id;
  const damId = selector?.damUserData?.id;
  const timeKeepingId = selector?.TimeKeepingUserData?.id;
  const cdrId = selector?.CDRUserData?.id;
  const sirId = selector?.SIRUserData?.id;
  const helpDeskId = selector?.helpDeskUserData?.id;

  const messagingInstance = getMessaging(getApp());
  const moduleUpdateSocketRef = useRef<WebSocket | null>(null);
  const moduleUpdateReconnectTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const moduleReloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const wasOfflineRef = useRef(false);
  const [settingsUpdateVisible, setSettingsUpdateVisible] = useState(false);
  const [settingsUpdateNotif, setSettingsUpdateNotif] = useState<any>(null);

  const maintenanceSocketRef = useRef<WebSocket | null>(null);
  const maintenanceReconnectTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        const filePath = detail.notification?.data?.filePath as string;
        const mimeType = detail.notification?.data?.mimeType as string;

        if (Platform.OS === 'android' && filePath) {
          ReactNativeBlobUtil.android.actionViewIntent(
            filePath,
            mimeType || 'application/zip',
          );
        }
      }
    });

    return unsubscribe;
  }, []);

  const navigateFromPushNotification = useCallback((data: any) => {
    if (!data) return;

    const type = data?.type;

    const config = PUSH_DETAIL_ROUTES[type];

    if (!config) {
      console.log('[Push] No route config found for type:', type);
      return;
    }

    // const routeName = config.route;
    const routeName =
      typeof config.route === 'function' ? config.route(data) : config.route;
    const params = config.buildParams(data);

    const navigate = () => {
      const isAlreadyOnScreen =
        navigationRef.getCurrentRoute()?.name === routeName;

      if (isAlreadyOnScreen) {
        navigationRef.dispatch(
          CommonActions.setParams({refreshedAt: Date.now()}),
        );
        return;
      }

      navigationRef.dispatch(StackActions.push(routeName, params));
    };

    if (isLoadingRef.current || !navigationRef.isReady()) {
      pendingPushNotificationRef.current = data;
      return;
    }

    navigate();
  }, []);

  const flushPendingPushNotification = useCallback(() => {
    if (
      isLoadingRef.current ||
      !navigationRef.isReady() ||
      !pendingPushNotificationRef.current
    ) {
      return;
    }

    const data = pendingPushNotificationRef.current;
    pendingPushNotificationRef.current = null;
    navigateFromPushNotification(data);
  }, [navigateFromPushNotification]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    if (!isLoading) {
      flushPendingPushNotification();
    }
  }, [flushPendingPushNotification, isLoading]);

  useEffect(() => {
    const messaging = getMessaging(getApp());

    const unsubscribe = onNotificationOpenedApp(messaging, msg => {
      console.log('[Push] opened from background:', msg?.data);
      navigateFromPushNotification(msg?.data);
    });

    getInitialNotification(messaging).then(msg => {
      console.log('[Push] opened from quit state:', msg?.data);
      if (msg?.data) navigateFromPushNotification(msg.data);
    });

    return unsubscribe;
  }, [navigateFromPushNotification]);

  const handlingSessionExpiryRef = useRef(false);
  useEffect(() => {
    const unsubscribe = subscribeSessionExpired(context => {
      const authConfig = AUTH_CONTEXT_CONFIG[context];

      void (async () => {
        try {
          await clearAuthContext(context);
        } catch (error) {
          console.log(`Failed to clear auth cookies for ${context}:`, error);
        }

        try {
          await deleteToken(getMessaging(getApp()));
        } catch (error) {
          console.log(
            'FCM token deletion failed during session expiry:',
            error,
          );
        }

        dispatch(authConfig.reduxSetter(null));

        try {
          await removeSingleData(authConfig.asyncKey);
        } catch (error) {
          console.log(
            `Failed to clear stored user data for ${context}:`,
            error,
          );
        }

        if (navigationRef.isReady()) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: Routes.MainScreen}],
            }),
          );
        }

        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'Session Expired, Please Login Again',
          }),
        );
      })();
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  const syncBaseDataAndModules = async () => {
    setSettingsUpdateNotif({
      notification: {
        title: 'Loading Latest Data',
        body: 'Fetching base settings and modules...',
      },
    });

    setSettingsUpdateVisible(true);

    try {
      await Promise.all([getModulesReq()]);
    } finally {
      setSettingsUpdateVisible(false);
      setSettingsUpdateNotif(null);
    }
  };
  useEffect(() => {
    if (!selector?.isNetConnected) {
      wasOfflineRef.current = true;
      return;
    }

    if (!wasOfflineRef.current) return;
    wasOfflineRef.current = false;

    if (isLoading) return; // bootstrap hasn't finished its own attempt yet, let it own this
    if (!selector?.baseData || !selector?.moduleList?.length) {
      syncBaseDataAndModules();
    }
  }, [selector?.isNetConnected, isLoading]);
  ///////////////////////////////////////////////////////////

  useEffect(() => {
    console.log('[Push] Registering foreground/opened listeners');
    const unsubscribeMessage = onMessage(
      messagingInstance,
      async remoteMessage => {
        console.log('[Push] Foreground notification:', remoteMessage);

        dispatch(setPushNotifiObj(remoteMessage));
        dispatch(setIsShowNoti(true));
      },
    );

    const unsubscribeOpened = onNotificationOpenedApp(
      messagingInstance,
      remoteMessage => {
        console.log(
          '[Push] Notification opened from background:',
          remoteMessage,
        );
        navigateFromPushNotification(remoteMessage?.data);
      },
    );

    return () => {
      console.log('[Push] Unregistering foreground/opened listeners');
      unsubscribeMessage();
      unsubscribeOpened();
    };
  }, [dispatch, messagingInstance]);

  const getModulesReq = useCallback(async () => {
    const baseSettingsResp: any = await new Promise(resolve => {
      apiHandler({
        endpoint: ENDPOINTS.Base_Settings,
        method: 'GET',
        requiresAuth: false,
        useRecaptcha: true,
        recaptchaAction: 'login',
        onComplete: resolve,
      });
    });

    if (!baseSettingsResp?.status) return;
    setDataInAsync(AsyncKeyStrings.BaseData, baseSettingsResp?.data?.data);
    dispatch(setBaseData(baseSettingsResp?.data?.data));

    const modulesResp: any = await new Promise(resolve => {
      apiHandler({
        endpoint: ENDPOINTS.getModules,
        method: 'GET',
        useRecaptcha: true,
        recaptchaAction: 'login',
        requiresAuth: false,
        onComplete: resolve,
      });
    });

    if (!modulesResp?.status) return;

    console.log('Module Response. :', modulesResp);
    setDataInAsync(AsyncKeyStrings.Modules, modulesResp?.data?.data);
    const filtered = modulesResp?.data?.data
      .filter(
        (el: any) =>
          el?.displayOnMobile === true &&
          RESIDENT_MODULES_LIST.some((item: any) => item.code === el.code),
      )
      ?.map((el: any) => {
        const match = RESIDENT_MODULES_LIST.find(
          (item: any) => item.code === el.code,
        );
        const matchData = (match || {}) as any;
        const {vector, ...serializableMatch} = matchData;

        return {
          ...serializableMatch,
          ...el,
          title: el?.displayName || matchData?.title,
          description: el?.description || matchData?.description,
        };
      });
    const apiModules = modulesResp?.data?.data ?? [];
    let staffModules = apiModules
      .filter(
        (el: any) =>
          el?.displayOnMobile === true &&
          STAFF_MODULES_LIST.some(item => item.code === el.code),
      )
      .map((el: any) => {
        const match = STAFF_MODULES_LIST.find(item => item.code === el.code);
        const matchData = (match || {}) as any;
        const {vector, ...serializableMatch} = matchData;

        return {
          ...serializableMatch,
          ...el,
          title: el?.displayName || matchData?.title,
          description: el?.description || matchData?.description,
        };
      });
    let vendorModules = apiModules
      .filter(
        (el: any) =>
          el?.displayOnMobile === true &&
          VENDER_MODULES_LIST.some(item => item.code === el.code),
      )
      .map((el: any) => {
        const match = VENDER_MODULES_LIST.find(item => item.code === el.code);
        const matchData = (match || {}) as any;
        const {vector, ...serializableMatch} = matchData;

        return {
          ...serializableMatch,
          ...el,
          title: el?.displayName || matchData?.title,
          description: el?.description || matchData?.description,
        };
      });
    const hasTimekeeping = staffModules.some((mod: any) => mod.code === 'STK1');

    if (hasTimekeeping) {
      const clockInModule = STAFF_MODULES_LIST.find(
        item => item.code === 'SPC1',
      );

      const alreadyAdded = staffModules.some((mod: any) => mod.code === 'SPC1');

      if (clockInModule && !alreadyAdded) {
        const {vector, ...serializableClockInModule} = clockInModule;
        staffModules.push(serializableClockInModule);
      }
    }

    dispatch(setStaffModuleList(staffModules));
    dispatch(setVenderModuleList(vendorModules));
    dispatch(setModuleList(filtered));
  }, [dispatch]);

  const reloadModulesFromSocket = useCallback(() => {
    if (moduleReloadTimerRef.current) {
      clearTimeout(moduleReloadTimerRef.current);
    }

    moduleReloadTimerRef.current = setTimeout(() => {
      getModulesReq();
    }, 500);
  }, [getModulesReq]);

  useEffect(() => {
    let isUnmounted = false;

    const connectModuleUpdateSocket = () => {
      if (isUnmounted) return;

      moduleUpdateSocketRef.current?.close();

      const ws = new WebSocket(`${websocketUrl}/ws/triggerUpdates/`);
      moduleUpdateSocketRef.current = ws;

      ws.onopen = () => {
        console.log('[Module Update WS] connected');
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          if (data?.moduleUpdated === true || data?.baseUpdated === true) {
            console.log('[Module Update WS] update received', data);

            setSettingsUpdateNotif({
              notification: {
                title: 'Setting Updated',
                body: ' Fetching latest data...',
              },
            });
            setSettingsUpdateVisible(true);

            reloadModulesFromSocket();
          }
        } catch (error) {
          console.log('[Module Update WS] invalid message', error);
        }
      };

      ws.onerror = error => {
        console.log('[Module Update WS] error', error);
      };

      ws.onclose = () => {
        console.log('[Module Update WS] closed');

        if (!isUnmounted) {
          moduleUpdateReconnectTimerRef.current = setTimeout(() => {
            connectModuleUpdateSocket();
          }, 5000);
        }
      };
    };

    connectModuleUpdateSocket();

    return () => {
      isUnmounted = true;

      if (moduleUpdateReconnectTimerRef.current) {
        clearTimeout(moduleUpdateReconnectTimerRef.current);
      }

      if (moduleReloadTimerRef.current) {
        clearTimeout(moduleReloadTimerRef.current);
      }

      moduleUpdateSocketRef.current?.close();
      moduleUpdateSocketRef.current = null;
    };
  }, [reloadModulesFromSocket]);

  const fetchActiveMaintenance = useCallback(() => {
    apiHandler({
      endpoint: ENDPOINTS.maintainanceData,
      method: 'GET',
      requiresAuth: false,
      onComplete: (resp: any) => {
        console.log('[Maintenance] Active maintenance data:', resp);

        const maintenanceWindow = resp?.data?.maintenanceWindow;

        if (resp?.data?.status && maintenanceWindow?.isActive) {
          setMaintenanceData(maintenanceWindow);
        } else {
          setMaintenanceData(null);
        }
      },
    });
  }, []);

  useEffect(() => {
    let isUnmounted = false;

    const connectMaintenanceSocket = () => {
      if (isUnmounted) return;

      maintenanceSocketRef.current?.close();

      const ws = new WebSocket(`${websocketUrl}/ws/maintenance/`);
      maintenanceSocketRef.current = ws;

      ws.onmessage = event => {
        console.log('[Maintenance WS] maintenance message received:');
        try {
          const data = JSON.parse(event.data);
          console.log('[Maintenance WS] data:', data);

          if (data?.maintenanceSchedule === true) {
            fetchActiveMaintenance();
          }
          if (data?.maintenanceSchedule === false) {
            setMaintenanceData(null);
            console.log('haaland ', maintenanceData);
          }
        } catch (error) {
          console.log('[Maintenance WS] maintenance invalid message', error);
        }
      };

      ws.onclose = () => {
        if (!isUnmounted) {
          maintenanceReconnectTimerRef.current = setTimeout(() => {
            connectMaintenanceSocket();
          }, 5000);
        }
      };
    };
    fetchActiveMaintenance();
    connectMaintenanceSocket();

    return () => {
      isUnmounted = true;

      if (maintenanceReconnectTimerRef.current) {
        clearTimeout(maintenanceReconnectTimerRef.current);
      }

      maintenanceSocketRef.current?.close();
      maintenanceSocketRef.current = null;
    };
  }, []);

  const CheckInternetAvailable = async () => {
    const state = await NetInfo.fetch();

    const hasInternet = Boolean(
      state.isConnected && state.isInternetReachable === true,
    );
  };
  // const hideIosNativeSplash = useCallback(() => {
  //   console.log(
  //     `[Startup] iOS native splash hidden at +${Date.now() - APP_START_TIME}ms`,
  //   );
  //   if (Platform.OS !== 'ios' || iosNativeSplashHiddenRef.current) {
  //     return;
  //   }

  //   iosNativeSplashHiddenRef.current = true;

  //   try {
  //     const {hideSplash} = require('react-native-splash-view');
  //     hideSplash();
  //   } catch (splashErr) {
  //     console.warn('react-native-splash-view hide failed', splashErr);
  //     BootSplash.hide();
  //   }
  // }, []);
  const hideIosNativeSplash = useCallback(() => {
    if (Platform.OS !== 'ios' || iosNativeSplashHiddenRef.current) {
      return;
    }

    iosNativeSplashHiddenRef.current = true;

    BootSplash.hide({fade: false}).catch(error => {
      iosNativeSplashHiddenRef.current = false;
      console.warn('[Startup] BootSplash.hide failed:', error);
    });
  }, []);
  BootSplash.hide();

  useEffect(() => {
    console.log(
      `[Startup] Android splash hidden at +${Date.now() - APP_START_TIME}ms`,
    );
    const androidTimer = setTimeout(() => {
      BootSplash.hide();
    }, 1500);
    if (Platform.OS !== 'ios') return;

    const timer = setTimeout(() => {
      hideIosNativeSplash();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(androidTimer);
    };
  }, [hideIosNativeSplash]);

  useEffect(() => {
    // if (Platform.OS !== 'ios') return;

    if (!isLoading) {
      splashScale.stopAnimation();
      splashScale.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(splashScale, {
          toValue: 1.12,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashScale, {
          toValue: 0.92,
          duration: 650,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: -1,
        resetBeforeIteration: false,
      },
    );
    pulse.start();

    return () => {
      pulse.stop();
      Animated.timing(splashScale, {
        toValue: 1,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };
  }, [isLoading, splashScale]);

  useEffect(() => {
    loadBaseData();
    loadModuleData();
    loadOfflineReq();
  }, []);

  const loadBaseData = async () => {
    const data = await getDataAsync(AsyncKeyStrings.BaseData);
    if (!data) return;
    dispatch(setBaseData(data));
  };

  const loadModuleData = async () => {
    const modulesResp: any = await getDataAsync(AsyncKeyStrings.Modules);
    const baseData = await getDataAsync(AsyncKeyStrings.BaseData);
    const apiModules = modulesResp ?? [];

    const filtered = apiModules
      ?.filter((el: any) =>
        RESIDENT_MODULES_LIST.some((item: any) => item.code === el.code),
      )
      ?.map((el: any) => {
        const match = RESIDENT_MODULES_LIST.find(
          (item: any) => item.code === el.code,
        );
        const matchData = (match || {}) as any;
        const {vector, ...serializableMatch} = matchData;

        return {
          ...serializableMatch,
          ...el,
          title: el?.displayName || matchData?.title,
          description: el?.description || matchData?.description,
        };
      });

    let staffModules = apiModules
      .filter((el: any) =>
        STAFF_MODULES_LIST.some(item => item.code === el.code),
      )
      .map((el: any) => {
        const match = STAFF_MODULES_LIST.find(item => item.code === el.code);
        const matchData = (match || {}) as any;
        const {vector, ...serializableMatch} = matchData;

        return {
          ...serializableMatch,
          ...el,
          title: el?.displayName || matchData?.title,
          description: el?.description || matchData?.description,
        };
      });
    let vendorModules = apiModules
      .filter((el: any) =>
        VENDER_MODULES_LIST.some(item => item.code === el.code),
      )
      .map((el: any) => {
        const match = VENDER_MODULES_LIST.find(item => item.code === el.code);
        const matchData = (match || {}) as any;
        const {vector, ...serializableMatch} = matchData;

        return {
          ...serializableMatch,
          ...el,
          title: el?.displayName || matchData?.title,
          description: el?.description || matchData?.description,
        };
      });

    const hasTimekeeping = staffModules.some((mod: any) => mod.code === 'STK1');

    if (hasTimekeeping) {
      const clockInModule = STAFF_MODULES_LIST.find(
        item => item.code === 'SPC1',
      );

      const alreadyAdded = staffModules.some((mod: any) => mod.code === 'SPC1');

      if (clockInModule && !alreadyAdded) {
        const {vector, ...serializableClockInModule} = clockInModule;
        staffModules.push(serializableClockInModule);
      }
    }

    dispatch(setStaffModuleList(staffModules));
    dispatch(setModuleList(filtered));
    dispatch(setVenderModuleList(vendorModules));
    dispatch(setBaseData(baseData));
  };

  const loadOfflineReq = async () => {
    const foiaReqs = await getDataAsync(AsyncKeyStrings.FoiaRequests);
    dispatch(setOfflineFoiaReq(foiaReqs ?? []));
    const sirReqs = await getDataAsync(AsyncKeyStrings.SirRequests);
    dispatch(setofflineSIRReq(sirReqs ?? []));
    const cdrReqs = await getDataAsync(AsyncKeyStrings.CdrRequests);
    dispatch(setofflineCDRReq(cdrReqs ?? []));
    const autismReqs = await getDataAsync(AsyncKeyStrings.AutismRequests);
    dispatch(setofflineAutismReq(autismReqs ?? []));
    const parkingReqs = await getDataAsync(
      AsyncKeyStrings.ParkingPermitRequests,
    );
    dispatch(setofflineParkingPermitReq(parkingReqs ?? []));
    const parkingSites = await getDataAsync(AsyncKeyStrings.ParkingSites);
    dispatch(setParkingSites(parkingSites ?? []));
    const cityCartReqs = await getDataAsync(AsyncKeyStrings.CityCartRequests);
    dispatch(setofflineCityCartReq(cityCartReqs ?? []));
    const cityCartCategories = await getDataAsync(
      AsyncKeyStrings.CityCartCategories,
    );
    dispatch(setCityCartCategories(cityCartCategories ?? []));
    //
    rehydrateGuestParkingSessions(dispatch);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initializeSecurityContext();
        // startStartupSessionValidation(dispatch);
        await bootstrapAuthState(dispatch);
        await getModulesReq();

        // await Promise.all([bootstrapAuthState(dispatch), getModulesReq()]);
        fetchActiveParkingSessions(dispatch, residentId);
      } catch (err) {
        console.warn('App bootstrap failed, continuing app', err);
      } finally {
        if (mounted) {
          if (Platform.OS !== 'ios') {
            BootSplash.hide();
          }
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch, getModulesReq]);

  const updateNetworkState = useCallback(
    (state: NetInfoState) => {
      // Case 1: no wifi/cellular radio connected at all → offline instantly
      if (!state.isConnected) {
        dispatch(setNetState(false));
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'You are Offline',
          }),
        );
        return;
      }

      // Case 2: connected to a network — fall back to your existing
      // reachability-based check (isInternetReachable == null treated as online)
      const isOnline = Boolean(
        state.isInternetReachable == null || state.isInternetReachable,
      );
      dispatch(setNetState(isOnline));
    },
    [dispatch],
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && residentId) {
        fetchActiveParkingSessions(dispatch, residentId);
      }
    });

    const interval = setInterval(() => {
      if (residentId) fetchActiveParkingSessions(dispatch, residentId);
    }, 60000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [residentId, dispatch]);
  useEffect(() => {
    NetInfo.fetch().then(updateNetworkState);
    const unsubscribe = NetInfo.addEventListener(updateNetworkState);

    return () => {
      unsubscribe();
    };
  }, [updateNetworkState]);

  useEffect(() => {
    const syncCurrentRoute = () => {
      setCurrentRouteName(navigationRef.getCurrentRoute()?.name);
      flushPendingPushNotification();
    };

    syncCurrentRoute();
    const unsubscribe = navigationRef.addListener('state', syncCurrentRoute);

    return unsubscribe;
  }, [flushPendingPushNotification]);

  const updateFCMToken = useCallback((fcmToken: any, authContext: any) => {
    console.log(`[Push] Saving FCM token for ${authContext}`);
    apiHandler({
      endpoint: ENDPOINTS.FcmToken,
      method: 'POST',
      authContext,
      payload: {token: fcmToken},
      onComplete: (resp: any) => {
        if (!resp?.status) {
          console.log(`FCM token save failed for ${authContext}`, resp);
        } else {
          console.log(`[Push] FCM token saved for ${authContext}`, resp?.data);
        }
      },
    });
  }, []);
  const requestToken = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        if (!messagingInstance.isDeviceRegisteredForRemoteMessages) {
          console.log(
            '[Push] iOS device is not registered for remote messages',
          );

          return;
        }

        const apnsToken = await messagingInstance.getAPNSToken();

        console.log('[Push] APNs token:', apnsToken);

        if (!apnsToken) {
          console.log('[Push] APNs token unavailable');
          return;
        }
      }

      const token = await messagingInstance.getToken();

      if (!token) {
        console.log('[Push] No FCM token returned');
        return;
      }

      console.log('[Push] FCM token received:', token);

      if (residentId) {
        updateFCMToken(token, 'RESIDENT');
      }

      if (damId) {
        updateFCMToken(token, 'DAM');
      }

      if (cdrId) {
        updateFCMToken(token, 'CDR');
      }

      if (timeKeepingId) {
        updateFCMToken(token, 'TIMEKEEPING');
      }

      if (helpDeskId) {
        updateFCMToken(token, 'HELPDESK');
      }
    } catch (error) {
      console.log('Notification token fetch failed', error);
    }
  }, [
    messagingInstance,
    residentId,
    damId,
    cdrId,
    timeKeepingId,
    helpDeskId,
    updateFCMToken,
  ]);

  const requestPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messagingInstance.requestPermission({
          alert: true,
          announcement: true,
          badge: true,
          carPlay: true,
          provisional: false,
          sound: true,
        });
        console.log('[Push] iOS notification auth status:', authStatus);

        const enabled =
          authStatus === AuthorizationStatus.AUTHORIZED ||
          authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await requestToken();
        }

        return;
      }

      const androidVersion =
        typeof Platform.Version === 'string'
          ? parseInt(Platform.Version, 10)
          : Platform.Version;

      if (androidVersion < 33) {
        await requestToken();
        return;
      }

      const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

      if (!permission) {
        await requestToken();
        return;
      }

      const alreadyGranted = await PermissionsAndroid.check(permission);
      console.log(
        '[Push] Android POST_NOTIFICATIONS already granted:',
        alreadyGranted,
      );

      if (alreadyGranted) {
        await requestToken();
        return;
      }

      if (notificationPermissionRequestedRef.current) {
        return;
      }

      notificationPermissionRequestedRef.current = true;

      const result = await PermissionsAndroid.request(permission);
      console.log('[Push] Android POST_NOTIFICATIONS request result:', result);

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        await requestToken();
      }
    } catch (error) {
      console.log('Notification permission request failed', error);
    }
  }, [messagingInstance, requestToken]);

  useEffect(() => {
    const unsubscribe = onTokenRefresh(messagingInstance, async token => {
      if (!token) return;

      if (residentId) updateFCMToken(token, 'RESIDENT');
      if (damId) updateFCMToken(token, 'DAM');
      if (cdrId) updateFCMToken(token, 'CDR');
      if (timeKeepingId) updateFCMToken(token, 'TIMEKEEPING');
      if (helpDeskId) updateFCMToken(token, 'HELPDESK');
    });

    return unsubscribe;
  }, [
    cdrId,
    damId,
    helpDeskId,
    residentId,
    sirId,
    timeKeepingId,
    updateFCMToken,
  ]);

  useEffect(() => {
    const hasAuthenticatedUser = Boolean(
      residentId || damId || timeKeepingId || cdrId || sirId || helpDeskId,
    );

    if (isLoading || !hasAuthenticatedUser) return;

    requestPermission();
  }, [
    cdrId,
    damId,
    helpDeskId,
    isLoading,
    requestPermission,
    residentId,
    sirId,
    timeKeepingId,
  ]);

  // useEffect(() => {
  //   const isOnline = Boolean(selector?.isNetConnected);

  //   if (previousOnlineRef.current == null) {
  //     previousOnlineRef.current = isOnline;
  //     return;
  //   }

  //   const cameBackOnline =
  //     previousOnlineRef.current === false && isOnline === true;
  //   previousOnlineRef.current = isOnline;

  //   if (!cameBackOnline || !navigationRef.isReady()) {
  //     return;
  //   }

  //   const activeRoute = navigationRef.getCurrentRoute()?.name;
  //   if (!activeRoute) {
  //     return;
  //   }

  //   const cdrSirModuleRoutes = new Set<string>([
  //     Routes.SIR.HomeScreen,
  //     Routes.SIR.NewReqScreen,
  //     Routes.SIR.ReqDetailScreen,
  //     Routes.SIR.ProfileScreen,
  //     Routes.SIR.OfflineReqScreen,
  //     Routes.CDR.HomeScreen,
  //     Routes.CDR.NewReqScreen,
  //     Routes.CDR.ReqDetailScreen,
  //     Routes.CDR.ProfileScreen,
  //     Routes.CDR.OfflineReqScreen,
  //     Routes.CDR.PersonalInfoScreen,
  //     Routes.CDR.DocketScreen,
  //     Routes.CDR.RecordDivisionScreen,
  //     Routes.CDR.ForensicsScreen,
  //     Routes.CDR.EvidenceScreen,
  //   ]);

  //   if (cdrSirModuleRoutes.has(activeRoute)) {
  //     resetToWelcomeAndHome(navigationRef as any, Routes.Staff.HomeScreen);
  //   }
  // }, [selector?.isNetConnected]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          {
            backgroundColor: colors.Background,
          },
        ]}>
        {/* <Animated.View
          style={{
            transform: [{scale: splashScale}],
          }}>
          <CityLogo size={100} />
        </Animated.View> */}
        <SplashLogo width={105} height={110} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebSocketProvider>
        <MainStack />
      </WebSocketProvider>
      {!selector?.isNetConnected && (
        <AlertModal
          visible={true}
          message="Please connect to the internet."
          onPress={() => {
            CheckInternetAvailable();
          }}
        />
      )}
      {selector?.showToast?.message !== '' ? <ToastComp /> : null}
      {selector?.isAlertShow?.value && (
        <AlertModal
          visible={selector?.isAlertShow?.value}
          onPress={() => {
            dispatch(setIsAlertShow({value: false, message: ''}));
          }}
          message={selector?.isAlertShow?.message}
        />
      )}
      {!currentRouteName?.includes('CityHelpScreen') &&
      selector?.baseData?.navigation?.enableResidentHelpdesk ? (
        <HelpDeskComp />
      ) : null}
      <MaintenanceModal
        visible={Boolean(maintenanceData)}
        data={maintenanceData}
        onEnd={() => setMaintenanceData(null)}
      />

      <NotificationModal
        isVisible={selector?.showNoti}
        data={selector?.pushObj}
        onPress={() => {
          navigateFromPushNotification(selector?.pushObj?.data);
          dispatch(setIsShowNoti(false));
          dispatch(setPushNotifiObj(null));
        }}
        onClose={() => {
          dispatch(setIsShowNoti(false));
          dispatch(setPushNotifiObj(null));
        }}
      />
      {settingsUpdateVisible && (
        <NotificationModal
          isVisible={settingsUpdateVisible}
          data={settingsUpdateNotif}
          onClose={() => setSettingsUpdateVisible(false)}
          onPress={() => setSettingsUpdateVisible(false)}
        />
      )}
    </View>
  );
};

export default AppContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
