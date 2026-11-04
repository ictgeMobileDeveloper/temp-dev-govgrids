import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  findNodeHandle,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {normalized, ScreenProps, ScreenSize} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import VectorWave from '../Svg/VectorWave';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Routes} from '../../Utils/Routes';
import AnimatedReanimated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  announcement,
  getErrorMessage,
  isEmailValid,
  useGradualAnimation,
} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setIsAlertShow, setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import CityLogo from '../Svg/CityLogo';

const DAMLoginScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  const [reduceMotion, setReduceMotion] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(true);

  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const passwordRef = useRef<TextInputInstance>(null);
  // const isDamUser = props?.route?.params?.isDAMLogin || false;
  // console.log('isDAMLogin', isDamUser);
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub?.remove?.();
  }, []);

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

  // Handoff from Main to start immediately (no delays)
  const cameFromMain = !!props?.route?.params?.handoff;

  // --- entrance animations ---
  const topWaveOpacity = useRef(new Animated.Value(0)).current;
  const topWaveTY = useRef(new Animated.Value(-10)).current;

  const bottomWaveOpacity = useRef(new Animated.Value(0)).current;
  const bottomWaveTY = useRef(new Animated.Value(10)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTY = useRef(new Animated.Value(12)).current;

  const buttonScale = useRef(new Animated.Value(0.98)).current;

  const bottomRowOpacity = useRef(new Animated.Value(0)).current;
  const bottomRowTY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const D1 = reduceMotion ? 0 : 1200;
    const D2 = reduceMotion ? 0 : 1000;
    const D3 = reduceMotion ? 0 : 800;
    const DELAY_1 = reduceMotion ? 0 : cameFromMain ? 0 : 160;
    const DELAY_2 = reduceMotion ? 0 : cameFromMain ? 0 : 240;
    const DELAY_3 = reduceMotion ? 0 : cameFromMain ? 0 : 440;

    Animated.parallel([
      Animated.timing(topWaveOpacity, {
        toValue: 1,
        duration: D1,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(topWaveTY, {
        toValue: 0,
        duration: D1,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bottomWaveOpacity, {
        toValue: 1,
        duration: D1,
        delay: DELAY_1,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bottomWaveTY, {
        toValue: 0,
        duration: D1,
        delay: DELAY_1,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: D2,
        delay: DELAY_2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTY, {
        toValue: 0,
        duration: D2,
        delay: DELAY_2,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(DELAY_3),
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: reduceMotion ? 0 : 30,
          friction: reduceMotion ? 1000 : 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(bottomRowOpacity, {
        toValue: 1,
        duration: D3,
        delay: DELAY_3,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bottomRowTY, {
        toValue: 0,
        duration: D3,
        delay: DELAY_3,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [reduceMotion, cameFromMain]);

  const {height} = useGradualAnimation();
  const extra = useSharedValue(Platform.OS === 'android' ? 20 : 0);
  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value + extra.value,
    };
  }, []);

  // --- state ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordHide, setPasswordHide] = useState(true);

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = password?.length >= 12;
  const route = props?.route?.params?.route;
  const [pwMeasuredH, setPwMeasuredH] = useState(0);
  const pwAnim = useRef(new Animated.Value(0)).current;
  const PW_DURATION = reduceMotion ? 0 : 450;

  useEffect(() => {
    console.log('Login --->>>.   ', props?.route?.params);

    Animated.timing(pwAnim, {
      toValue: isEmailVerified ? 1 : 0,
      duration: PW_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished && isEmailVerified) {
        announcement('Email verified. Password field revealed.');
      }
    });
  }, [isEmailVerified, PW_DURATION]);

  const pwAnimatedStyle = {
    opacity: pwAnim,
    transform: [
      {
        translateY: pwAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
    maxHeight: pwAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, pwMeasuredH || 140],
    }),
    overflow: 'hidden',
  } as const;

  const onVerifyEmail = async () => {
    let isFormValid = true;
    if (!email) {
      setEmailError('.');
      isFormValid = false;
      announcement('Email is required. Please enter your email address.');
    }
    if (!isEmailValid(email) && isFormValid) {
      isFormValid = false;
      setEmailError('.');
      announcement('Invalid Email. Please Enter Valid Email Address');
    }
    if (!isFormValid) return;

    setLoading(true);

    const obj = {
      email: email,
    };
    apiHandler({
      endpoint: ENDPOINTS.verifyVendorEmail,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: async (resp: any) => {
        if (resp?.status) {
          if (resp?.data?.OTPFor == 'public-signup-otp') {
            props?.navigation?.navigate(Routes.DAM.OptScreen, {
              email: email,
              OTPFor: resp?.OTPFor,
            });
            dispatch(
              setIsAlertShow({
                value: true,
                message: resp?.data?.message,
              }),
            );
            setLoading(false);
          } else {
            setIsEmailVerified(true);
            setLoading(false);
            announcement('Email verified. Please enter your password.');
            setTimeout(() => {
              passwordRef.current?.focus();
              const tag = findNodeHandle(passwordRef.current);
              if (tag) AccessibilityInfo.setAccessibilityFocus(tag);
            }, 350);
          }
        } else {
          setLoading(false);
          const msg = getErrorMessage(resp);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: msg,
            }),
          );
          announcement(msg);
        }
      },
    });
  };

  const onLogin = async () => {
    let isFormValid = true;
    if (!password) {
      setPasswordError('Please Enter Password');
      isFormValid = false;
    }
    if (password?.length < 12) {
      setPasswordError('Password must be 12 digits long');
      isFormValid = false;
    }
    if (!isFormValid) return;

    setEmailError('');
    setPasswordError('');
    const obj = {email, password};
    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.vrifyVendorPassowrd,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: async (resp: any) => {
        if (resp?.status) {
          const objNav = {
            email: email,
            isLoginScreen: true,
            OTPFor: resp?.OTPFor,
          };

          props?.navigation?.navigate(Routes.DAM.OptScreen, {
            objNav,
            route,
            isDAMLogin: props?.route?.params?.isDAMLogin || false,
          });
          setLoading(false);
        } else {
          setLoading(false);
          const msg = resp?.message ?? resp?.error ?? 'Login failed';
          dispatch(
            setShowToast({
              type: resp?.error,
              message: msg,
            }),
          );
          announcement(msg);
        }
      },
    });
  };

  const onwalkIn = () => {
    props?.navigation?.replace(Routes.Resident.HomeScreen);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top,
          paddingBottom: insects.bottom,
        },
      ]}>
      <StatusBar barStyle={'light-content'} />

      {/* Waves */}
      <Animated.View
        style={[
          styles.topWave,
          {opacity: topWaveOpacity, transform: [{translateY: topWaveTY}]},
        ]}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <VectorWave
          primary={colors.Primary}
          secondary={colors.Secondary}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomWave,
          {
            opacity: bottomWaveOpacity,
            transform: [{translateY: bottomWaveTY}],
          },
        ]}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <LoginBottomWave
          primary={colors.Primary}
          secondary={colors.Secondary}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        style={{
          opacity: contentOpacity,
          transform: [{translateY: contentTY}],
          alignSelf: 'stretch',
        }}>
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
        <Text
          style={styles.Heading}
          accessibilityRole="header"
          allowFontScaling>
          Login - Vendor Services
        </Text>
        <View style={{height: normalized(5)}} />

        <Text style={[styles.Desc_Txt]} allowFontScaling>
          Log in to access the vendor portal.
        </Text>
        <View style={{height: normalized(34)}} />

        <View>
          <Text
            style={styles.Input_Heading}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            Email
          </Text>
          <CustomInput
            placeholder={'Enter Email'}
            value={email}
            setValue={(val: string) => {
              setEmail(val);
              setEmailError('');
            }}
            isEditable={!isEmailVerified}
            errorMsg={emailError}
            accessibilityLabel="Email address input"
            accessibilityHint="Enter your email address"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            allowFontScaling
          />
        </View>

        {/* Password reveal */}
        <Animated.View
          style={[
            pwAnimatedStyle,
            {
              width: '100%',
            },
          ]}>
          <View
            onLayout={e => setPwMeasuredH(e.nativeEvent.layout.height)}
            style={{paddingTop: normalized(4)}}>
            <Text
              style={styles.Input_Heading}
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              Password
            </Text>
            <CustomInput
              ref={passwordRef}
              placeholder={'Enter Password'}
              value={password}
              setValue={(val: string) => {
                setPassword(val);
                setPasswordError('');
              }}
              errorMsg={passwordError}
              RightIcon={passwordHide ? EyeIcon : HideEyeIcon}
              onRightIconPress={() => {
                setPasswordHide((prev: any) => !prev);
              }}
              secureEntry={passwordHide}
              accessibilityLabel="Password input"
              accessibilityHint="Enter your account password, minimum twelve characters, at least one Uppercase, Lowercase and Special Character"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              importantForAccessibility="yes"
              allowFontScaling
            />
          </View>
        </Animated.View>

        <Animated.View
          style={{transform: [{scale: buttonScale}], alignSelf: 'stretch'}}>
          <CustomButton
            text={isEmailVerified ? 'Login' : 'Verify Email'}
            onPress={() => {
              if (isEmailVerified) {
                onLogin();
              } else {
                onVerifyEmail();
              }
            }}
            loading={loading}
            accessibilityRole="button"
            accessibilityLabel={isEmailVerified ? 'Login' : 'Verify email'}
            accessibilityHint={
              isEmailVerified
                ? 'Submits your password to sign in'
                : 'Verifies your email before showing the password field'
            }
          />
        </Animated.View>

        <View style={{height: normalized(30)}} />
        {isEmailVerified && (
          <TouchableOpacity
            accessibilityRole="button"
            // onPress={() =>
            //   props?.navigation?.navigate(Routes.DAM.OptScreen, {
            //     email: email,
            //   })
            // }
          >
            <Text style={styles.Desc_Txt} allowFontScaling>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}
        <View style={{height: normalized(80)}} />
      </Animated.ScrollView>

      <AnimatedReanimated.View
        style={[keyboardPaddingBottom, {backgroundColor: 'transparent'}]}
      />
    </View>
  );
};

export default DAMLoginScreen;

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
  });
