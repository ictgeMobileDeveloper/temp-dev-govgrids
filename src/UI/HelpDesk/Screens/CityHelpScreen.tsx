import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {AppFonts, normalized, ScreenProps} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import CustomInput from '../../Components/CustomInput';
import {
  allowOnlyString,
  formatPhoneNumber,
  getErrorMessage,
} from '../../../Utils/Helper';
import CustomDocumentPicker from '../../Components/CustomDocumentPicker';
import CustomButton from '../../Components/CustomButton';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import LinearGradient from 'react-native-linear-gradient';
import QuestionIcon from '../../Svg/QuestionIcon';

const CityHelpScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<any>(null);

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [fileError, setFileError] = useState(false);
  const [isTipVisible, setIsTipVisible] = useState(false);
  const tipOpacity = useRef(new Animated.Value(0)).current;
  const tipTranslateY = useRef(new Animated.Value(-16)).current;

  const onOpenTip = () => {
    setIsTipVisible(true);
    tipOpacity.setValue(0);
    tipTranslateY.setValue(-16);
    Animated.parallel([
      Animated.timing(tipOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(tipTranslateY, {
        toValue: 0,
        tension: 120,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onCloseTip = () => {
    Animated.parallel([
      Animated.timing(tipOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(tipTranslateY, {
        toValue: -12,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsTipVisible(false);
    });
  };

  const onSubmit = () => {
    let isValid = true;
    setFirstNameError('');
    setMiddleNameError('');
    setLastNameError('');
    setPhoneNumberError('');
    setEmailError('');
    setMessageError('');
    setFileError(false);

    if (!firstName.trim()) {
      setFirstNameError('...');
      isValid = false;
    }

    if (middleName && /\d/.test(middleName)) {
      setMiddleNameError('...');
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError('...');
      isValid = false;
    }

    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanedPhone.length !== 10) {
      setPhoneNumberError('...');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError('...');
      isValid = false;
    }

    if (!message.trim()) {
      setMessageError('...');
      isValid = false;
    }

    if (!file?.uri) {
      setFileError(true);
      isValid = false;
    }

    if (!isValid) return;

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('message', message);
    formData.append('siteLink', Base_Url);
    formData.append('url', Base_Url);
    formData.append('referrer', '');
    formData.append('screen', '');
    formData.append('viewport', '');
    formData.append('portal', 'public');
    formData.append('browser', 'Mobile App');
    formData.append('os', Platform.OS);
    formData.append('device', String(Platform.Version));
    formData.append('timestamp', new Date().toISOString());

    if (file?.uri) {
      formData.append('attachments', {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name || file.filename || 'attachment',
      } as any);
    }
    console.log(formData);
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.createTicket,
      method: 'POST',
      useRecaptcha: true,
      isFormData: true,
      payload: formData,
      onComplete: (resp: any) => {
        setIsLoading(false);
        console.log('city help center ticket :', resp);
        if (resp?.status) {
          props?.navigation?.goBack();
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.message ?? resp?.data?.message ?? 'Submitted',
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

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Contact City Help'}
        RightIcon={
          <LinearGradient
            colors={[colors.Primary, colors.Secondary]}
            style={styles.tipIconWrap}>
            <TouchableOpacity activeOpacity={1} onPress={onOpenTip}>
              <QuestionIcon />
            </TouchableOpacity>
          </LinearGradient>
        }
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        <View style={[styles.row, {gap: normalized(12)}]}>
          <View style={styles.col}>
            <Text style={styles.inputHeading}>First Name*</Text>
            <CustomInput
              placeholder={'Enter First Name'}
              value={firstName}
              setValue={(val: any) => {
                setFirstName(allowOnlyString(val));
                setFirstNameError('');
              }}
              errorMsg={firstNameError}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputHeading}>Middle Name</Text>
            <CustomInput
              placeholder={'Enter Middle Name'}
              value={middleName}
              setValue={(val: any) => {
                setMiddleName(allowOnlyString(val));
                setMiddleNameError('');
              }}
              errorMsg={middleNameError}
            />
          </View>
        </View>

        <View style={[styles.row, {gap: normalized(12)}]}>
          <View style={styles.col}>
            <Text style={styles.inputHeading}>Last Name*</Text>
            <CustomInput
              placeholder={'Enter Last Name'}
              value={lastName}
              setValue={(val: any) => {
                setLastName(allowOnlyString(val));
                setLastNameError('');
              }}
              errorMsg={lastNameError}
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.inputHeading}>Phone Number*</Text>
            <CustomInput
              placeholder={'XXX - XXX - XXXX'}
              keyboardType={'number-pad'}
              maxLength={12}
              value={phoneNumber}
              setValue={(val: any) => {
                setPhoneNumber(formatPhoneNumber(val));
                setPhoneNumberError('');
              }}
              errorMsg={phoneNumberError}
            />
          </View>
        </View>

        <View style={styles.full}>
          <Text style={styles.inputHeading}>Email*</Text>
          <CustomInput
            placeholder={'Enter Email'}
            keyboardType={'email-address'}
            value={email}
            setValue={(val: any) => {
              setEmail(val);
              setEmailError('');
            }}
            errorMsg={emailError}
          />
        </View>

        <View style={styles.full}>
          <Text style={styles.inputHeading}>Message*</Text>
          <CustomInput
            placeholder={'Enter your message'}
            value={message}
            setValue={(val: any) => {
              setMessage(val);
              setMessageError('');
            }}
            isMultiLine={true}
            errorMsg={messageError}
          />
        </View>

        <View style={styles.full}>
          <Text style={styles.inputHeading}>Attachments*</Text>
          <CustomDocumentPicker
            type={'file'}
            limit={1}
            onSelect={(obj: any) => {
              const data = obj?.[0];
              setFileError(false);
              setFile(
                data?.uri
                  ? {
                      uri: data.uri,
                      type: data.type,
                      name: data.filename ?? data.name ?? 'attachment',
                    }
                  : null,
              );
            }}
            isError={fileError}
            text1={'Choose Files to Upload'}
            text2={file?.name ?? 'No File Chosen'}
          />
        </View>

        <View style={styles.submitWrap}>
          <CustomButton
            text={'Submit'}
            onPress={onSubmit}
            loading={isLoading}
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAwareScrollView>

      {isTipVisible ? (
        <Pressable style={styles.tipOverlay} onPress={onCloseTip}>
          <Animated.View
            style={[
              styles.tipCard,
              {
                opacity: tipOpacity,
                transform: [{translateY: tipTranslateY}],
              },
            ]}>
            <View style={styles.tipArrow} />
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <Text style={styles.tipTitle}>Need Help</Text>
              <Text style={styles.tipDesc}>
                Report issues or suggest improvements
              </Text>

              <View style={styles.tipItemRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipItemText}>Quick Response</Text>
              </View>
              <View style={styles.tipItemRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipItemText}>Bug Report</Text>
              </View>
              <View style={styles.tipItemRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipItemText}>Feature Request</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      ) : null}
    </View>
  );
};

export default CityHelpScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    contentContainer: {
      marginTop: normalized(15),
      paddingHorizontal: normalized(16),
      paddingBottom: normalized(24),
      gap: normalized(10),
    },
    row: {
      flexDirection: 'row',
      gap: normalized(10),
    },
    col: {
      flex: 1,
    },
    full: {
      width: '100%',
    },
    inputHeading: {
      color: colors.Heading_Txt,
      fontFamily: AppFonts.InterMedium,
      fontSize: normalized(15),
      marginBottom: normalized(4),
      marginTop: normalized(2),
    },
    submitWrap: {
      marginTop: normalized(8),
    },
    submitBtn: {
      backgroundColor: colors.Primary,
      height: normalized(42),
    },
    tipIconWrap: {
      width: normalized(36),
      height: normalized(36),
      borderRadius: normalized(10000),
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-start',
      paddingTop: normalized(105),
      paddingHorizontal: normalized(18),
    },
    tipArrow: {
      width: normalized(15),
      height: normalized(15),
      backgroundColor: colors.ScreenBackground,
      position: 'absolute',
      top: -5,
      right: normalized(15),
      transform: [{rotate: '45deg'}],
    },
    tipCard: {
      width: '90%',
      backgroundColor: colors.ScreenBackground,
      borderRadius: normalized(14),
      paddingVertical: normalized(18),
      paddingHorizontal: normalized(16),
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: normalized(12),
      shadowOffset: {width: 0, height: 6},
      elevation: 10,
      alignSelf: 'flex-end',
    },
    tipTitle: {
      color: colors.Heading_Txt,
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuBold,
      marginBottom: normalized(2),
    },
    tipDesc: {
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.InterRegular,
      marginBottom: normalized(3),
    },
    tipItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: normalized(8),
      gap: normalized(10),
    },
    tipDot: {
      width: normalized(7),
      height: normalized(7),
      borderRadius: normalized(100),
      backgroundColor: colors.Primary,
    },
    tipItemText: {
      color: colors.Desc_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.InterRegular,
    },
  });
