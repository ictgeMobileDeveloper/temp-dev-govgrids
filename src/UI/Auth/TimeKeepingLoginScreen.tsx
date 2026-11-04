import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
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
import {allowOnlyNumbers, getErrorMessage} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import {setShowToast, setTimeKeepingUserData} from '../../Redux/AppReducers';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import moment from 'moment';
import CityLogo from '../Svg/CityLogo';

const TimeKeepingLoginScreen = (props: ScreenProps) => {
  const [keyboardVisible, setKeyboardVisible] = useState(true);

  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const passwordRef = useRef<TextInput>(null);

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
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
  const day = WEEKDAYS[now.getDay()];
  const hours24 = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

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
  const [empId, setEmpId] = useState('E');
  const [pin, setPin] = useState('');
  const [empIdError, setempIdError] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinHide, setPinHide] = useState(true);

  const onLogin = async () => {
    let isValid = true;
    if (empId == 'E') {
      setempIdError('...');
      isValid = false;
    }
    if (!pin) {
      setPinError('...');
      isValid = false;
    }

    if (!isValid) return;
    setLoading(true);
    const obj = {
      employeeId: empId,
      pin: pin,
      device: 'mobile',
    };
    apiHandler({
      endpoint: ENDPOINTS.seasonEmployeeLogin,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      authContext: 'TIMEKEEPING',
      onComplete: (response: any) => {
        if (response?.status) {
          apiHandler({
            endpoint: ENDPOINTS.getSeasonalEmpProfile,
            method: 'GET',
            authContext: 'TIMEKEEPING',
            onComplete: (resp: any) => {
              if (resp?.status) {
                const currentTime = moment();
                const afterEightHours = currentTime.clone().add(8, 'hours');
                setLoading(false);
                dispatch(setTimeKeepingUserData(resp?.data?.data));
                setDataInAsync(
                  AsyncKeyStrings.TimeKeepingUserData,
                  resp?.data?.data,
                );
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Login Successful',
                  }),
                );
                props?.navigation?.replace(props?.route?.params?.nav);
              } else {
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
        } else {
          setLoading(false);
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}
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

        <View style={styles.timeBlock}>
          <View style={styles.timebox}>
            <Text style={styles.keyTxt}>{day}</Text>
            <Text style={styles.valueTxt}>Day</Text>
          </View>

          <View style={styles.timebox}>
            <Text style={styles.keyTxt}>{hours24}</Text>
            <Text style={styles.valueTxt}>Hours</Text>
          </View>

          <View style={styles.timebox}>
            <Text style={styles.keyTxt}>{minutes}</Text>
            <Text style={styles.valueTxt}>Minutes</Text>
          </View>

          <View style={styles.timebox}>
            <Text style={styles.keyTxt}>{seconds}</Text>
            <Text style={styles.valueTxt}>Seconds</Text>
          </View>
        </View>

        <View>
          <Text style={styles.Input_Heading}>Employee ID*</Text>
          <CustomInput
            placeholder="Enter Employee ID"
            maxLength={6}
            value={empId}
            setValue={(val: string) => {
              if (!val.startsWith('E')) {
                val = 'E' + val;
              }
              const onlyNumbers = val.slice(1).replace(/[^0-9]/g, '');
              setEmpId('E' + onlyNumbers);
            }}
            errorMsg={empIdError}
            keyboardType="number-pad"
            textContentType="none"
            autoComplete="off"
            allowFontScaling
          />
        </View>

        <View style={{width: '100%', paddingTop: normalized(4)}}>
          <Text style={styles.Input_Heading}>PIN</Text>
          <CustomInput
            ref={passwordRef}
            placeholder={'******'}
            returnKeyType="done"
            value={pin}
            setValue={(val: string) => {
              setPin(allowOnlyNumbers(val));
              setPinError('');
            }}
            maxLength={6}
            keyboardType={'number-pad'}
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

        <View style={{alignSelf: 'stretch'}}>
          <CustomButton text={'Login'} onPress={onLogin} loading={loading} />
        </View>
      </ScrollView>
    </View>
  );
};

export default TimeKeepingLoginScreen;

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
      color: colors.White,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuRegular,
    },
    valueTxt: {
      color: colors.White,
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
  });
