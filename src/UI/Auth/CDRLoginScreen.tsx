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
  ActivityIndicator,
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
import {Routes} from '../../Utils/Routes';
import {allowOnlyNumbers, getErrorMessage} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import Logo from '../Svg/Logo';
import LoginBottomWave from '../Svg/LoginBottomWave';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import CustomDropDownList from '../Components/CustomDropDownList';
import CityLogo from '../Svg/CityLogo';

const CDRLoginScreen = (props: ScreenProps) => {
  const [keyboardVisible, setKeyboardVisible] = useState(true);

  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const passwordRef = useRef<TextInput>(null);

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
  const [loading, setLoading] = useState(false);
  const [pinHide, setPinHide] = useState(true);
  const [overallLoading, setOverallLoading] = useState(true);
  const [list, setList] = useState<any>([]);
  const [index, setIndex] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOnline && list?.length === 0 && !loading) {
      getRequesters();
    }
  }, [isOnline]);

  const getRequesters = async () => {
    setOverallLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.getCDRRequesters,
      method: 'GET',
      useRecaptcha: true,
      recaptchaAction: 'login',
      requiresAuth: false,
      onComplete: (resp: any) => {
        if (resp?.status) {
          setList(resp?.data?.data);
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

  const onLogin = async () => {
    let isValid = true;
    if (index == null) {
      setError(true);
      isValid = false;
    }
    if (!isValid) return;
    setLoading(true);
    const obj = {
      email: list[index]?.email,
    };
    apiHandler({
      endpoint: ENDPOINTS.CDRLoginOtp,
      method: 'POST',
      payload: obj,
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        if (resp?.status) {
          props?.navigation?.navigate(Routes.Auth.CDROtpScreen, {
            email: obj?.email,
            nav: props?.route?.params?.nav,
          });
          setLoading(false);
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
  };

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insects.top, paddingBottom: insects.bottom},
      ]}>
      <StatusBar barStyle="dark-content" />

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
          <View style={{height: normalized(16)}} />

          <Text style={styles.Heading}>CDR - Login</Text>

          <View style={{flex: 1, width: '100%'}}>
            <Text style={styles.Input_Heading}>Name*</Text>

            <CustomDropDownList
              list={list?.map((o: {firstName: string; lastName: string}) => {
                return `${o.firstName} ${o.lastName[0]}`;
              })}
              selectedIndex={index}
              onChange={i => setIndex(i)}
              placeholder="Name"
              error={error}
            />
          </View>

          <View style={{alignSelf: 'stretch'}}>
            <CustomButton text={'Login'} onPress={onLogin} loading={loading} />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      )}
    </View>
  );
};

export default CDRLoginScreen;

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
