import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Keyboard,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  ActivityIndicator,
  TextInputInstance,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import VectorWave from '../Svg/VectorWave';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getErrorMessage} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import {
  setShowToast,
  setSIRTime,
  setTimeKeepingUserData,
} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import CustomDropDownList from '../Components/CustomDropDownList';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import moment from 'moment';
import CityLogo from '../Svg/CityLogo';
import {hydrateStaffModuleAccess} from '../../Network/Services/StaffModuleManagement';
import {Routes} from '../../Utils/Routes';

type SIRStep = 'SELECT' | 'PASSWORD';

const SIRLoginScreen = (props: ScreenProps) => {
  const [keyboardVisible, setKeyboardVisible] = useState(true);

  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const passwordRef = useRef<TextInputInstance>(null);

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const isOnline = useSelector(
    (state: AppRootStore) => state.SliceReducer.isNetConnected,
  );
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: any) => String(n).padStart(2, '0');
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(false),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(true),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // --- state ---
  const [step, setStep] = useState<SIRStep>('SELECT');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinHide, setPinHide] = useState(true);
  const [overallLoading, setOverallLoading] = useState(true);
  const [guardsList, setGuardsList] = useState<any>([]);
  const [guardIndex, setGuardIndex] = useState<any>(null);
  const [guardError, setGuardError] = useState(false);

  useEffect(() => {
    if (isOnline && guardsList?.length === 0 && !loading) {
      getSecurityGuards();
    }
  }, [isOnline]);

  const getSecurityGuards = async () => {
    setOverallLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.getSecurityGuards,
      method: 'GET',
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setGuardsList(resp?.data?.data);
          setOverallLoading(false);
        } else {
          setOverallLoading(false);
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

  // Step 1: select a name from the list, then verify it.
  // If the guard's account is SSO, redirect out. Otherwise reveal the
  // password field for step 2 (mirrors HelpDeskLoginScreen.onVerifyEmail).
  const onVerifyUser = () => {
    Keyboard.dismiss();

    if (guardIndex == null) {
      setGuardError(true);
      return;
    }
    setGuardError(false);

    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.verifySecurityGuard,
      method: 'POST',
      payload: {id: guardsList[guardIndex]?.id},
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: async (resp: any) => {
        setLoading(false);
        console.log('verify SIR auth ', resp);

        if (resp?.data?.authenticationType === 'SSO_LOGIN') {
          try {
            setLoading(true);
            const redirectUrl = resp?.data?.redirectUrl;
            console.log('Opening SSO URL:', redirectUrl);
            // props?.navigation.navigate(Routes.Auth.SSOWebViewScreen, {
            //   redirectUrl,
            //   role: 'SIR',
            //   fallbackLoginScreen: Routes.Auth.HelpDeskLoginScreen,
            // });
            props?.navigation.pop(1);
            await Linking.openURL(redirectUrl);
            return;
          } catch (error: any) {
            setLoading(false);
            const message =
              error?.message || 'SSO verification failed. Please try again.';
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.error,
                message,
              }),
            );
          }
          return;
        }

        if (resp?.status) {
          setStep('PASSWORD');
          setTimeout(() => passwordRef.current?.focus(), 100);
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

  const onLogin = async () => {
    Keyboard.dismiss();

    let isValid = true;
    if (guardIndex == null) {
      setGuardError(true);
      isValid = false;
    }
    if (!pin) {
      setPinError('Please enter password');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    const obj = {
      id: guardsList[guardIndex]?.id,
      password: pin,
      device: 'mobile',
    };
    apiHandler({
      endpoint: ENDPOINTS.sirSendOtp,
      method: 'POST',
      payload: obj,
      authContext: 'SIR',
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (response: any) => {
        setLoading(false);
        if (response?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'OTP Sent Successfully',
            }),
          );
          props?.navigation?.navigate(Routes.Auth.SIROtpScreen, {
            id: guardsList[guardIndex]?.id,
            password: pin,
            nav: props?.route?.params?.nav,
          });
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(response),
            }),
          );
        }
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insects.top, paddingBottom: insects.bottom},
      ]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topWave}>
        <VectorWave primary={colors.Primary} secondary={colors.Secondary} />
      </View>

      <View style={styles.bottomWave}>
        <LoginBottomWave
          primary={colors.Primary}
          secondary={colors.Secondary}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </View>

      {!overallLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
          style={{alignSelf: 'stretch'}}>
          <View style={{height: normalized(70)}} />
          {/* <Logo
            width={60}
            height={60}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            primary={colors.Primary}
            secondary={colors.Secondary}
          /> */}
          <CityLogo size={70} showCityName />

          <View style={{height: normalized(25)}} />
          <Text style={styles.Heading}>SIR - Login</Text>

          <View style={{flex: 1, width: '100%'}}>
            <Text style={styles.Input_Heading}>Name*</Text>

            <CustomDropDownList
              list={guardsList?.map(o => {
                return `${o.firstName} ${o.lastName[0]}`;
              })}
              selectedIndex={guardIndex}
              onChange={i => {
                setGuardIndex(i);
                setGuardError(false);
              }}
              placeholder="Name"
              error={guardError}
            />
          </View>

          {step === 'PASSWORD' ? (
            <View style={{width: '100%', paddingTop: normalized(4)}}>
              <Text style={styles.Input_Heading}>Password*</Text>
              <CustomInput
                ref={passwordRef}
                placeholder={'Enter Password'}
                value={pin}
                setValue={(val: string) => {
                  setPin(val);
                  setPinError('');
                }}
                errorMsg={pinError}
                RightIcon={pinHide ? EyeIcon : HideEyeIcon}
                onRightIconPress={() => setPinHide(prev => !prev)}
                secureEntry={pinHide}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                importantForAccessibility="yes"
                allowFontScaling
              />
            </View>
          ) : null}

          <View style={{alignSelf: 'stretch'}}>
            <CustomButton
              text={step === 'SELECT' ? 'Verify User' : 'Login'}
              onPress={step === 'SELECT' ? onVerifyUser : onLogin}
              loading={loading}
            />
          </View>
          {step === 'PASSWORD' ? (
            <View>
              <Text
                accessibilityRole="button"
                style={styles.Desc_Txt}
                allowFontScaling
                onPress={() =>
                  props?.navigation?.navigate(Routes.Auth.Forgot, {
                    SIRid: guardsList[guardIndex]?.id,
                    resetAuthContext: 'SIR',
                  })
                }>
                Forgot Password?
              </Text>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      )}
    </View>
  );
};

export default SIRLoginScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      height: ScreenSize.height,
      backgroundColor: colors.Background,
      paddingHorizontal: normalized(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    topWave: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: ScreenSize.width,
      alignItems: 'flex-start',
      zIndex: 0,
    },
    bottomWave: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      zIndex: 0,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      gap: normalized(5),
      zIndex: 1,
      position: 'absolute',
      bottom: normalized(90),
    },
    timebox: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: normalized(2),
    },
    keyTxt: {
      color: colors.Background,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuRegular,
    },
    valueTxt: {
      color: '#ffffff99',
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
    timeBlock: {
      width: normalized(220),
      height: normalized(60),
      borderRadius: normalized(12),
      backgroundColor: colors.Primary,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: normalized(20),
      flexDirection: 'row',
      paddingHorizontal: normalized(12),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
