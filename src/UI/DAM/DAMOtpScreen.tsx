import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Keyboard,
  TextInputInstance,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  IS_TABLET_DEVICE,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import Logo from '../Svg/Logo';
import {Routes} from '../../Utils/Routes';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {getUserProfileReq} from '../../Network/Services/GeneralServices';
import moment from 'moment';
import {removeSingleData, setDataInAsync} from '../../Utils/AsyncStorage';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import {
  setCDRTime,
  setCDRUserData,
  setDAMUserData,
  setResidentUserData,
  setShowToast,
} from '../../Redux/AppReducers';
import {formatTime, getErrorMessage} from '../../Utils/Helper';
import CityLogo from '../Svg/CityLogo';

const DIGITS = 6;

const DAMOtpScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles: any = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [otp, setOtp] = useState('');
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(''));
  const [otpError, setOtpError] = useState('');
  const masterRef = useRef<TextInputInstance | null>(null);
  const [email, setEmail] = useState(props?.route?.params?.objNav?.email ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const dispatch = useDispatch();
  const isDamUser = props?.route?.params?.isDAMLogin;
  console.log('IsDAMuser', isDamUser);
  useEffect(() => {
    const t = setTimeout(() => masterRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  const handleMasterChange = (text: string) => {
    const digits = (text || '').replace(/\D/g, '').slice(0, DIGITS);
    setOtp(digits);
    const next = Array(DIGITS).fill('');
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setValues(next as string[]);
    requestAnimationFrame(() => masterRef.current?.focus());
  };

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const onVerify = async () => {
    Keyboard.dismiss();

    let isFormValid = true;
    if (!otp) {
      setOtpError('.');
      isFormValid = false;
    }
    if (otp?.length < 6) {
      isFormValid = false;
      setOtpError('.');
    }
    if (!isFormValid) {
      return;
    }

    const obj = {
      email,
      endPoint: 'public/matchotp/',
      otp: otp,
    };
    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.vendorLogin,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      authContext: 'DAM',
      onComplete: async (response: any) => {
        if (response?.status) {
          apiHandler({
            endpoint: ENDPOINTS.vendorProfile,
            method: 'GET',
            authContext: 'DAM',
            onComplete: (resp: any) => {
              if (resp?.status) {
                console.log('DAM Response ', resp);
                const currentTime = moment();
                const afterEightHours = currentTime.clone().add(8, 'hours');
                setIsLoading(false);
                let targetRoute: string | null = null;

                if (isDamUser) {
                  targetRoute = resp?.data?.data?.isDAMVendor
                    ? Routes.DAM.HomeScreen
                    : null;
                } else {
                  targetRoute = resp?.data?.data?.isBillingVendor
                    ? Routes.Billing.HomeScreen
                    : null;
                }

                if (!targetRoute) {
                  dispatch(
                    setShowToast({
                      type: AppStrings.ToastType.error,
                      message: 'You dont have permission to access',
                    }),
                  );
                  return;
                }

                dispatch(setDAMUserData(resp?.data?.data));
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Login Successful',
                  }),
                );

                props?.navigation?.pop(1);
                props?.navigation?.replace(targetRoute);
              } else {
                setIsLoading(false);
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.error,
                    message: getErrorMessage(resp),
                  }),
                );
              }
            },
          });
        } else {
          setResendLoading(false);
          setIsLoading(false);
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

  const onResendCode = async () => {
    const obj = {
      email,
    };
    setResendLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.vendorResendOtp,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: async (resp: any) => {
        if (resp?.status) {
          setResendLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'OTP Send Successfully',
            }),
          );
          setSecondsLeft(180);
          setOtp('');
          setValues(Array(DIGITS).fill(''));
          masterRef.current?.focus();
        } else {
          setResendLoading(false);
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

  const activeIndex = Math.min(otp.length, DIGITS - 1);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top - normalized(15),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
      ]}>
      <StatusBar barStyle="light-content" />

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

      <View style={{height: normalized(10)}} />

      <Text style={styles.Heading} accessibilityRole="header">
        OTP Verification
      </Text>

      <Text style={styles.Desc_Txt_N1}>
        Enter the code sent to your email to continue.
      </Text>

      <View style={{height: normalized(50)}} />
      <View
        style={{
          alignSelf: 'center',
          width: IS_TABLET_DEVICE ? '50%' : '100%',
        }}>
        <Text style={styles.Input_Heading}>Enter OTP</Text>
      </View>

      <RNTextInput
        ref={masterRef}
        value={otp}
        onChangeText={handleMasterChange}
        keyboardType="numeric"
        maxLength={DIGITS}
        autoFocus
        autoCorrect={false}
        style={{position: 'absolute', width: 0, height: 0, opacity: 0}}
      />

      <View style={styles.inputWrapper}>
        {Array.from({length: DIGITS}).map((_, idx) => {
          const isActive = idx === activeIndex;
          return (
            <Pressable
              key={idx}
              // onPress={() => masterRef.current?.focus()}
              onPress={() => {
                if (masterRef.current) {
                  masterRef.current.blur();
                  setTimeout(() => {
                    masterRef.current?.focus();
                  }, 100);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={`OTP digit ${idx + 1}`}
              style={[
                styles.inputCont,
                {
                  borderColor: isActive ? colors.Primary : colors.BorderColor,
                  borderWidth: isActive ? 2 : 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: normalized(18),
                  paddingVertical: normalized(6),
                  color: colors.Heading_Txt,
                }}>
                {values[idx] || ' '}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{marginTop: normalized(25), alignSelf: 'center'}}>
        {resendLoading ? (
          <ActivityIndicator color={colors.Primary} size={'small'} />
        ) : (
          <Text
            style={styles.Text_Button}
            onPress={() => {
              // if (secondsLeft == 0) {
              onResendCode();

              // }
            }}>
            {secondsLeft > 0 ? formatTime(secondsLeft) : 'Resend'}
          </Text>
        )}
      </View>

      <View style={{width: '100%', marginTop: normalized(10)}}>
        <CustomButton
          text={'Verify'}
          onPress={onVerify}
          loading={isLoading}
          accessibilityRole="button"
          accessibilityLabel={'Verify'}
          accessibilityHint={'Verifies your OTP'}
        />
      </View>

      <View style={{height: normalized(25)}} />
      <Text
        style={styles.Text_Button}
        onPress={() => props?.navigation?.goBack?.()}>
        Back
      </Text>
    </View>
  );
};

export default DAMOtpScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      height: ScreenSize.height,
      backgroundColor: colors.Background,
      paddingHorizontal: normalized(20),
      alignItems: 'center',
    },
    inputCont: {
      height: normalized(48),
      width: normalized(44),
      borderRadius: normalized(8),
      backgroundColor: colors.Background,
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: IS_TABLET_DEVICE ? '50%' : '100%',
    },
  });
