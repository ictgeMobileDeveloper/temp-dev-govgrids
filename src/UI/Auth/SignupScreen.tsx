import {
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  ScrollView,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';

import AnimatedReanimated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import TickIcon from '../Svg/TickIcon';
import CloseIcon from '../Svg/CloseIcon';
import {
  AppFonts,
  hv,
  isAndroid15Plus,
  isSmallDevice,
  normalized,
  ScreenProps,
  ScreenSize,
  SIGNUP_FORM_TYPES,
} from '../../Utils/AppConstants';
import CustomCheckBox from '../Components/CustomCheckBox';
import {
  allowOnlyNumbers,
  allowOnlyString,
  formatPhoneNumber,
  getErrorMessage,
  isEmailValid,
  useGradualAnimation,
} from '../../Utils/Helper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Routes} from '../../Utils/Routes';
import {AppStrings} from '../../Utils/AppStrings';
import {setShowToast} from '../../Redux/AppReducers';
import {ENDPOINTS} from '../../Network/Urls';
import {apiHandler} from '../../Network/Services/ApiHandler';
import SignupTopWave from '../Svg/SignupTopWave';
import SignupBottomWave from '../Svg/SignupBottomWave';
import LocationIcon from '../Svg/LocationIcon';
import CustomSwitcher from '../Components/CustomSwitcher';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import VectorWave from '../Svg/VectorWave';

const SignupScreen = (props: ScreenProps) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const insects = useSafeAreaInsets();

  const [keyboardVisible, setKeyboardVisible] = useState(true);
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

  const [type, setType] = useState('citizen');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressCoords, setAddressCoords] = useState({});
  const [index, setIndex] = useState(0);
  const [passwordHide, setPasswordHide] = useState(true);
  const [confirmPasswordHide, setConfirmPasswordHide] = useState(true);
  const route = props?.route?.params?.route;

  //   --------->>>> Erros

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [cityError, setCityError] = useState('');
  const [stateError, setStateError] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [addressLine2Error, setAddressLine2Error] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [organizationError, setOrganizationError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [agreeError, setAgreeError] = useState(false);

  //   -------------->>>  Refs

  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const emailRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const zipCodeRef = useRef(null);
  const addressLine2Ref = useRef(null);
  const passwordRef = useRef(null);

  const focusNextField = (inputRef: any) => {
    if (inputRef?.current) {
      inputRef?.current?.focus();
    }
  };
  const dispatch = useDispatch();

  const [agree, setAgree] = useState(false);
  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(40);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);

  // ---------------- Animations ----------------
  // Waves
  const topWaveOpacity = useRef(new Animated.Value(0)).current;
  const topWaveTY = useRef(new Animated.Value(-10)).current;
  const botWaveOpacity = useRef(new Animated.Value(0)).current;
  const botWaveTY = useRef(new Animated.Value(10)).current;

  // Headings
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTY = useRef(new Animated.Value(12)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  const subTY = useRef(new Animated.Value(12)).current;

  const fields = useRef(
    Array.from({length: 5}).map(() => ({
      opacity: new Animated.Value(0),
      ty: new Animated.Value(12),
    })),
  ).current;

  // password Validation

  const passwordHasUppercase = /[A-Z]/.test(password);
  const passwordHasLowercase = /[a-z]/.test(password);
  const passwordHasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const passwordHasAllCharacterTypes =
    passwordHasUppercase && passwordHasLowercase && passwordHasSpecialChar;

  const passwordHasMinLength = password.length >= 12;

  // Checkbox
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkTY = useRef(new Animated.Value(10)).current;

  // Buttons
  const primaryScale = useRef(new Animated.Value(0.98)).current;
  const primaryOpacity = useRef(new Animated.Value(0)).current;
  const secondaryScale = useRef(new Animated.Value(0.98)).current;
  const secondaryOpacity = useRef(new Animated.Value(0)).current;

  // Bottom row
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    // waves
    const waves = [
      Animated.timing(topWaveOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(topWaveTY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(botWaveOpacity, {
        toValue: 1,
        duration: 600,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(botWaveTY, {
        toValue: 0,
        duration: 600,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    // headings
    const headings = [
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleTY, {
        toValue: 0,
        duration: 450,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(subOpacity, {
        toValue: 1,
        duration: 450,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(subTY, {
        toValue: 0,
        duration: 450,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    // fields stagger
    const fieldAnims: Animated.CompositeAnimation[] = [];
    fields.forEach((f, idx) => {
      const baseDelay = 250 + idx * 90; // nice cascade
      fieldAnims.push(
        Animated.timing(f.opacity, {
          toValue: 1,
          duration: 420,
          delay: baseDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
      fieldAnims.push(
        Animated.timing(f.ty, {
          toValue: 0,
          duration: 420,
          delay: baseDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
    });

    // checkbox
    const checkbox = [
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 380,
        delay: 250 + fields.length * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(checkTY, {
        toValue: 0,
        duration: 380,
        delay: 250 + fields.length * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    // buttons (slight spring pop)
    const btnDelay = 340 + fields.length * 90;
    const buttons = [
      Animated.timing(primaryOpacity, {
        toValue: 1,
        duration: 1,
        delay: btnDelay,
        useNativeDriver: true,
      }),
      Animated.spring(primaryScale, {
        toValue: 1,
        tension: 220,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.timing(secondaryOpacity, {
        toValue: 1,
        duration: 1,
        delay: btnDelay + 80,
        useNativeDriver: true,
      }),
      Animated.spring(secondaryScale, {
        toValue: 1,
        tension: 220,
        friction: 14,
        useNativeDriver: true,
      }),
    ];

    // bottom row
    const bottom = [
      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 380,
        delay: btnDelay + 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bottomTY, {
        toValue: 0,
        duration: 380,
        delay: btnDelay + 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    Animated.parallel([
      ...waves,
      ...headings,
      ...fieldAnims,
      ...checkbox,
      ...buttons,
      ...bottom,
    ]).start();
  }, []);

  const {height} = useGradualAnimation();
  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value + 10,
    };
  }, []);

  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  const haptic = () =>
    ReactNativeHapticFeedback.trigger(
      Platform.OS === 'ios' ? 'impactLight' : 'keyboardTap',
      options,
    );

  const onSignup = async () => {
    let isFormValid = true;
    if (!firstName.trim()) {
      setFirstNameError('Please enter your first name');
      isFormValid = false;
    } else {
      setFirstNameError('');
    }
    if (!lastName.trim()) {
      setLastNameError('Please enter your last name');
      isFormValid = false;
    } else {
      setLastNameError('');
    }
    if (!email.trim()) {
      setEmailError('Please enter your email');
      isFormValid = false;
    } else if (!isEmailValid(email)) {
      setEmailError('Invalid email format');
      isFormValid = false;
    } else {
      setEmailError('');
    }
    if (!address) {
      setLocationError('Please enter your address');

      isFormValid = false;
    } else {
      setLocationError('');
    }
    if (index && !organization.trimEnd()) {
      setOrganizationError('Please enter your organization name');
      isFormValid = false;
    } else {
      setOrganizationError('');
    }
    if (!phoneNumber.trim()) {
      setPhoneNumberError('Please enter your phone number');
      isFormValid = false;
    } else if (phoneNumber?.length < 12) {
      setPhoneNumberError('...');
      isFormValid = false;
    } else {
      setPhoneNumberError('');
    }
    if (!city.trim()) {
      setCityError('Please enter your last name');
      isFormValid = false;
    } else {
      setCityError('');
    }
    if (!state.trim()) {
      setStateError('Please enter your last name');
      isFormValid = false;
    } else {
      setStateError('');
    }
    // if (!zipCode.trim()) {
    //   setZipCodeError('Please enter your last name');
    //   isFormValid = false;
    // } else {
    //   setZipCodeError('');
    // }
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      isFormValid = false;
    } else if (password.length < 12) {
      setPasswordError('Password must be at least 12 characters long');
      isFormValid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      isFormValid = false;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      isFormValid = false;
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      setPasswordError('Password must contain at least one special character');
      isFormValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      isFormValid = false;
    } else if (confirmPassword.length < 12) {
      setConfirmPasswordError('Password must be at least 12 characters long');
      isFormValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (password !== confirmPassword) {
      setPasswordError('Password does not match.');
      setConfirmPasswordError('Password does not match.');
      isFormValid = false;
    }
    if (!isFormValid) {
      return;
    }
    const payload = {
      email: email,
      password: password,
      userRole: type,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      address: address,
      addressLine2: addressLine2,
      city: city,
      state: state,
      zipCode: zipCode,
      addressCoords: addressCoords,
      organizationName: organization,
      device: 'mobile',
    };
    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.Signup,
      method: 'POST',
      payload: payload,
      useRecaptcha: true,
      recaptchaAction: 'signup',
      onComplete: async (resp: any) => {
        if (resp?.status) {
          setLoading(false);
          props?.navigation?.navigate(Routes.Auth.Otp, {
            email: email,
            isSignupScreen: true,
            OTPFor: resp?.data?.OTPFor,
            route: route,
          });
          if (resp?.OTPFor == 'public-signup-otp') {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.warning,
                message: 'Please Verify your email address.',
              }),
            );
          }
        } else {
          if (resp?.status == false) {
            props?.navigation.replace(Routes.Auth.Login, {
              email: email,
            });
          }
          setLoading(false);
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

  const resetErrors = () => {
    setFirstNameError('');
    setLastNameError('');
    setPhoneNumberError('');
    setOrganizationError('');
    setEmailError('');
    setLocationError('');
    setCityError('');
    setStateError('');
    setZipCodeError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAgreeError(false);
  };

  const onwalkIn = () => {
    props?.navigation?.replace(Routes.Resident.HomeScreen);
  };

  const RequiredLabel = ({label}: {label: string}) => {
    return (
      <View style={styles.requiredLabelRow}>
        <Text style={styles.Input_Heading}>{label}</Text>
        <Text style={styles.requiredStar}>*</Text>
      </View>
    );
  };

  return (
    <View style={[styles.MainStyle]}>
      {/* <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'dark-content'}
      /> */}
      {/* Waves */}
      <Animated.View
        style={[
          styles.topWave,
          {opacity: topWaveOpacity, transform: [{translateY: topWaveTY}]},
        ]}>
        <VectorWave
          primary={colors.Primary}
          secondary={colors.Secondary}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
        {/* <SignupTopWave primary={colors.Primary} secondary={colors.Secondary} /> */}
      </Animated.View>
      <Animated.View
        style={[
          styles.bottomWave,
          {opacity: bottomOpacity, transform: [{translateY: bottomTY}]},
        ]}>
        <SignupBottomWave
          primary={colors.Primary}
          secondary={colors.Secondary}
        />
      </Animated.View>
      <KeyboardAwareScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insects.bottom + normalized(20),
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={Platform.OS === 'android' ? 20 : 0}
        showsVerticalScrollIndicator={false}>
        <View style={{height: normalized(50)}} />

        <Animated.Text
          style={[
            styles.Heading,
            {
              opacity: titleOpacity,
              marginTop: normalized(12),
              transform: [{translateY: titleTY}],
            },
          ]}>
          Create Account
        </Animated.Text>
        <Animated.Text
          style={[
            styles.Desc_Txt,
            {opacity: subOpacity, transform: [{translateY: subTY}]},
          ]}>
          Join us to get started
        </Animated.Text>
        <CustomSwitcher
          list={SIGNUP_FORM_TYPES}
          selectedIndex={index}
          onChange={i => {
            setIndex(i);
            resetErrors();
          }}
        />

        <View style={styles.Input_Row}>
          <Animated.View
            style={{
              opacity: fields[0].opacity,
              transform: [{translateY: fields[0].ty}],
              flex: 1,
            }}>
            <RequiredLabel label="First Name" />
            <CustomInput
              placeholder={'Enter First Name'}
              value={firstName}
              setValue={(val: any) => {
                setFirstName(allowOnlyString(val));
                setFirstNameError('');
              }}
              errorMsg={firstNameError}
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: fields[0].opacity,
              transform: [{translateY: fields[0].ty}],
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Middle Name</Text>
            <CustomInput
              placeholder={'Enter Middle Name'}
              value={middleName}
              setValue={(val: any) => {
                setMiddleName(allowOnlyString(val));
              }}
              errorMsg={middleNameError}
            />
          </Animated.View>
        </View>
        <View style={styles.Input_Row}>
          <Animated.View
            style={{
              opacity: fields[0].opacity,
              transform: [{translateY: fields[0].ty}],
              flex: 1,
            }}>
            <RequiredLabel label="Last Name" />
            <CustomInput
              placeholder={'Enter Last Name'}
              value={lastName}
              setValue={(val: any) => {
                setLastName(allowOnlyString(val));
                setLastNameError('');
              }}
              errorMsg={lastNameError}
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: fields[2].opacity,
              transform: [{translateY: fields[2].ty}],
              flex: 1,
            }}>
            <RequiredLabel label="Phone Number" />
            <CustomInput
              placeholder={'XXX - XXX - XXXX'}
              maxLength={12}
              value={phoneNumber}
              setValue={(phone: any) => {
                setPhoneNumber(formatPhoneNumber(phone));
                setPhoneNumberError('');
              }}
              errorMsg={phoneNumberError}
            />
          </Animated.View>
        </View>
        <Animated.View
          style={{
            opacity: fields[1].opacity,
            transform: [{translateY: fields[1].ty}],
          }}>
          <RequiredLabel label="Email" />
          <CustomInput
            placeholder={'Enter Email'}
            value={email}
            setValue={(val: any) => {
              setEmail(val);
              setEmailError('');
            }}
            errorMsg={emailError}
          />
        </Animated.View>
        {index === 1 && (
          <Animated.View
            style={{
              opacity: fields[1].opacity,
              transform: [{translateY: fields[1].ty}],
            }}>
            <RequiredLabel label="Organization Name" />
            <CustomInput
              placeholder={'Enter Organization Name'}
              value={organization}
              setValue={(val: any) => {
                setOrganization(val);
                setOrganizationError('');
              }}
              errorMsg={organizationError}
            />
          </Animated.View>
        )}
        <Animated.View
          style={{
            opacity: fields[2].opacity,
            transform: [{translateY: fields[2].ty}],
            flex: 1,
          }}>
          <RequiredLabel label="Address" />
          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              props?.navigation?.navigate(Routes.MapScreen, {
                onChooseLocation: (loc: any) => {
                  setCity(loc?.City);
                  setState(loc?.State);
                  setAddress(loc?.address);
                  setZipCode(loc?.zipCode);
                  setCityError('');
                  setStateError('');
                  setLocationError('');
                  setZipCodeError('');
                  setAddressCoords(loc?.location);
                },
              });
            }}
            style={[
              styles.addressBox,
              {
                backgroundColor: locationError
                  ? colors.redLight
                  : colors.Background,
                borderColor: locationError ? colors.Error : colors.BorderColor,
                height:
                  BASE_HEIGHT +
                  Math.max(0, Math.min(addressLines, MAX_LINES) - 1) *
                    LINE_HEIGHT,
              },
            ]}>
            <Text
              onTextLayout={e => {
                const lines = e.nativeEvent.lines?.length ?? 1;
                setAddressLines(Math.max(1, Math.min(MAX_LINES, lines)));
              }}
              style={[
                styles.Desc_Txt,
                {
                  flex: 1,
                  textAlign: 'left',
                  color: locationError
                    ? colors.Error
                    : address
                    ? colors.Heading_Txt
                    : colors.Desc_Txt,
                  lineHeight: LINE_HEIGHT,
                  fontSize: normalized(14),
                },
              ]}>
              {address ? address : 'Select Address'}
            </Text>
            <LocationIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.Input_Row}>
          <Animated.View
            style={{
              opacity: fields[0].opacity,
              transform: [{translateY: fields[1].ty}],
              flex: 1,
            }}>
            <RequiredLabel label="City" />
            <CustomInput
              placeholder={'Enter City'}
              value={city}
              setValue={(val: any) => {
                setCity(allowOnlyString(val));
              }}
              errorMsg={cityError}
            />
          </Animated.View>
          <Animated.View
            style={{
              opacity: fields[2].opacity,
              transform: [{translateY: fields[2].ty}],
              flex: 1,
            }}>
            <RequiredLabel label="State" />
            <CustomInput
              placeholder={'Enter State'}
              value={state}
              setValue={(state: any) => {
                setState(allowOnlyString(state));
              }}
              errorMsg={stateError}
            />
          </Animated.View>
        </View>
        <Animated.View
          style={{
            opacity: fields[2].opacity,
            transform: [{translateY: fields[2].ty}],
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Zip Code</Text>
          <CustomInput
            placeholder={'Enter Zip Code'}
            maxLength={5}
            keyboardType="number-pad"
            value={zipCode}
            setValue={(code: any) => {
              setZipCode(allowOnlyNumbers(code));
            }}
            errorMsg={zipCodeError}
            secureEntry={false}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: fields[3].opacity,
            transform: [{translateY: fields[3].ty}],
          }}>
          <RequiredLabel label="Create Password" />
          <CustomInput
            placeholder={'************'}
            value={password}
            setValue={(val: any) => {
              setPassword(val);
              setPasswordError('');
            }}
            errorMsg={passwordError}
            RightIcon={passwordHide ? EyeIcon : HideEyeIcon}
            onRightIconPress={() => {
              setPasswordHide((prev: any) => !prev);
            }}
            secureEntry={passwordHide}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: fields[4].opacity,
            transform: [{translateY: fields[4].ty}],
          }}>
          <RequiredLabel label="Confirm Password" />
          <CustomInput
            placeholder={'************'}
            value={confirmPassword}
            setValue={(val: any) => {
              setConfirmPassword(val);
              setConfirmPasswordError('');
            }}
            errorMsg={confirmPasswordError}
            RightIcon={confirmPasswordHide ? EyeIcon : HideEyeIcon}
            onRightIconPress={() => {
              setConfirmPasswordHide((prev: any) => !prev);
            }}
            secureEntry={confirmPasswordHide}
          />
          <View style={styles.passwordRequirements}>
            <View style={styles.passwordRequirementRow}>
              {passwordHasAllCharacterTypes ? (
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
                  {
                    fontSize: normalized(10),
                    textAlign: 'left',
                  },
                ]}>
                Password includes one uppercase, lowercase, and special
                character.
              </Text>
            </View>

            <View style={styles.passwordRequirementRow}>
              {passwordHasMinLength ? (
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
                  {
                    fontSize: normalized(10),
                    textAlign: 'left',
                  },
                ]}>
                Password has minimum 12 characters.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={{
            opacity: primaryOpacity,
            transform: [{scale: primaryScale}],
            alignSelf: 'stretch',
          }}>
          <CustomButton
            loading={loading}
            text={'Register & Verify'}
            onPress={onSignup}
          />
        </Animated.View>
        <Animated.View
          style={{
            opacity: secondaryOpacity,
            transform: [{scale: secondaryScale}],
            alignSelf: 'stretch',
          }}>
          <SimpleButton onPress={onwalkIn} text={'Walk In'} />
        </Animated.View>
        <Animated.View
          style={[
            styles.bottomRow,
            {opacity: bottomOpacity, transform: [{translateY: bottomTY}]},
          ]}>
          <Text style={styles.Desc_Txt}>Already have an account? </Text>
          <Text
            onPress={() => props?.navigation?.goBack()}
            style={[styles.Desc_Txt, {color: colors.Primary}]}>
            Sign In
          </Text>
        </Animated.View>
        <View style={{height: insects.bottom}} />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default SignupScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      gap: normalized(5),
      marginVertical: normalized(15),
      // zIndex: 1,
      // marginTop: normalized(40),
      // position: 'absolute',
      // bottom: normalized(50),
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
    requiredLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(2),
    },

    requiredStar: {
      color: colors.Error,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
    },
    passwordRequirements: {
      alignSelf: 'flex-start',
      width: '100%',
      marginTop: normalized(4),
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
