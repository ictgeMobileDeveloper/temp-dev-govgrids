import {
  Animated,
  AppState,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import VectorWave from '../Svg/VectorWave';
import LoginBottomWave from '../Svg/LoginBottomWave';
import Logo from '../Svg/Logo';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import CustomInput from '../Components/CustomInput';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import {
  apiHandler,
  hasValidAccessToken,
  resolveAccessToken,
} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, SOCKET_ENDPOINTS, websocketUrl} from '../../Network/Urls';
import {setShowToast, setTimeKeepingUserData} from '../../Redux/AppReducers';
import {AppStrings, AuthContext} from '../../Utils/AppStrings';
import {
  allowOnlyNumbers,
  getErrorMessage,
  resetToWelcomeAndHome,
} from '../../Utils/Helper';
import Modal from 'react-native-modal';
import CloseIcon from '../Svg/CloseIcon';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';
import {
  clearAuthContext,
  subscribeAuthTokenChange,
} from '../../Network/Services/AuthTokenService';
import {Routes} from '../../Utils/Routes';
import moment from 'moment';
import CityLogo from '../Svg/CityLogo';
import {useSessionExpirySocket} from '../../Network/Services/useSessionExpirySocket';

const ClockModal = ({item, onClose, isVisible}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}
      animationInTiming={400}
      animationOutTiming={400}
      style={{
        height: ScreenSize.height,
        width: ScreenSize.width,
      }}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <View style={styles.box}>
        <View style={styles.headingCont}>
          <Text style={styles.Modal_Heading_Txt}>
            {item?.clockInTime ? 'Clocked In' : 'Clocked Out'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeCont}>
            <CloseIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={{margin: normalized(12)}}>
          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Name</Text>
              <Text
                style={
                  styles.valueTxt
                }>{`${item?.firstName} ${item?.lastName}`}</Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Employee ID</Text>
              <Text style={styles.valueTxt}>{item?.employeeId}</Text>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Email</Text>
              <Text style={styles.valueTxt}>{item?.email}</Text>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.row}>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>
                {item?.clockInTime ? 'Clocked In Time' : 'Clocked Out Time'}
              </Text>
              <Text style={styles.valueTxt}>
                {moment(
                  item?.clockInTime ? item?.clockInTime : item?.clockOutTime,
                )?.format('hh:mm A')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TimeKeepingScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );

  const [now, setNow] = useState(new Date());
  const dispatch = useDispatch();

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
  const [id, setId] = useState('E');
  const [pin, setPin] = useState('');
  const [idError, setidError] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinHide, setPinHide] = useState(true);
  const [clockinLoader, setClockinLoader] = useState(false);
  const [clockoutLoader, setClockoutLoader] = useState(false);
  const [isShowModal, setIsShowModal] = useState({
    value: false,
    item: null,
  });

  const onClockInOut = async (isClockIn: any) => {
    let isValid = true;
    if (id == 'E') {
      isValid = false;
      setidError('...');
    }
    if (!pin) {
      isValid = false;
      setPinError('..');
    }
    if (!isValid) return;

    if (isClockIn) setClockinLoader(true);
    else setClockoutLoader(true);

    const obj = {
      employeeId: id,
      pin: pin,
      // siteId: '',
      device: 'mobile',
    };
    apiHandler({
      endpoint: isClockIn ? ENDPOINTS.clockin : ENDPOINTS.clockout,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: (resp: any) => {
        console.log('Resp ---  ', resp);

        if (resp?.status) {
          setIsShowModal({
            value: true,
            item: resp?.data?.data,
          });
          if (isClockIn) setClockinLoader(false);
          else setClockoutLoader(false);
          setPin('');
          setId('E');
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          if (isClockIn) setClockinLoader(false);
          else setClockoutLoader(false);
        }
      },
    });
  };

  const forceLogout = () => {
    resetToWelcomeAndHome(props.navigation, Routes.Staff.HomeScreen);
    dispatch(setTimeKeepingUserData(null));
    clearAuthContext('TIMEKEEPING');
    dispatch(
      setShowToast({
        type: AppStrings.ToastType.error,
        message: 'Token Expired, Please Login Again',
      }),
    );
  };

  useSessionExpirySocket({
    authContext: 'TIMEKEEPING',
    endpoint: SOCKET_ENDPOINTS.TKSession,
    label: 'TimeKeeping',
    dependencyKey: selector?.TimeKeepingUserData?.id,
    enabled: Boolean(selector?.TimeKeepingUserData?.id),
    onExpired: forceLogout,
  });
  return (
    <View
      style={[
        styles.container,
        {paddingTop: insects.top, paddingBottom: insects.bottom},
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <Animated.View style={[styles.topWave]}>
        <VectorWave primary={colors.Primary} secondary={colors.Secondary} />
      </Animated.View>

      <Animated.View style={styles.bottomWave}>
        <LoginBottomWave
          primary={colors.Primary}
          secondary={colors.Secondary}
        />
      </Animated.View>

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

      <View style={{height: normalized(20)}} />
      <Text style={styles.nameTxt}>TimeKeeping - Employee Clock-In/Out</Text>

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
      <View style={{height: normalized(10)}} />

      <View>
        <Text style={styles.Input_Heading}>Employee ID*</Text>
        <CustomInput
          placeholder={'Enter ID'}
          value={id}
          setValue={(val: string) => {
            if (!val.startsWith('E')) {
              val = 'E' + val;
            }
            const onlyNumbers = val.slice(1).replace(/[^0-9]/g, '');
            setId('E' + onlyNumbers);
            setidError('');
          }}
          maxLength={6}
          errorMsg={idError}
        />
      </View>

      <View>
        <Text style={styles.Input_Heading}>PIN*</Text>
        <CustomInput
          placeholder={'******'}
          keyboardType={'number-pad'}
          returnKeyType="done"
          value={pin}
          setValue={(val: any) => {
            setPin(allowOnlyNumbers(val));
            setPinError('');
          }}
          maxLength={6}
          errorMsg={pinError}
          RightIcon={pinHide ? EyeIcon : HideEyeIcon}
          onRightIconPress={() => {
            setPinHide((prev: any) => !prev);
          }}
          secureEntry={pinHide}
        />
      </View>

      <View style={styles.btnRow}>
        <View style={styles.nextBtnCont}>
          <SimpleButton
            text={'Clock Out'}
            onPress={() => {
              if (clockinLoader) return;
              onClockInOut(false);
            }}
            loading={clockoutLoader}
          />
        </View>
        <View style={styles.nextBtnCont}>
          <CustomButton
            text={'Clock In'}
            onPress={() => {
              if (clockoutLoader) return;
              onClockInOut(true);
            }}
            loading={clockinLoader}
          />
        </View>
      </View>

      <ClockModal
        isVisible={isShowModal?.value}
        onClose={() => setIsShowModal({value: false, item: null})}
        item={isShowModal?.item}
      />
    </View>
  );
};

export default TimeKeepingScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
      paddingHorizontal: normalized(20),
      alignItems: 'center',
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
      color: '#ffffff',
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuMedium,
    },
    nextBtnCont: {
      flex: 1,
    },
    btnRow: {
      width: '100%',
      gap: normalized(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: normalized(20),
    },
    box: {
      width: '90%',
      paddingVertical: normalized(20),
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
    },
    headingCont: {
      alignItems: 'center',
      marginHorizontal: normalized(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    closeCont: {
      width: normalized(30),
      height: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      backgroundColor: colors.Grey_2,
      width: '100%',
      height: normalized(1),
      marginTop: normalized(12),
      alignSelf: 'center',
    },
  });
