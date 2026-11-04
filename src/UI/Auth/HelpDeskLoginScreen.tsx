import React, {useMemo, useRef, useState} from 'react';
import {
  Keyboard,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import VectorWave from '../Svg/VectorWave';
import LoginBottomWave from '../Svg/LoginBottomWave';
import Logo from '../Svg/Logo';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {DUO_CONFIG, ENDPOINTS} from '../../Network/Urls';
import {getErrorMessage} from '../../Utils/Helper';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {Routes} from '../../Utils/Routes';
import {authorize} from 'react-native-app-auth';
import CityLogo from '../Svg/CityLogo';

type LoginStep = 'EMAIL' | 'PASSWORD';

const HelpDeskLoginScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const passwordRef = useRef<TextInputInstance>(null);

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );

  const [step, setStep] = useState<LoginStep>('EMAIL');
  const [email, setEmail] = useState(props?.route?.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const validateEmail = () => {
    let isValid = true;
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setEmailError('Please enter email');
      isValid = false;
    } else if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter valid email');
      isValid = false;
    } else {
      setEmailError('');
    }
    return isValid;
  };

  const onVerifyEmail = () => {
    Keyboard.dismiss();
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.helpDeskVerifyEmail,
      method: 'POST',
      payload: {email: email.trim()},
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: async (resp: any) => {
        setLoading(false);
        console.log('verify helpdesk auth ', resp);
        if (resp?.data?.authenticationType === 'SSO_LOGIN') {
          try {
            setLoading(true);
            const redirectUrl = resp?.data?.redirectUrl;
            console.log('Opening SSO URL:', redirectUrl);
            props?.navigation.pop(1);
            await Linking.openURL(redirectUrl);

            // props?.navigation.navigate(Routes.Auth.SSOWebViewScreen, {
            //   redirectUrl,
            //   role: 'helpDesk', // 'SIR' on the SIR login screen
            //   fallbackLoginScreen: Routes.Auth.HelpDeskLoginScreen,
            // });
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
        }

        if (resp?.status) {
          setStep('PASSWORD');
          setTimeout(() => passwordRef.current?.focus(), 100);
        } else {
          if (resp?.data?.error === 'HTTP 404') {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.error,
                message: 'Something went wrong. Please try again.',
              }),
            );
          }
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

  const onSendOtp = async () => {
    Keyboard.dismiss();
    if (!validateEmail()) {
      return;
    }
    if (!password.trim()) {
      setPasswordError('Please enter password');
      return;
    }
    setPasswordError('');

    // Step 2: Existing verify password + send OTP flow
    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.helpDeskVerifyAndSendOtp,
      method: 'POST',
      payload: {
        email: email.trim(),
        password,
      },
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: (resp: any) => {
        setLoading(false);
        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'OTP Sent Successfully',
            }),
          );
          props?.navigation?.navigate(Routes.Auth.HelpDeskOtpScreen, {
            email: email.trim(),
            password,
            nav: props?.route?.params?.nav,
          });
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

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}
        style={{alignSelf: 'stretch'}}>
        <View style={{height: normalized(70)}} />
        {/* <Logo
          width={60}
          height={60}
          primary={colors.Primary}
          secondary={colors.Secondary}
        /> */}
        <CityLogo size={70} showCityName />

        <View style={{height: normalized(24)}} />
        <Text style={styles.Heading}>Help Desk - Login</Text>

        <View style={{width: '100%', paddingTop: normalized(4)}}>
          <Text style={styles.Input_Heading}>Email*</Text>
          <CustomInput
            placeholder="Enter Email"
            value={email}
            setValue={(val: string) => {
              setEmail(val);
              setEmailError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMsg={emailError}
            editable={step === 'EMAIL'}
          />
        </View>

        {step === 'PASSWORD' ? (
          <View style={{width: '100%', paddingTop: normalized(4)}}>
            <Text style={styles.Input_Heading}>Password*</Text>
            <CustomInput
              ref={passwordRef}
              placeholder="Enter Password"
              value={password}
              setValue={(val: string) => {
                setPassword(val);
                setPasswordError('');
              }}
              secureEntry={isPasswordHidden}
              secureTextEntry
              RightIcon={isPasswordHidden ? EyeIcon : HideEyeIcon}
              onRightIconPress={() => setIsPasswordHidden(prev => !prev)}
              errorMsg={passwordError}
              textContentType="password"
              autoComplete="password"
            />
          </View>
        ) : null}

        <View style={{alignSelf: 'stretch', gap: normalized(20)}}>
          <CustomButton
            text={step === 'EMAIL' ? 'Verify Email' : 'Send OTP'}
            onPress={step === 'EMAIL' ? onVerifyEmail : onSendOtp}
            loading={loading}
          />
          {step === 'PASSWORD' ? (
            <View>
              <Text
                accessibilityRole="button"
                style={styles.Desc_Txt}
                allowFontScaling
                onPress={() =>
                  props?.navigation?.navigate(Routes.Auth.Forgot, {
                    email,
                    isHelpDesk: true,
                  })
                }>
                Forgot Password?
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpDeskLoginScreen;

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
  });
