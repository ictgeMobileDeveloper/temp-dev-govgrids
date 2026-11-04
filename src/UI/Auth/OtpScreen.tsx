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
  TextInput,
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
import {removeSingleData, setDataInAsync} from '../../Utils/AsyncStorage';
import {
  AppStrings,
  AsyncKeyStrings,
  CurrentStates,
} from '../../Utils/AppStrings';
import {
  setCurrentState,
  setOfflineFoiaReq,
  setResidentUserData,
  setShowToast,
} from '../../Redux/AppReducers';
import {formatTime, getErrorMessage} from '../../Utils/Helper';
import CityLogo from '../Svg/CityLogo';
import {fetchActiveParkingSessions} from '../../Network/Services/ParkingSessionService';

const DIGITS = 6;

const OtpScreen = (props: ScreenProps) => {
  const insets = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles: any = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [otp, setOtp] = useState('');
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(''));
  const [otpError, setOtpError] = useState('');
  const masterRef = useRef<TextInputInstance | null>(null);
  const [email, setEmail] = useState(props?.route?.params?.email ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const dispatch = useDispatch();
  const route = props?.route?.params?.route;
  const type = props?.route?.params?.type;
  const isFoiaOtp = props?.route?.params?.isFoiaOtp;
  const routeParams = props?.route?.params?.routeParams ?? {};
  const [secondsLeft, setSecondsLeft] = useState(isFoiaOtp ? 300 : 180);

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

  const removeOfflineRequestLocally = async (item: any, index: number) => {
    const currentOfflineRequests = Array.isArray(selector?.offlineFoiaRequests)
      ? selector?.offlineFoiaRequests
      : [];

    const removeIndex = currentOfflineRequests.findIndex(
      (req: any, reqIndex: number) => {
        if (req?.id != null && item?.id != null) {
          return req?.id === item?.id;
        }

        return reqIndex === index;
      },
    );

    const updatedOfflineRequests =
      removeIndex >= 0
        ? [
            ...currentOfflineRequests.slice(0, removeIndex),
            ...currentOfflineRequests.slice(removeIndex + 1),
          ]
        : currentOfflineRequests;

    await setDataInAsync(AsyncKeyStrings.FoiaRequests, updatedOfflineRequests);
    dispatch(setOfflineFoiaReq(updatedOfflineRequests));
  };

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

    if (props?.route?.params?.OTPFor == 'public-signup-otp') {
      const obj = {
        email: email,
        otp: otp,
        endPoint: 'verifySignupEmail/',
      };
      setIsLoading(true);
      apiHandler({
        endpoint: ENDPOINTS.verify_Signup_Email,
        method: 'POST',
        payload: obj,
        useRecaptcha: true,
        recaptchaAction: 'login',
        authContext: 'RESIDENT',
        onComplete: async (resp: any) => {
          if (resp?.status) {
            getUserProfileReq(ENDPOINTS.getProfile, (response: any) => {
              if (response?.status) {
                setDataInAsync(
                  AsyncKeyStrings.ResidentUserData,
                  response?.data,
                );
                dispatch(setResidentUserData(response?.data));
                if (route) {
                  props?.navigation?.pop(2);
                  props?.navigation?.replace(route);
                } else {
                  props?.navigation?.pop(2);
                  props?.navigation?.replace(Routes.Resident.HomeScreen);
                }
                dispatch(setCurrentState(CurrentStates.Resident_Logged_In));
              } else {
                dispatch(setCurrentState(CurrentStates.Resident_No_Login));
                dispatch(setResidentUserData(null));
                removeSingleData(AsyncKeyStrings.ResidentUserData);
              }
            });

            setIsLoading(false);
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
    } else if (
      props?.route?.params?.isLoginScreen ||
      props?.route?.params?.isResident
    ) {
      const obj = {
        email: email,
        otp: otp,
        endPoint: 'citizenUser/login/',
        device: 'mobile',
        platform: Platform.OS,
      };

      setIsLoading(true);

      apiHandler({
        endpoint: ENDPOINTS.login,
        method: 'POST',
        payload: obj,
        useRecaptcha: true,
        recaptchaAction: 'login',
        authContext: 'RESIDENT',
        onComplete: async (resp: any) => {
          if (resp?.status) {
            setIsLoading(false);
            if (resp?.status) {
              apiHandler({
                endpoint: ENDPOINTS.getProfile,
                method: 'GET',
                authContext: 'RESIDENT',

                onComplete: (response: any) => {
                  if (response?.status) {
                    setDataInAsync(
                      AsyncKeyStrings.ResidentUserData,
                      response?.data?.data,
                    );
                    dispatch(setResidentUserData(response?.data?.data));
                    fetchActiveParkingSessions(
                      dispatch,
                      response?.data?.data?.id,
                    );
                    if (route) {
                      props?.navigation?.pop(2);
                      props?.navigation?.navigate(route, {type});
                    } else {
                      props?.navigation?.pop(1);
                      props?.navigation?.replace(Routes.Resident.HomeScreen);
                    }

                    if (props?.route?.params?.isResident) {
                      dispatch(
                        setShowToast({
                          type: AppStrings.ToastType.success,
                          message: 'Logged In Successfully',
                        }),
                      );
                    } else {
                    }
                  }
                },
              });
            }
          } else {
            setIsLoading(false);
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.error,
                message: resp?.message ?? resp?.error,
              }),
            );
          }
        },
      });
    } else if (isFoiaOtp) {
      setIsLoading(true);
      apiHandler({
        endpoint: ENDPOINTS.verifyFoiaOtp,
        method: 'POST',
        payload: {otp: otp},
        recaptchaAction: 'otp',
        useRecaptcha: true,
        onComplete: async (resp: any) => {
          if (resp?.status) {
            if (props?.route?.params?.isOfflineReq) {
              removeOfflineRequestLocally(
                props?.route?.params?.item,
                props?.route?.params?.index,
              );
            }
            props?.navigation?.pop(props?.route?.params?.isOfflineReq ? 1 : 2);
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.success,
                message: resp?.data?.message,
              }),
            );
          } else {
            setIsLoading(false);
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.error,
                message: resp?.message ?? resp?.error,
              }),
            );
          }
        },
      });
    }
  };

  const onResendCode = async () => {
    const obj = {
      email,
    };
    setResendLoading(true);

    apiHandler({
      endpoint: isFoiaOtp ? ENDPOINTS.resentFoiaOtp : ENDPOINTS.resendOtp,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: async (resp: any) => {
        if (resp?.status) {
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
          setResendLoading(false);
        } else {
          setResendLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp?.message ?? resp?.error,
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
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

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

      <Text style={[styles.Desc_Txt_N1, {marginTop: normalized(12)}]}>
        {isFoiaOtp
          ? 'Thank you for submitting your Freedom of Information Act (FOIA) request. However, your request cannot move forward until you verify the One-Time Password (OTP) that has been sent to your email.'
          : 'Enter the code sent to your email to continue.'}
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
        returnKeyType="done"
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
                  masterRef.current.blur(); // ensure blur first
                  setTimeout(() => {
                    masterRef.current?.focus(); // refocus after short delay
                  }, 100); // small delay to allow keyboard re-opening
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
              onResendCode();
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

export default OtpScreen;

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
