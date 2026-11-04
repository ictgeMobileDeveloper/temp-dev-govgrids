import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomInput from '../Components/CustomInput';
import {
  allowOnlyString,
  formatPhoneNumber,
  getErrorMessage,
  makeId,
  useGradualAnimation,
} from '../../Utils/Helper';
import {
  AppFonts,
  ChangePasswordEndpoints,
  isAndroid15Plus,
  isSmallDevice,
  normalized,
} from '../../Utils/AppConstants';
import LocationIcon from '../Svg/LocationIcon';
import {Routes} from '../../Utils/Routes';
import CustomHeader from '../Components/CustomHeader';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import {
  setCDRUserData,
  setDAMUserData,
  setHelpDeskUserData,
  setResidentUserData,
  setShowToast,
  setSIRUserData,
  setTimeKeepingUserData,
} from '../../Redux/AppReducers';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import {AppStrings, AsyncKeyStrings, AuthContext} from '../../Utils/AppStrings';
import LogoutModal from '../Components/LogoutModal';
import AppImagePicker from '../Components/AppImagePicker';
import {Base_Url, ENDPOINTS, websocketUrl} from '../../Network/Urls';
import AppImageViewer from '../Components/AppImageView';
import {apiHandler} from '../../Network/Services/ApiHandler';
import CommonDataManager from '../../Utils/CommonManager';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {clearAuthContext} from '../../Network/Services/AuthTokenService';
import {deleteToken, getMessaging} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import EditIcon from '../Svg/EditIcon';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';

const ROLE_LOGOUT_MAP: Record<
  string,
  {clearAction: (payload: null) => any; authContext: AuthContext}
> = {
  CDR: {clearAction: setCDRUserData, authContext: 'CDR'},
  DAM: {clearAction: setDAMUserData, authContext: 'DAM'},
  SIR: {clearAction: setSIRUserData, authContext: 'SIR'},
  HELPDESK: {clearAction: setHelpDeskUserData, authContext: 'HELPDESK'},
  TIMEKEEPING: {
    clearAction: setTimeKeepingUserData,
    authContext: 'TIMEKEEPING',
  },
  RESIDENT: {clearAction: setResidentUserData, authContext: 'RESIDENT'},
};

