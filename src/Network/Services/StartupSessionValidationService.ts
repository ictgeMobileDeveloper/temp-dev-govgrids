// import {Dispatch} from 'redux';
// import {AuthContext, AUTH_CONTEXT_CONFIG} from '../../Utils/AppStrings';
// import {SOCKET_ENDPOINTS, websocketUrl} from '../Urls';
// import {hasValidAccessToken, resolveAccessToken} from './ApiHandler';
// import {clearAuthContext} from './AuthTokenService';
// import {removeSingleData} from '../../Utils/AsyncStorage';
// import {ROLE_LOGOUT_MAP} from './ForceLogout';
// import {apiHandler} from './ApiHandler';
// import {getApp} from '@react-native-firebase/app';
// import {deleteToken, getMessaging} from '@react-native-firebase/messaging';

// type StartupSessionCheck = {
//   authContext: AuthContext;
//   endpoint: string;
// };

// const STARTUP_SESSION_CHECKS: StartupSessionCheck[] = [
//   {
//     authContext: 'RESIDENT',
//     endpoint: SOCKET_ENDPOINTS.publicSessionTimer,
//   },
//   {
//     authContext: 'CDR',
//     endpoint: SOCKET_ENDPOINTS.SIRSession,
//   },
//   {
//     authContext: 'SIR',
//     endpoint: SOCKET_ENDPOINTS.SIRSession,
//   },
//   {
//     authContext: 'TIMEKEEPING',
//     endpoint: SOCKET_ENDPOINTS.TKSession,
//   },
//   {
//     authContext: 'HELPDESK',
//     endpoint: SOCKET_ENDPOINTS.SIRSession,
//   },
//   {
//     authContext: 'DAM',
//     endpoint: SOCKET_ENDPOINTS.vendorSession,
//   },
// ];

// // const isSessionExpiredMessage = (data: any) => {
// //   const remaining = Number(data?.remainingSeconds);

// //   return (
// //     data?.status === 'unauthorized' ||
// //     data?.status === 'expired' ||
// //     data?.message === 'Invalid or expired session' ||
// //     data?.message === 'Session expired' ||
// //     (Number.isFinite(remaining) && remaining === 0)
// //   );
// // };

// const isSessionExpiredMessage = (data: any) => {
//   const remaining = Number(data?.remainingSeconds ?? data?.remaining_seconds);

//   return (
//     data?.status === 'unauthorized' ||
//     data?.status === 'expired' ||
//     data?.status === 'logged_out' ||
//     data?.message?.includes('Session expired') ||
//     data?.message?.includes('Invalid or expired') ||
//     (Number.isFinite(remaining) && remaining === 0)
//   );
// };

// const clearModuleSessionOnly = async (
//   dispatch: Dispatch,
//   authContext: AuthContext,
// ) => {
//   const config = AUTH_CONTEXT_CONFIG[authContext];

//   console.log(`🧹 Startup session expired, clearing ${authContext}`);
//   apiHandler({
//     endpoint: ROLE_LOGOUT_MAP[authContext].endpoint,
//     method: 'POST',
//     payload: {},
//     authContext,
//   });
//   console.log('deleting fcm token and all ');
//   deleteToken(getMessaging(getApp())).catch(error =>
//     console.log(
//       `FCM token delete failed during startup session clear (${authContext}):`,
//       error,
//     ),
//   );

//   dispatch(config.reduxSetter(null));
//   await clearAuthContext(authContext);
//   await removeSingleData(config.asyncKey);
// };

// const validateOneSessionInBackground = async (
//   dispatch: Dispatch,
//   check: StartupSessionCheck,
// ) => {
//   const {authContext, endpoint} = check;

//   try {
//     const hasToken = await hasValidAccessToken(authContext);

//     if (!hasToken) {
//       return;
//     }

//     const token = await resolveAccessToken(authContext);

//     if (!token) {
//       return;
//     }

//     const fullEndpoint = `${websocketUrl}${endpoint}`;
//     const url = fullEndpoint.includes('?')
//       ? `${fullEndpoint}&token=${encodeURIComponent(token)}`
//       : `${fullEndpoint}?token=${encodeURIComponent(token)}`;

//     const ws = new WebSocket(url);

//     const closeTimer = setTimeout(() => {
//       ws.close();
//     }, 10000);

//     // ws.onmessage = async event => {
//     //   try {
//     //     const data = JSON.parse(event.data);

//     //     console.log(`📩 Startup timer message:`, {
//     //       authContext,
//     //       fullEndpoint,
//     //       data,
//     //       token,
//     //     });

//     //     if (isSessionExpiredMessage(data)) {
//     //       await clearModuleSessionOnly(dispatch, authContext);
//     //     }
//     //   } catch (error) {
//     //     console.log(`Startup ${authContext} timer parse error:`, error);
//     //   } finally {
//     //     clearTimeout(closeTimer);
//     //     ws.close();
//     //   }
//     // };

//     ws.onmessage = async event => {
//       const data = JSON.parse(event.data);
//       console.log(`📩 Startup timer message:`, {
//         authContext,
//         fullEndpoint,
//         data,
//         token,
//       });
//       if (data.status === 'connected') {
//         return;
//       }
//       if (isSessionExpiredMessage(data)) {
//         await clearModuleSessionOnly(dispatch, authContext);
//       }

//       clearTimeout(closeTimer);
//       ws.close();
//     };

//     ws.onerror = error => {
//       console.log(`Startup ${authContext} timer socket error:`, error);
//       clearTimeout(closeTimer);
//       ws.close();
//     };
//   } catch (error) {
//     console.log(`Startup ${authContext} session validation failed:`, error);
//   }
// };

// export const startStartupSessionValidation = async (dispatch: Dispatch) => {
//   const activeChecks = [];

//   for (const check of STARTUP_SESSION_CHECKS) {
//     const hasToken = await hasValidAccessToken(check.authContext);

//     if (hasToken) {
//       activeChecks.push(check);
//     }
//   }

//   activeChecks.forEach(check => {
//     validateOneSessionInBackground(dispatch, check);
//   });
// };
