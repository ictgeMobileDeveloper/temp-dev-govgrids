import {
  AppState,
  Linking,
  Platform,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {NavigationContainer} from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from './src/Redux/AppStore';
import {
  AppColors,
  isAndroid15Plus,
  navigationRef,
} from './src/Utils/AppConstants';
import {setDarkTheme, setThemeColors} from './src/Redux/AppReducers';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import ReCaptcha, {
  GoogleRecaptchaRefAttributes,
} from '@valture/react-native-recaptcha-v3';
import {
  Base_Url,
  SECRET_KEYS,
  STRIPE_TEST_PUBLIC_KEY,
  STRIPE_TEST_PUBLISH_KEY,
} from './src/Network/Urls';
import AppContainer from './src/AppContainer';
import {
  setRecaptchaTokenProvider,
  useRecaptchaRemount,
} from './src/Network/Services/ApiHandler';
import Geocoder from 'react-native-geocoding';
import NetInfo from '@react-native-community/netinfo';
import {StripeProvider} from '@stripe/stripe-react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {getDataAsync} from './src/Utils/AsyncStorage';
import {AsyncKeyStrings} from './src/Utils/AppStrings';
import Config from 'react-native-config';
import {parseCallbackUrlParams, tryClaimSamlCallback} from './src/Utils/Helper';
import {linking} from './src/Config/DeepLinkConfig';
import CustomConfirmModal, {
  PaymentAlert,
} from './src/UI/Components/ConfirmationModal';
import GlobalPaymentAlert from './src/UI/Components/GlobalPaymentAlert';

const ReCaptchaContext =
  createContext<React.MutableRefObject<GoogleRecaptchaRefAttributes | null> | null>(
    null,
  );

export const useReCaptcha = () => {
  const ctx = useContext(ReCaptchaContext);
  if (!ctx)
    throw new Error('useReCaptcha must be used within ReCaptchaProvider');
  return ctx;
};

const App = () => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const remount = useRecaptchaRemount();
  const dispatch = useDispatch();
  const recaptchaRef = useRef<GoogleRecaptchaRefAttributes>(null);
  const [recaptchaInstanceKey, setRecaptchaInstanceKey] = useState(0);
  const initialNetworkSettled = useRef(false);
  const wasOffline = useRef(false);
  const sleep = (ms: number) =>
    new Promise<void>(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = Boolean(
        state.isConnected &&
          (state.isInternetReachable == null || state.isInternetReachable),
      );

      if (!initialNetworkSettled.current) {
        initialNetworkSettled.current = true;
        wasOffline.current = !connected;
        return;
      }

      if (connected && wasOffline.current) {
        wasOffline.current = false;
        setRecaptchaInstanceKey(key => key + 1);
      } else if (!connected) {
        wasOffline.current = true;
      }
    });

    return unsubscribe;
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') remount;
    });
    return () => sub.remove();
  }, [remount]);

  // const primary = '#01BD91';
  // const secondary = '#98C1D9';

  const primary =
    selector?.baseData?.theme?.primaryColor ?? Config.PRIMARY_COLOR;
  const secondary =
    selector?.baseData?.theme?.secondaryColor ?? Config.SECONDARY_COLOR;
  const accent = selector?.baseData?.theme?.accentColor ?? Config.ACCENT_COLOR;

  // use state, not a mutable let
  const systemScheme = useColorScheme();
  const [isDarkTheme, setIsDarkTheme] = useState(
    // true,
    selector?.isSystemDefault
      ? systemScheme === 'dark'
        ? true
        : false
      : selector?.isDarkTheme
      ? true
      : false,
  );

  useEffect(() => {
    // return;
    handleTheme();
    setIsDarkTheme(
      selector?.isSystemDefault
        ? systemScheme == 'dark'
          ? true
          : false
        : selector?.isDarkTheme
        ? true
        : false,
    );
    dispatch(setDarkTheme(selector?.isDarkTheme));
  }, [selector?.isDarkTheme, selector?.isSystemDefault, systemScheme]);

  useEffect(() => {
    geoCodingInit();
  }, []);

  useEffect(() => {
    setRecaptchaTokenProvider(async action => {
      for (let attempt = 1; attempt <= 8; attempt += 1) {
        try {
          if (!recaptchaRef.current) {
            await sleep(400);
            continue;
          }

          if (recaptchaRef.current.isReady && !recaptchaRef.current.isReady()) {
            for (let readyAttempt = 0; readyAttempt < 10; readyAttempt += 1) {
              if (recaptchaRef.current.isReady()) {
                break;
              }
              await sleep(500);
            }
          }

          const token = await recaptchaRef.current.getToken(action);
          if (token) {
            return token;
          }
        } catch (_err) {
          console.log('Recaptcha Error ', _err);
        }

        if (attempt < 8) {
          await sleep(500);
        }
      }

      return undefined;
    });

    return () => {
      setRecaptchaTokenProvider(null);
    };
  }, []);

  const handleTheme = async () => {
    const mode: any = await getDataAsync(AsyncKeyStrings.theme);
    if (mode?.theme == 'dark') {
      dispatch(setDarkTheme(true));
    } else if (mode?.theme == 'light') {
      dispatch(setDarkTheme(false));
    } else {
      dispatch(setDarkTheme(systemScheme === 'dark'));
    }
  };

  const colors = useMemo(
    () => ({
      ...AppColors,
      Primary: primary,
      Secondary: secondary,
      Accent: accent,
      Background: isDarkTheme ? AppColors.Black : AppColors.White,
      ScreenBackground: isDarkTheme ? AppColors.Black : AppColors.White,
      Desc_Txt: isDarkTheme ? '#fff9' : 'rgba(1, 1, 1, 0.6)',
      Heading_Txt: isDarkTheme ? AppColors.White : AppColors.Black,
      BorderColor: isDarkTheme ? '#ffffff60' : '#0000001F',
      Disabled: '#ffffff60',
    }),
    [isDarkTheme, primary, secondary],
  );

  // dispatch the latest colors
  useEffect(() => {
    dispatch(setThemeColors(colors));
  }, [colors, dispatch]);

  const geoCodingInit = () => {
    Geocoder.init(SECRET_KEYS.GOOGLE_MAP_KEY);
  };

  const [initialRoute, setInitialRoute] = useState<any>(null);

  useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      console.log(url);
      if (url != null) {
        const {role, accessToken, expiresIn} = parseCallbackUrlParams(url);
        console.log('parsed callback:', {url, role, accessToken, expiresIn});
        if (accessToken) {
          setInitialRoute({
            name: 'SAMLCallback',
            params: {accessToken, expiresIn, role},
          });
        }
      }
    };
    getInitialURL();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      console.log(url);
      const {role, accessToken, expiresIn} = parseCallbackUrlParams(url);
      console.log('parsed callback:', {url, role, accessToken, expiresIn});
      if (accessToken) {
        navigationRef.navigate({
          name: 'SAMLCallback',
          params: {accessToken, expiresIn, role},
        } as never);
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <ReCaptchaContext.Provider value={recaptchaRef}>
      <StripeProvider publishableKey={STRIPE_TEST_PUBLISH_KEY}>
        <SafeAreaProvider>
          <KeyboardProvider statusBarTranslucent>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.Background,
              }}>
              <ReCaptcha
                key={recaptchaInstanceKey}
                ref={recaptchaRef}
                siteKey={SECRET_KEYS.captchaSiteKey}
                baseUrl={Base_Url}
                action="global"
                onVerify={() => {}}
                onError={err => {
                  console.log('🔴 [ReCaptcha] widget error:', err);
                  remount;
                }}
                containerStyle={styles.recaptchaContainer}
              />
              <NavigationContainer ref={navigationRef} linking={linking}>
                <AppContainer />
                <GlobalPaymentAlert />
              </NavigationContainer>
            </View>
          </KeyboardProvider>
        </SafeAreaProvider>
      </StripeProvider>
    </ReCaptchaContext.Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  recaptchaContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    zIndex: -100,
  },
});

// -------------------

// Date time picker (time) max min issue on android
