import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import {useRoute, useNavigation, StackActions} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {
  setShowToast,
  setHelpDeskUserData,
  setSIRUserData,
} from '../../Redux/AppReducers';
import {Routes} from '../../Utils/Routes';
import {AppStrings, AsyncKeyStrings, AuthContext} from '../../Utils/AppStrings';
import {ENDPOINTS} from '../../Network/Urls';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {storeAccessToken} from '../../Network/Services/ApiHandler';
import {getErrorMessage} from '../../Utils/Helper';
import {clearAuthContext} from '../../Network/Services/AuthTokenService';
import {removeSingleData} from '../../Utils/AsyncStorage';

interface SAMLCallbackParams {
  accessToken?: string;
  expiresIn?: string;
  role?: 'helpDesk' | 'SIR';
}

// Everything that differs per-role lives here, one place to extend.
const ROLE_CONFIG = {
  helpDesk: {
    authContext: 'HELPDESK' as AuthContext,
    profileEndpoint: ENDPOINTS.helpDeskGetProfile,
    setUserData: setHelpDeskUserData,
    homeScreen: Routes.HelpDesk.HomeScreen,
    loginScreen: Routes.Auth.HelpDeskLoginScreen,
    // only for helpDesk and SIR
    otherAuthContext: 'SIR' as AuthContext,
    otherAsyncKey: AsyncKeyStrings.SIRUserData,
    otherSetUserData: setSIRUserData,
  },
  SIR: {
    authContext: 'SIR' as AuthContext,
    profileEndpoint: ENDPOINTS.sirGetProfile,
    setUserData: setSIRUserData,
    homeScreen: Routes.SIR.HomeScreen,
    loginScreen: Routes.Auth.SIRLoginScreen,
    // only for helpDesk and SIR
    otherAuthContext: 'HELPDESK' as AuthContext,
    otherAsyncKey: AsyncKeyStrings.HelpDeskUserData,
    otherSetUserData: setHelpDeskUserData,
  },
};

const SAMLCallbackScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const helpDeskUser = useSelector(
    (state: any) => state.SliceReducer?.helpDeskUserData,
  );
  const sirUser = useSelector((state: any) => state.SliceReducer?.SIRUserData);
  const otherUserByRole = {helpDesk: sirUser, SIR: helpDeskUser};

  useEffect(() => {
    const {accessToken, expiresIn, role} =
      (route.params as SAMLCallbackParams) || {};
    console.log('SAMLCallback params:', route.params);

    const config = role ? ROLE_CONFIG[role] : undefined;

    if (!accessToken || !config) {
      console.log('SAMLCallback: missing token or unknown role', {
        accessToken,
        role,
      });
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'SSO verification failed',
        }),
      );
      navigation.dispatch(
        StackActions.replace(
          config?.loginScreen ?? Routes.Auth.HelpDeskLoginScreen,
        ),
      );
      return;
    }

    (async () => {
      try {
        await storeAccessToken(accessToken, config.authContext);

        apiHandler({
          endpoint: config.profileEndpoint,
          method: 'GET',
          authContext: config.authContext,
          onComplete: async (resp: any) => {
            if (resp?.status) {
              const profile = resp?.data?.data;
              const otherUser = otherUserByRole[role!];
              const isSameUserAsOther =
                otherUser?.id &&
                profile?.id &&
                String(otherUser.id) === String(profile.id);

              if (isSameUserAsOther) {
                await clearAuthContext(config.otherAuthContext);
                dispatch(config.otherSetUserData(null));
                await removeSingleData(config.otherAsyncKey);
              }

              dispatch(config.setUserData(profile));
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.success,
                  message: 'Login Successful',
                }),
              );
              navigation.dispatch(
                StackActions.replace(config.homeScreen, {
                  authContext: config.authContext,
                }),
              );
            } else {
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.error,
                  message: getErrorMessage(resp),
                }),
              );
              navigation.dispatch(StackActions.replace(config.loginScreen));
            }
          },
        });
      } catch (err) {
        console.error('SAMLCallback error:', err);
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'Something went wrong finishing sign-in',
          }),
        );
        navigation.dispatch(StackActions.replace(config.loginScreen));
      }
    })();
  }, [route.params, dispatch, navigation]);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size="large" color="#0A66C2" />
    </View>
  );
};

export default SAMLCallbackScreen;
