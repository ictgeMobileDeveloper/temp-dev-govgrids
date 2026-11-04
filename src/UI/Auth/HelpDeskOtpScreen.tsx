import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
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
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import {
  setHelpDeskUserData,
  setShowToast,
  setSIRUserData,
} from '../../Redux/AppReducers';
import {Routes} from '../../Utils/Routes';
import {
  clearAuthContext,
  resetSessionExpired,
} from '../../Network/Services/AuthTokenService';
import CityLogo from '../Svg/CityLogo';
import {hydrateStaffModuleAccess} from '../../Network/Services/StaffModuleManagement';
import {removeSingleData} from '../../Utils/AsyncStorage';

const DIGITS = 6;

const HelpDeskOtpScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles: any = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const sirUser = useSelector(
    (state: AppRootStore) => state.SliceReducer.SIRUserData,
  );
  const [otp, setOtp] = useState('');
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const masterRef = useRef<TextInputInstance | null>(null);

  const email = props?.route?.params?.email ?? '';
  const password = props?.route?.params?.password ?? '';

  useEffect(() => {
    const t = setTimeout(() => masterRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleMasterChange = (text: string) => {
    const digits = (text || '').replace(/\D/g, '').slice(0, DIGITS);
    setOtp(digits);
    const next = Array(DIGITS).fill('');
    for (let i = 0; i < digits.length; i++) {
      next[i] = digits[i];
    }
    setValues(next as string[]);
    requestAnimationFrame(() => masterRef.current?.focus());
  };

  const onVerify = () => {
    Keyboard.dismiss();
    if (!otp || otp.length < DIGITS) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Please enter valid OTP',
        }),
      );
      return;
    }

    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.helpDeskLogin,
      method: 'POST',
      payload: {
        email,
        otp,
        device: 'mobile',
      },
      authContext: 'HELPDESK',
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: (response: any) => {
        if (response?.status) {
          console.log('resposne of', response);
          if (response?.data?.data?.resetPasswordRequired) {
            props?.navigation?.replace(Routes.Auth.Forgot, {
              resetPass: true,
              email: email,
              resetAuthContext: 'HELPDESK',
            });
            return;
          }
          apiHandler({
            endpoint: ENDPOINTS.helpDeskGetProfile,
            method: 'GET',
            authContext: 'HELPDESK',
            onComplete: async (resp: any) => {
              setIsLoading(false);
              if (resp?.status) {
                console.log('Get Requester HelpDesk Profile', resp);
                const profile = resp?.data?.data;
                const isSameUserAsSIR =
                  sirUser?.id &&
                  profile?.id &&
                  String(sirUser.id) === String(profile.id);

                if (isSameUserAsSIR) {
                  await clearAuthContext('SIR');
                  dispatch(setSIRUserData(null));
                  await removeSingleData(AsyncKeyStrings.SIRUserData);
                }
                dispatch(setHelpDeskUserData(profile));
                resetSessionExpired('HELPDESK');
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Login Successful',
                  }),
                );
                props?.navigation?.pop(1);
                props?.navigation?.replace(
                  props?.route?.params?.nav ?? Routes.HelpDesk.HomeScreen,
                  {
                    authContext: 'HELPDESK',
                  },
                );
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
        } else {
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

  const onResendCode = () => {
    setResendLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.helpDeskVerifyAndSendOtp,
      method: 'POST',
      payload: {
        email,
        password,
      },
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: (resp: any) => {
        setResendLoading(false);
        if (resp?.status) {
          setSecondsLeft(180);
          setOtp('');
          setValues(Array(DIGITS).fill(''));
          masterRef.current?.focus();
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'OTP Sent Successfully',
            }),
          );
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

  const activeIndex = Math.min(otp.length, DIGITS - 1);
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

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
              onPress={() => {
                if (masterRef.current) {
                  masterRef.current.blur();
                  setTimeout(() => {
                    masterRef.current?.focus();
                  }, 100);
                }
              }}
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
              if (secondsLeft === 0) {
                onResendCode();
              }
            }}>
            {secondsLeft > 0 ? `${mins}:${secs}` : 'Resend'}
          </Text>
        )}
      </View>

      <View style={{width: '100%', marginTop: normalized(10)}}>
        <CustomButton text={'Verify'} onPress={onVerify} loading={isLoading} />
      </View>

      <View style={{height: normalized(25)}} />
      <Text
        style={styles.Text_Button}
        onPress={() => props?.navigation?.goBack()}>
        Back
      </Text>
    </View>
  );
};

export default HelpDeskOtpScreen;

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
