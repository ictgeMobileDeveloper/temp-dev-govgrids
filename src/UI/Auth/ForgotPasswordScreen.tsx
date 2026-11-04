import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  Pressable,
  TextInputInstance,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import TickIcon from '../Svg/TickIcon';
import CloseIcon from '../Svg/CloseIcon';
import {formatTime, getErrorMessage} from '../../Utils/Helper';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import CityLogo from '../Svg/CityLogo';
import {Routes} from '../../Utils/Routes';

const DIGITS = 6;
const States = {Email: 'Email', OTP: 'OTP', Password: 'Password'};

const ForgotPasswordScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  // ---- route params ----
  const resetPass = props?.route?.params?.resetPass; // coming from OTP screen
  const email = props?.route?.params?.email?.toLowerCase();
  const resetAuthContext = props?.route?.params?.resetAuthContext;
  const SIRid = props?.route?.params?.id;
  const isResidentTrue =
    props?.route?.params?.isResident === true ||
    resetAuthContext === 'RESIDENT';

  // ---- state ----
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  // If OTP was already verified on the previous screen, jump to Password step
  const [currentState, setCurrentState] = useState(
    resetPass ? States.Password : States.Email,
  );
  const masterRef = useRef<TextInputInstance | null>(null);
  const [otp, setOtp] = useState('');
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(''));
  const activeIndex = Math.min(otp.length, DIGITS - 1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordHide, setPasswordHide] = useState(true);
  const [confirmPasswordHide, setConfirmPasswordHide] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [resendLoading, setResendLoading] = useState(false);

  // ---- password validation ----
  const passwordHasAllCharacterTypes =
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  const passwordHasMinLength = password.length >= 12;

  // ---- endpoints ----

  const forgotPasswordEndpoint = isResidentTrue
    ? ENDPOINTS.residentForgetPassword
    : ENDPOINTS.cusadminForgetPassword;

  const matchOtpEndpoint = isResidentTrue
    ? ENDPOINTS.residentMatchOtp
    : ENDPOINTS.cusadminMatchOtp;

  const resetPasswordEndpoint = isResidentTrue
    ? ENDPOINTS.residentresetPassword
    : ENDPOINTS.cusadminresetPassword;

  console.log(isResidentTrue);
  // ---- OTP countdown (runs only on OTP step, cleaned up properly) ----
  useEffect(() => {
    if (currentState !== States.OTP || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentState, secondsLeft === 0]);

  const showError = (resp: any) =>
    dispatch(
      setShowToast({
        type: AppStrings.ToastType.error,
        message: getErrorMessage(resp),
      }),
    );

  // ---- API calls ----
  const onSendOtp = async () => {
    setLoading(true);
    apiHandler({
      endpoint: forgotPasswordEndpoint,
      method: 'POST',
      payload: {email},
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        setLoading(false);
        if (resp?.status) {
          setSecondsLeft(180);
          setCurrentState(States.OTP);
        } else {
          showError(resp);
        }
      },
    });
  };

  const onVerifyOtp = async () => {
    if (otp.length < DIGITS) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Please enter the 6 digit OTP',
        }),
      );
      return;
    }
    setLoading(true);

    apiHandler({
      endpoint: matchOtpEndpoint,
      method: 'POST',
      payload: {
        email,
        otp,
      },
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        setLoading(false);
        if (resp?.status) {
          setCurrentState(States.Password);
        } else {
          showError(resp);
        }
      },
    });
  };

  const validatePasswords = () => {
    let valid = true;
    if (!password) {
      setPasswordError('Please Enter Password');
      valid = false;
    } else if (password.length < 12) {
      setPasswordError('Password must be 12 characters long');
      valid = false;
    } else if (!passwordHasAllCharacterTypes) {
      setPasswordError(
        'Password must include uppercase, lowercase and special character',
      );
      valid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Please Enter Password');
      valid = false;
    } else if (confirmPassword.length < 12) {
      setConfirmPasswordError('Password must be 12 characters long');
      valid = false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    }
    return valid;
  };

  const onResetPassword = async () => {
    if (!validatePasswords()) return;
    setLoading(true);

    // SIR resets by id, everything else by email.
    // OTP is only sent when it was verified inside this screen (resident flow).
    const payload = {
      ...(resetAuthContext === 'SIR' ? {id: SIRid} : {email}),
      ...(isResidentTrue && otp ? {otp} : {}),
      newPassword: password,
      confirmPassword,
    };

    apiHandler({
      endpoint: resetPasswordEndpoint,
      method: 'POST',
      payload,
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        setLoading(false);
        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message ?? 'Password Changed Successfully',
            }),
          );

          if (resetPass) {
            // Came from OTP screen: unwind stack, then route to proper login
            props?.navigation?.pop(2);
            if (resetAuthContext === 'HELPDESK') {
              props?.navigation?.navigate(Routes.Auth.HelpDeskLoginScreen, {
                email,
              });
            } else if (resetAuthContext === 'SIR') {
              props?.navigation?.navigate(Routes.Auth.SIRLoginScreen);
            } else {
              props?.navigation?.navigate(Routes.Auth.Login, {email});
            }
          } else {
            props?.navigation?.goBack();
          }
        } else {
          showError(resp);
        }
      },
    });
  };

  const handleMasterChange = (text: string) => {
    const digits = (text || '').replace(/\D/g, '').slice(0, DIGITS);
    setOtp(digits);
    const next = Array(DIGITS).fill('');
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setValues(next as string[]);
    requestAnimationFrame(() => masterRef.current?.focus());
  };

  const onResendCode = async () => {
    if (secondsLeft > 0) return;
    setResendLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.resendOtp,
      method: 'POST',
      payload: {email},
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: async (resp: any) => {
        setResendLoading(false);
        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'OTP Sent Successfully',
            }),
          );
          setSecondsLeft(180);
          setOtp('');
          setValues(Array(DIGITS).fill(''));
          masterRef.current?.focus();
        } else {
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

  const renderRequirement = (ok: boolean, label: string) => (
    <View style={styles.passwordRequirementRow}>
      {ok ? (
        <TickIcon
          primary={colors.Primary}
          width={normalized(15)}
          height={normalized(15)}
        />
      ) : (
        <CloseIcon
          strokeWidth={4}
          primary={colors.Error}
          width={normalized(15)}
          height={normalized(15)}
        />
      )}
      <Text
        style={[
          styles.Desc_Txt_N,
          {fontSize: normalized(10), textAlign: 'left'},
        ]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insects.top, paddingBottom: insects.bottom},
      ]}>
      <StatusBar barStyle={'light-content'} />

      <View style={{height: normalized(70)}} />
      <CityLogo size={70} showCityName />

      <View style={{height: normalized(25)}} />
      <Text
        style={[styles.Heading, {fontFamily: AppFonts.UbuntuBold}]}
        accessibilityRole="header"
        allowFontScaling>
        {currentState == States.Email
          ? 'Forgot Password?'
          : currentState == States.OTP
          ? 'Verify OTP'
          : 'Reset Password'}
      </Text>
      <View style={{height: normalized(5)}} />

      <Text style={[styles.Desc_Txt]} allowFontScaling>
        {currentState == States.Email
          ? "Don't worry, it happens. Enter your email to reset your password."
          : currentState == States.OTP
          ? "We've sent a reset password to your email. Please check your inbox or spam folder for verification"
          : 'Reset Your new Password and login with new password'}
      </Text>
      <View style={{height: normalized(34)}} />

      <View style={{width: '100%'}}>
        {currentState == States.Email ? (
          <>
            <Text
              style={styles.Input_Heading}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              Email
            </Text>
            <CustomInput
              placeholder={'Enter Email'}
              isEditable={false}
              value={email}
              setValue={() => setEmailError('')}
              errorMsg={emailError}
            />
          </>
        ) : currentState == States.OTP ? (
          <>
            <Text
              style={styles.Input_Heading}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              Enter OTP
            </Text>
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
                    accessibilityRole="button"
                    accessibilityLabel={`OTP digit ${idx + 1}`}
                    style={[
                      styles.inputCont,
                      {
                        borderColor: isActive
                          ? colors.Primary
                          : colors.BorderColor,
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
                <Text style={styles.Text_Button} onPress={onResendCode}>
                  {secondsLeft > 0 ? formatTime(secondsLeft) : 'Resend'}
                </Text>
              )}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.Input_Heading}>Password</Text>
            <CustomInput
              placeholder={'Enter Password'}
              value={password}
              setValue={(val: string) => {
                setPassword(val);
                setPasswordError('');
              }}
              errorMsg={passwordError}
              RightIcon={passwordHide ? EyeIcon : HideEyeIcon}
              onRightIconPress={() => setPasswordHide((prev: boolean) => !prev)}
              secureEntry={passwordHide}
            />
            <Text style={styles.Input_Heading}>Confirm Password</Text>
            <CustomInput
              placeholder={'Enter Confirm Password'}
              value={confirmPassword}
              setValue={(val: string) => {
                setConfirmPassword(val);
                setConfirmPasswordError('');
              }}
              errorMsg={confirmPasswordError}
              RightIcon={confirmPasswordHide ? EyeIcon : HideEyeIcon}
              onRightIconPress={() =>
                setConfirmPasswordHide((prev: boolean) => !prev)
              }
              secureEntry={confirmPasswordHide}
            />

            <View style={styles.passwordRequirements}>
              {renderRequirement(
                passwordHasAllCharacterTypes,
                'Password includes one uppercase, lowercase, and special character.',
              )}
              {renderRequirement(
                passwordHasMinLength,
                'Password has minimum 12 characters.',
              )}
            </View>
          </>
        )}

        <CustomButton
          text={
            currentState == States.Email
              ? 'Send OTP'
              : currentState == States.OTP
              ? 'Verify OTP'
              : 'Save Password'
          }
          onPress={() => {
            if (currentState == States.Email) onSendOtp();
            else if (currentState == States.OTP) onVerifyOtp();
            else onResetPassword();
          }}
          loading={loading}
        />
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

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
      width: '100%',
    },
    passwordRequirements: {
      alignSelf: 'flex-start',
      width: '100%',
      marginTop: normalized(14),
      gap: normalized(5),
    },
    passwordRequirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      gap: normalized(6),
    },
  });