const SIRProfileScreen = (props: any) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const dispatch = useDispatch();
  const insects = useSafeAreaInsets();
  const isTK = props?.route?.params?.isTK;
  const isSIR = props?.route?.params?.isSIR;
  const isCDR = props?.route?.params?.isCDR;
  const isDamUser = props?.route?.params?.isDamUser;
  const isHelpDesk = props?.route?.params?.isHelpDesk;

  const userData = props?.route?.params?.isCDR
    ? selector?.CDRUserData
    : isTK
    ? selector?.TimeKeepingUserData
    : isDamUser
    ? selector?.damUserData
    : isHelpDesk
    ? selector?.helpDeskUserData
    : selector?.SIRUserData;

  const role = isCDR
    ? 'CDR'
    : isDamUser
    ? 'DAM'
    : isHelpDesk
    ? 'HELPDESK'
    : isTK
    ? 'TIMEKEEPING'
    : 'SIR';

  const [screenUserData, setScreenUserData] = useState(null);
  const [venderName, setVenderName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressCoords, setAddressCoords] = useState<any>({});
  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(40);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);
  const [isEdit, setIsEdit] = useState(false);
  const [isShowThemeModal, setIsShowThemeModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<any>(
    userData?.profilePicture
      ? userData?.profilePicture?.includes('http')
        ? userData?.profilePicture
        : `${Base_Url}${userData?.profilePicture}`
      : '',
  );
  const [fullName, setFullName] = useState(
    `${userData?.firstName} ${userData?.lastName}`,
  );
  const [isLoading, setIsLoading] = useState(false);

  //   --------->>>> Erros

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [jobTitleError, setJobTitlevError] = useState('');

  //   -------------->>>  Refs

  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const emailRef = useRef(null);
  const jobTitleRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setVenderName(userData?.venderName ?? '');
      if (isDamUser) {
        setVenderName(userData?.vendorName ?? '');
      } else {
        setFirstName(userData?.firstName ?? '');
        setMiddleName(userData?.middleName ?? '');
        setLastName(userData?.lastName ?? '');
      }
      setEmail(userData.email ?? '');
      setPhoneNumber(userData.phoneNumber ?? '');
      setCity(userData.city ?? '');
      setState(userData.state ?? '');
      setJobTitle(userData.jobTitle ?? '');
      setAddress(userData.address ?? '');
    }
  }, []);

  useEffect(() => {
    console.log('user data', userData);
    if (userData) {
      setScreenUserData(userData);
    }
  }, []);

  const onLogout = () => {
    setIsShowThemeModal(false);

    const role = props?.route?.params?.isCDR
      ? 'CDR'
      : isDamUser
      ? 'DAM'
      : isSIR
      ? 'SIR'
      : isHelpDesk
      ? 'HELPDESK'
      : isTK
      ? 'TIMEKEEPING'
      : 'RESIDENT';

    const {clearAction, authContext} = ROLE_LOGOUT_MAP[role];
    const {sessionEndPoint} = ChangePasswordEndpoints[role];

    apiHandler({
      endpoint: isDamUser
        ? ENDPOINTS.venderLogout
        : isTK
        ? ENDPOINTS.employeeLogout
        : ENDPOINTS.organizationLogout,
      method: 'POST',
      payload: {},
      authContext,
      onComplete: (resp: any) => {
        console.log('Log out Cus Admin', resp);
        if (resp?.status) {
          dispatch(clearAction(null));
          clearAuthContext(authContext);
          deleteToken(getMessaging(getApp()));
          sessionSocketRegistry.disconnect(
            role,
            websocketUrl + sessionEndPoint,
          );
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'User is Logged Out',
            }),
          );
          setTimeout(() => props?.navigation?.pop(isDamUser ? 3 : 2), 500);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: 'Logout Failed',
            }),
          );
        }
      },
    });
  };

  const focusNextField = (inputRef: any) => {
    if (inputRef?.current) {
      inputRef?.current?.focus();
    }
  };

  const onUpdateProfile = () => {
    let isFormValid = true;
    if (isDamUser) {
      if (!venderName.trim()) {
        setFirstNameError('Please enter vendor name');
        isFormValid = false;
      } else {
        setFirstNameError('');
      }
    } else {
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
    }
    if (!email.trim()) {
      setEmailError('Please enter your email');
      isFormValid = false;
    } else if (!CommonDataManager.getSharedInstance().isEmailValid(email)) {
      setEmailError('Invalid email format');
      isFormValid = false;
    } else {
      setEmailError('');
    }
    if (!address) {
      setLocationError('Please enter your last name');

      isFormValid = false;
    } else {
      setLocationError('');
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
    if (!isDamUser && !jobTitle) {
      setJobTitlevError('Please enter your phone number');
      isFormValid = false;
    } else {
      setPhoneNumberError('');
    }

    if (!isFormValid) {
      return;
    }
    const payload = {
      email: email,
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      address: address,
      city: city,
      state: state,
      addressCoords: addressCoords,
      ...(!isDamUser && {jobTitle}),
    };

    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('phoneNumber', phoneNumber);

    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('addressCoords[lat]', addressCoords?.lat ?? '');
    formData.append('addressCoords[lng]', addressCoords?.lng ?? '');
    if (!isDamUser) {
      formData.append('jobTitle', jobTitle);
      formData.append('venderName', venderName);
    }

    if (!selectedImage.includes('http') && selectedImage) {
      const filename =
        makeId(6) + selectedImage.substring(selectedImage.lastIndexOf('/') + 1);
      const fileType = filename?.split('.').pop();
      formData.append('profilePicture', {
        uri:
          Platform.OS === 'ios'
            ? selectedImage.replace('file://', '')
            : selectedImage,
        type: `image/${fileType}`,
        name: filename || `photo.${fileType}`,
      });
    }

    apiHandler({
      endpoint: isDamUser
        ? ENDPOINTS.damUpdateProfile
        : isHelpDesk
        ? ENDPOINTS.HelpDeskEditProfile
        : ENDPOINTS.staffUdpateProfile,
      method: 'PATCH',
      payload: formData,
      isFormData: true,
      authContext: props?.route?.params?.isCDR
        ? 'CDR'
        : isDamUser
        ? 'DAM'
        : isHelpDesk
        ? 'HELPDESK'
        : 'SIR',
      onComplete: (resp: any) => {
        if (resp?.status) {
          console.log('Update Profile Response: ', resp);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Profile Updated Successfully.',
            }),
          );
          if (props?.route?.params?.isCDR) {
            dispatch(setCDRUserData(resp?.data?.data));
          } else if (isDamUser) {
            dispatch(setDAMUserData(resp?.data?.data));
          } else if (isHelpDesk) {
            dispatch(setHelpDeskUserData(resp?.data?.data));
          } else {
            dispatch(setSIRUserData(resp?.data?.data));
          }

          setIsEdit(false);
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
  };

  const {height} = useGradualAnimation();

  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  return (
    <View
      style={{
        paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
        paddingBlock: insects.bottom,
        flex: 1,
        backgroundColor: colors.Background,
      }}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={isEdit ? 'Edit Profile' : 'Profile'}
        SettingPress={() =>
          props?.navigation?.navigate(Routes.SettingsScreen, {
            role: role,
          })
        }
      />
      <KeyboardAwareScrollView
        style={{flex: 1}}
        contentContainerStyle={{
          paddingBottom: insects.bottom + normalized(20),
          paddingHorizontal: normalized(20),
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={Platform.OS === 'android' ? 20 : 0}
        showsVerticalScrollIndicator={false}>
        {!isEdit && (
          <View style={styles.btnCont}>
            {/* {!props?.route?.params?.isCDR && !isTK && (
              <View style={{flex: 1}}>
                <CustomButton
                  text={'Change Password'}
                  onPress={() => {
                    props?.navigation?.navigate(Routes.Auth.ChangePassword, {
                      endpoint: isHelpDesk
                        ? ENDPOINTS.helpDeskChangePassword
                        : isDamUser
                        ? ENDPOINTS.vendorChangePassword
                        : ENDPOINTS.staffChangePassword,
                      isVendor: isDamUser ? true : false,
                      isSIR: isSIR,
                      isCDR: isCDR,
                      isHelpDesk: isHelpDesk,
                      authContext: isHelpDesk
                        ? 'HELPDESK'
                        : isDamUser
                        ? 'DAM'
                        : 'SIR',
                    });
                  }}
                  style={{backgroundColor: colors.Dark_Blue}}
                  loading={false}
                />
              </View>
            )} */}
            <View style={{flex: 1}}>
              <CustomButton
                text={'Logout'}
                onPress={() => {
                  setIsShowThemeModal(true);
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.ToastColors.Error,
                }}
                loading={false}
              />
            </View>
          </View>
        )}

        <View style={styles.profileRow}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              isEdit && setShowImagePicker(true);
            }}
            style={styles.profilePicOuter}>
            <View
              style={[
                styles.profilePicCont,
                {
                  backgroundColor: selectedImage
                    ? 'transparent'
                    : colors.Primary,
                },
              ]}>
              {selectedImage ? (
                <AppImageViewer
                  resizeMode={'cover'}
                  source={{uri: selectedImage}}
                  style={styles.profileImg}
                />
              ) : (
                <Text style={styles.profileTxt}>
                  {isDamUser
                    ? userData?.vendorName?.[0] ?? ''
                    : `${userData?.firstName?.[0] ?? ''}`}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileContentCont}>
            <Text style={styles.nameTxt}>
              {isDamUser ? userData?.vendorName : fullName}
            </Text>
            <Text
              style={[
                styles.Desc_Txt,
                {alignSelf: 'flex-start', textAlign: 'left'},
              ]}>
              {email}
            </Text>
          </View>
          {!isTK && !isEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsEdit(true)}>
              <EditIcon primary={colors.Heading_Txt} strokeOpacity={1} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.Input_Row}>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>
              {isDamUser ? 'Vendor Name' : 'First Name'}
            </Text>
            <CustomInput
              onSubmitEditing={() => focusNextField(middleNameRef)}
              placeholder={isDamUser ? 'Enter Vendor Name' : 'Enter First Name'}
              value={isDamUser ? userData?.vendorName : firstName}
              setValue={(val: any) => {
                setFirstName(allowOnlyString(val));
                setFirstNameError('');
              }}
              isEditable={isEdit}
              errorMsg={firstNameError}
            />
          </View>

          {!isDamUser && (
            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Middle Name</Text>
              <CustomInput
                ref={middleNameRef}
                onSubmitEditing={() => focusNextField(lastNameRef)}
                placeholder={'Enter Middle Name'}
                value={middleName}
                setValue={(val: any) => {
                  setMiddleName(allowOnlyString(val));
                }}
                isEditable={isEdit}
                errorMsg={middleNameError}
              />
            </View>
          )}
        </View>

        <View style={styles.Input_Row}>
          {!isDamUser && (
            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Last Name</Text>
              <CustomInput
                ref={lastNameRef}
                onSubmitEditing={() => focusNextField(phoneNumberRef)}
                placeholder={'Enter Last Name'}
                value={lastName}
                setValue={(val: any) => {
                  setLastName(allowOnlyString(val));
                  setLastNameError('');
                }}
                isEditable={isEdit}
                errorMsg={lastNameError}
              />
            </View>
          )}

          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Phone Number</Text>
            <CustomInput
              ref={phoneNumberRef}
              onSubmitEditing={() => focusNextField(emailRef)}
              placeholder={'XXX - XXX - XXXX'}
              maxLength={12}
              value={phoneNumber}
              setValue={(phone: any) => {
                setPhoneNumber(formatPhoneNumber(phone));
                setPhoneNumberError('');
              }}
              isEditable={isEdit}
              errorMsg={phoneNumberError}
            />
          </View>
        </View>

        <View>
          <Text style={styles.Input_Heading}>Email</Text>
          <CustomInput
            ref={emailRef}
            placeholder={'Enter Email'}
            isEditable={false}
            value={email}
            setValue={(val: any) => {
              setEmail(val);
              setEmailError('');
            }}
            errorMsg={emailError}
          />
        </View>

        <View>
          <Text style={styles.Input_Heading}>Address</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              if (!isEdit) return;
              props?.navigation?.navigate(Routes.MapScreen, {
                onChooseLocation: (loc: any) => {
                  setCity(loc?.City);
                  setState(loc?.State);
                  setAddress(loc?.address);
                  setLocationError('');
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
                borderColor: locationError ? colors.Error : colors.Grey_2,
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
                    : isEdit
                    ? colors.Heading_Txt
                    : colors.Desc_Txt,
                  lineHeight: LINE_HEIGHT,
                  fontSize: normalized(14),
                },
              ]}>
              {address ? address : 'Select Address'}
            </Text>
            <LocationIcon primary={colors.Desc_Txt} width={20} height={20} />
          </TouchableOpacity>
        </View>

        {!isDamUser && (
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Job Title</Text>
            <CustomInput
              ref={jobTitleRef}
              placeholder={!isEdit ? '' : 'Enter Job Title'}
              value={jobTitle}
              setValue={(val: any) => {
                setJobTitle(val);
                setJobTitlevError('');
              }}
              isEditable={isEdit}
              errorMsg={jobTitleError}
            />
          </View>
        )}
        {isEdit && (
          <View style={styles.btnRow}>
            <View style={styles.nextBtnCont}>
              <SimpleButton
                text={'Cancel'}
                onPress={() => setIsEdit(false)}
                loading={false}
              />
            </View>
            <View style={styles.nextBtnCont}>
              <CustomButton
                text={'Save'}
                onPress={onUpdateProfile}
                loading={isLoading}
              />
            </View>
          </View>
        )}
      </KeyboardAwareScrollView>

      <LogoutModal
        isVisible={isShowThemeModal}
        onClose={() => setIsShowThemeModal(false)}
        onLogout={() => {
          onLogout();
        }}
      />

      {showImagePicker ? (
        <AppImagePicker
          limit={1}
          onClose={() => {
            setShowImagePicker(false);
          }}
          onImageSelect={(userSelectedImage: any) => {
            console.log('img----  ', userSelectedImage);
            setShowImagePicker(false);
            if (userSelectedImage) {
              let image = Array.isArray(userSelectedImage)
                ? userSelectedImage[0]
                : userSelectedImage;
              setSelectedImage(image);
            }
          }}
        />
      ) : null}
    </View>
  );
};

export default SIRProfileScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginVertical: normalized(12),
    },
    profilePicCont: {
      // borderWidth: 1,
      borderColor: colors.Heading_Txt,
      borderRadius: normalized(81),
      width: normalized(70),
      height: normalized(70),
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99,
    },
    profilePicOuter: {
      borderRadius: normalized(81),
      width: normalized(80),
      height: normalized(80),
      backgroundColor: colors.White,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.Heading_Txt,
      shadowOpacity: 0.3,
      shadowRadius: normalized(2),
      elevation: 6,
      shadowOffset: {
        width: 2,
        height: 2,
      },
    },
    profileContentCont: {
      flex: 1,
      gap: normalized(5),
    },
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: normalized(15),
    },
    btnCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      justifyContent: 'space-between',
    },
    profileImg: {
      resizeMode: 'cover',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      borderRadius: normalized(10),
    },
    profileTxt: {
      color: colors.White,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
    },
  });
