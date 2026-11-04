import {Dispatch} from 'redux';
import {getApp} from '@react-native-firebase/app';
import {deleteToken, getMessaging} from '@react-native-firebase/messaging';

import {apiHandler} from './ApiHandler';
import {clearAuthContext} from './AuthTokenService';
import {
  AUTH_CONTEXT_CONFIG,
  AppStrings,
  AuthContext,
} from '../../Utils/AppStrings';
import {ENDPOINTS} from '../Urls';
import {removeSingleData} from '../../Utils/AsyncStorage';
import {resetToScreen, resetToWelcomeAndHome} from '../../Utils/Helper';
import {setShowToast} from '../../Redux/AppReducers';

type ForceLogoutParams = {
  dispatch: Dispatch;
  navigation?: any;
  authContext: AuthContext;
  homeRoute?: string;
  message?: string;
};

export const ROLE_LOGOUT_MAP: Record<AuthContext, {endpoint: string}> = {
  RESIDENT: {endpoint: ENDPOINTS.residentLogout},
  CDR: {endpoint: ENDPOINTS.organizationLogout},
  SIR: {endpoint: ENDPOINTS.organizationLogout},
  DAM: {endpoint: ENDPOINTS.organizationLogout},
  HELPDESK: {endpoint: ENDPOINTS.organizationLogout},
  TIMEKEEPING: {endpoint: ENDPOINTS.employeeLogout},
};

let isForceLoggingOut = false;

export const forceLogout = ({
  dispatch,
  navigation,
  authContext,
  homeRoute,
  message = 'Session Expired, Please Login Again',
}: ForceLogoutParams) => {
  if (isForceLoggingOut) return;
  isForceLoggingOut = true;

  const logoutConfig = ROLE_LOGOUT_MAP[authContext];
  const reduxConfig = AUTH_CONTEXT_CONFIG[authContext];

  if (!logoutConfig || !reduxConfig) {
    console.log(`❌ Force logout configuration missing for ${authContext}`);
    isForceLoggingOut = false;
    return;
  }

  // fire-and-forget: don't block local cleanup on these
  apiHandler({
    endpoint: logoutConfig.endpoint,
    method: 'POST',
    payload: {},
    authContext,
  });
  deleteToken(getMessaging(getApp())).catch(error =>
    console.log('FCM token delete failed during force logout:', error),
  );

  try {
    if (navigation && homeRoute) {
      resetToScreen(navigation, homeRoute);
    } else {
      resetToWelcomeAndHome(navigation, homeRoute);
    }
    console.log(' deleting user tokens and fcm');
    dispatch(reduxConfig.reduxSetter(null));
    clearAuthContext(authContext);
    if (reduxConfig.asyncKey) removeSingleData(reduxConfig.asyncKey);
    dispatch(setShowToast({type: AppStrings.ToastType.error, message}));
  } catch (error) {
    console.log(`❌ Force logout cleanup failed for ${authContext}:`, error);
    dispatch(
      setShowToast({
        type: AppStrings.ToastType.error,
        message: 'Something went wrong, please try again',
      }),
    );
  } finally {
    setTimeout(() => {
      isForceLoggingOut = false;
    }, 1000);
  }
};
