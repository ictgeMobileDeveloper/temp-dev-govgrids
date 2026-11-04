// AuthBootstrapService.ts
import {Dispatch} from 'redux';
import {AUTH_CONTEXT_CONFIG} from '../../Utils/AppStrings';
import {apiHandler, hasValidAccessToken} from './ApiHandler';
import {removeSingleData} from '../../Utils/AsyncStorage';
import {clearAuthContext} from './AuthTokenService';
import {ROLE_LOGOUT_MAP} from './ForceLogout';
import {getApp} from '@react-native-firebase/app';
import {deleteToken, getMessaging} from '@react-native-firebase/messaging';

const clearInvalidAuthContext = async (
  dispatch: Dispatch,
  context: keyof typeof AUTH_CONTEXT_CONFIG,
) => {
  const config = AUTH_CONTEXT_CONFIG[context];

  console.log(`🧹 Clearing ${context} after 401`);

  try {
    await new Promise(resolve => {
      apiHandler({
        endpoint: ROLE_LOGOUT_MAP[context].endpoint,
        method: 'POST',
        payload: {},
        authContext: context,
        onComplete: (resp: any) => {
          console.log(`${context} logout response`, resp);
          resolve(resp);
        },
      });
    });
  } catch (e) {
    console.log(`${context} logout API failed`, e);
  }

  try {
    await deleteToken(getMessaging(getApp()));
    console.log(`🔥 FCM deleted for ${context}`);
  } catch (e) {
    console.log(`FCM delete failed ${context}`, e);
  }

  dispatch(config.reduxSetter(null));

  await clearAuthContext(context);

  await removeSingleData(config.asyncKey);
};

export const bootstrapAuthState = async (dispatch: Dispatch) => {
  console.log('🚀 Bootstrapping auth state...');

  const contexts = Object.keys(AUTH_CONTEXT_CONFIG) as Array<
    keyof typeof AUTH_CONTEXT_CONFIG
  >;

  for (const context of contexts) {
    const config = AUTH_CONTEXT_CONFIG[context];
    console.log(
      ' AUTH_CONTEXT_CONFIG[context]--->>>. ',
      AUTH_CONTEXT_CONFIG[context],
    );
    try {
      const hasToken = await hasValidAccessToken(context);

      console.log(`🔍 ${context} has token:`, hasToken);

      if (!hasToken) {
        // Ensure stale data is removed
        dispatch(config.reduxSetter(null));
        await removeSingleData(config.asyncKey);
        continue;
      }

      await new Promise<void>(resolve => {
        apiHandler({
          endpoint: config.profileEndpoint,
          method: 'GET',
          authContext: context,
          onComplete: async res => {
            if (res.status && res.data?.data) {
              console.log(`✅ ${context} profile verified`);
              dispatch(config.reduxSetter(res.data.data));
            } else if (res.httpStatus === 401) {
              console.log(`❌ ${context} token expired (401)`);
              await clearInvalidAuthContext(dispatch, context);
            } else {
              console.warn(
                `⚠️ ${context} profile failed but keeping session`,
                res,
              );
            }
            resolve();
          },
        });
      });
    } catch (err) {
      console.error(`🔥 ${context} bootstrap failed`, err);
    }
  }

  console.log('✅ Auth bootstrap completed');
};
