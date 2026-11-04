import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewInstance,
} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomInput from '../Components/CustomInput';

import {
  allowOnlyNumbers,
  allowOnlyString,
  formatPhoneNumber,
  getErrorMessage,
  makeId,
} from '../../Utils/Helper';
import {AppFonts, normalized, ScreenProps} from '../../Utils/AppConstants';
import LocationIcon from '../Svg/LocationIcon';
import {Routes} from '../../Utils/Routes';
import CustomHeader from '../Components/CustomHeader';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import {
  setActiveParkingSessions,
  setResidentUserData,
  setShowToast,
} from '../../Redux/AppReducers';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import LogoutModal from '../Components/LogoutModal';
import AppImagePicker from '../Components/AppImagePicker';
import {Base_Url, ENDPOINTS} from '../../Network/Urls';
import AppImageViewer from '../Components/AppImageView';
import {apiHandler} from '../../Network/Services/ApiHandler';
import CommonDataManager from '../../Utils/CommonManager';
import {clearAuthContext} from '../../Network/Services/AuthTokenService';
import {deleteToken, getMessaging} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import EditIcon from '../Svg/EditIcon';

type LatLng = {lat: number; lng: number};

const EditProfileScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const insects = useSafeAreaInsets();
  const userData = selector?.residentUserData;

  const [firstName, setFirstName] = useState(userData?.firstName ?? '');
  const [middleName, setMiddleName] = useState(userData?.middleName ?? '');
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [fullName, setFullName] = useState(
    `${userData?.firstName} ${userData?.lastName}`,
  );
  const [email, setEmail] = useState(userData?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? '');
  const [city, setCity] = useState(userData?.city ?? '');
  const [state, setState] = useState(userData?.state ?? '');
  const [zipCode, setZipCode] = useState(userData?.zipCode ?? '');
  const [address, setAddress] = useState(userData?.address ?? '');
  const [addressCoords, setAddressCoords] = useState<LatLng>();
  const [isEdit, setIsEdit] = useState(false);
  const [isShowThemeModal, setIsShowThemeModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(
    userData?.profilePicture
      ? userData?.profilePicture?.includes('http')
        ? userData?.profilePicture
        : `${Base_Url}${userData?.profilePicture}`
      : '',
  );
  const [isLoading, setIsLoading] = useState(false);
  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(40);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);
  const [modalType, setModalType] = useState<'logout' | 'deleteAccount'>(
    'logout',
  );

  // Refs
  const firstNameRef = useRef<any>(null);
  const middleNameRef = useRef<any>(null);
  const lastNameRef = useRef<any>(null);
  const phoneNumberRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const cityRef = useRef<any>(null);
  const stateRef = useRef<any>(null);
  const zipCodeRef = useRef<any>(null);
  const addressTouchableRef = useRef<ViewInstance>(null);

  const announce = (msg: string) => {
    if (msg) AccessibilityInfo.announceForAccessibility(msg);
  };

  const moveSRFocus = (refObj: any) => {
    const node = findNodeHandle(refObj?.current);
    if (node)
      setTimeout(() => AccessibilityInfo.setAccessibilityFocus(node), 50);
  };

  const onLogout = () => {
    setIsShowThemeModal(false);

    apiHandler({
      endpoint: ENDPOINTS.residentLogout,
      method: 'POST',
      payload: {},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        if (resp?.status) {
          dispatch(setResidentUserData(null));
          clearAuthContext('RESIDENT');
          dispatch(setActiveParkingSessions([]));
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'User is Logged Out',
            }),
          );
          deleteToken(getMessaging(getApp()));
          setTimeout(() => props?.navigation?.pop(3), 500);
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

    announce('Logged out');
  };

  const onDeleteAccount = () => {
    setIsShowThemeModal(false);
    apiHandler({
      endpoint: ENDPOINTS.deleteAccount,
      method: 'DELETE',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        console.log('DELETE account RAW:', JSON.stringify(resp));
        if (resp?.status) {
          dispatch(setResidentUserData(null));
          clearAuthContext('RESIDENT');
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Account has been deleted Successfully',
            }),
          );
          setTimeout(() => props?.navigation?.pop(3), 500);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp) || 'Delete account failed',
            }),
          );
        }
      },
    });
  };

  const focusNextField = (inputRef: any) => {
    if (inputRef?.current) inputRef?.current?.focus();
  };

  const onUpdateProfile = () => {
    if (!firstName.trim()) return announce('First name is required');
    if (!lastName.trim()) return announce('Last name is required');
    if (!email.trim()) return announce('Email is required');
    if (!CommonDataManager.getSharedInstance().isEmailValid(email))
      return announce('Invalid email format');
    if (!phoneNumber.trim()) return announce('Phone number is required');
    if (phoneNumber?.length < 12)
      return announce('Phone number must be 10 digits');
    if (!address) return announce('Address is required');
    if (!city.trim()) return announce('City is required');
    if (!state.trim()) return announce('State is required');
    // if (!zipCode.trim()) return announce('Zip code is required');

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
    formData.append('accressCoords[lat]', addressCoords?.lat ?? '');
    formData.append('accressCoords[lng]', addressCoords?.lng ?? '');

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
      endpoint: ENDPOINTS.updateProfile,
      method: 'PATCH',
      payload: formData,
      authContext: 'RESIDENT',
      isFormData: true,

      onComplete: (resp: any) => {
        console.log('EDIT PROFILE formData --->', formData);
        setIsLoading(false);
        if (resp?.status) {
          console.log('profile edit response :', resp);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Profile Updated Successfully.',
            }),
          );
          const updatedUserData = {
            ...userData,
            ...(resp?.data?.data ?? {}),
          };

          setDataInAsync(AsyncKeyStrings.ResidentUserData, updatedUserData);
          dispatch(setResidentUserData(updatedUserData));
          setIsEdit(false);
          setIsLoading(false);
          announce('Profile updated successfully');
        } else {
          setIsLoading(false);
          console.log('profile edit response :', resp);
          const msg = getErrorMessage(resp) || 'Update failed';
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: msg,
            }),
          );
          announce(msg);
        }
      },
    });
  };

  return (
    <View
      style={{
        paddingTop: insects.top,
        // paddingBottom: insects.bottom,
        flex: 1,
        backgroundColor: colors.Background,
      }}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={isEdit ? 'Edit Profile' : 'Profile'}
        SettingPress={() => props?.navigation?.navigate(Routes.SettingsScreen)}
      />

      <ScrollView
        contentContainerStyle={{paddingHorizontal: normalized(20)}}
        showsVerticalScrollIndicator={false}>
        {/* Profile Picture */}
        <View style={styles.profileRow}>
          <TouchableOpacity
            ref={addressTouchableRef}
            activeOpacity={1}
            onPress={() => isEdit && setShowImagePicker(true)}
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
                  resizeMode="cover"
                  source={{uri: selectedImage}}
                  style={styles.profileImg}
                />
              ) : (
                <Text style={styles.profileTxt}>{firstName?.[0] ?? '-'}</Text>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.profileContentCont}>
            <Text style={styles.nameTxt}>{fullName}</Text>
            <Text style={[styles.Desc_Txt, {textAlign: 'left'}]}>{email}</Text>
          </View>
          {!isEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsEdit(true)}>
              <EditIcon primary={colors.Heading_Txt} strokeOpacity={1} />
            </TouchableOpacity>
          )}
        </View>

        {/* First & Middle Name */}
        <View style={styles.Input_Row}>
          <View
            style={{flex: 1}}
            accessible
            accessibilityLabel={`First name ${firstName || 'not entered'}`}>
            <Text style={styles.Input_Heading}>First Name</Text>
            <CustomInput
              ref={firstNameRef}
              placeholder="Enter First Name"
              value={firstName}
              setValue={(val: string) => setFirstName(allowOnlyString(val))}
              isEditable={isEdit}
            />
          </View>
          <View
            style={{flex: 1}}
            accessible
            accessibilityLabel={`Middle name ${middleName || 'not entered'}`}>
            <Text style={styles.Input_Heading}>Middle Name</Text>
            <CustomInput
              ref={middleNameRef}
              placeholder="Enter Middle Name"
              value={middleName}
              setValue={(val: string) => setMiddleName(allowOnlyString(val))}
              isEditable={isEdit}
            />
          </View>
        </View>

        {/* Last Name & Phone */}
        <View style={styles.Input_Row}>
          <View
            style={{flex: 1}}
            accessible
            accessibilityLabel={`Last name ${lastName || 'not entered'}`}>
            <Text style={styles.Input_Heading}>Last Name</Text>
            <CustomInput
              ref={lastNameRef}
              placeholder="Enter Last Name"
              value={lastName}
              setValue={(val: string) => setLastName(allowOnlyString(val))}
              isEditable={isEdit}
            />
          </View>
          <View
            style={{flex: 1}}
            accessible
            accessibilityLabel={`Phone number ${phoneNumber || 'not entered'}`}>
            <Text style={styles.Input_Heading}>Phone Number</Text>
            <CustomInput
              ref={phoneNumberRef}
              placeholder="XXX - XXX - XXXX"
              maxLength={12}
              value={phoneNumber}
              setValue={(val: string) => setPhoneNumber(formatPhoneNumber(val))}
              isEditable={isEdit}
            />
          </View>
        </View>

        {/* Email */}
        <View accessible accessibilityLabel={`Email ${email || 'not entered'}`}>
          <Text style={styles.Input_Heading}>Email</Text>
          <CustomInput
            ref={emailRef}
            placeholder="Enter Email"
            isEditable={false}
            value={email}
            setValue={(val: string) => setEmail(val)}
          />
        </View>

        {/* Address */}
        <View
          accessible
          accessibilityLabel={`Address ${address || 'not selected'}`}>
          <Text style={styles.Input_Heading}>Address</Text>
          <TouchableOpacity
            ref={addressTouchableRef}
            activeOpacity={1}
            onPress={() => {
              if (!isEdit) return;
              props?.navigation?.navigate(Routes.MapScreen, {
                onChooseLocation: (loc: any) => {
                  setCity(loc?.City);
                  setState(loc?.State);
                  setAddress(loc?.address);
                  setZipCode(loc?.zipCode);
                  setAddressCoords(loc?.location);
                  announce('Address selected');
                },
              });
            }}
            style={[
              styles.addressBox,
              {
                backgroundColor: colors.Background,
                borderColor: colors.Grey_2,
                height:
                  BASE_HEIGHT +
                  Math.max(0, Math.min(addressLines, MAX_LINES) - 1) *
                    LINE_HEIGHT,
              },
            ]}>
            <Text
              style={[
                styles.Desc_Txt,
                {
                  flex: 1,
                  textAlign: 'left',
                  lineHeight: LINE_HEIGHT,
                },
              ]}
              onTextLayout={e => {
                const lines = e.nativeEvent.lines?.length ?? 1;
                setAddressLines(Math.max(1, Math.min(MAX_LINES, lines)));
              }}>
              {address ? address : 'Select Address'}
            </Text>
            <LocationIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        </View>

        {/* City & State */}
        <View style={styles.Input_Row}>
          <View
            style={{flex: 1}}
            accessible
            accessibilityLabel={`City ${city || 'not entered'}`}>
            <Text style={styles.Input_Heading}>City</Text>
            <CustomInput
              ref={cityRef}
              placeholder="Enter City"
              value={city}
              setValue={(val: string) => setCity(allowOnlyString(val))}
              isEditable={isEdit}
            />
          </View>
          <View
            style={{flex: 1}}
            accessible
            accessibilityLabel={`State ${state || 'not entered'}`}>
            <Text style={styles.Input_Heading}>State</Text>
            <CustomInput
              ref={stateRef}
              placeholder="Enter State"
              value={state}
              setValue={(val: string) => setState(allowOnlyString(val))}
              isEditable={isEdit}
            />
          </View>
        </View>

        {/* Zip Code */}
        <View
          accessible
          accessibilityLabel={`Zip code ${zipCode || 'not entered'}`}>
          <Text style={styles.Input_Heading}>Zip Code</Text>
          <CustomInput
            ref={zipCodeRef}
            placeholder="Enter Zip Code"
            maxLength={5}
            value={zipCode}
            setValue={(val: string) => setZipCode(allowOnlyNumbers(val))}
            isEditable={isEdit}
          />
        </View>

        {/* Buttons */}
        {isEdit ? (
          <View style={styles.btnRow}>
            <View style={styles.nextBtnCont}>
              <SimpleButton
                text="Cancel"
                onPress={() => setIsEdit(false)}
                loading={false}
              />
            </View>
            <View style={styles.nextBtnCont}>
              <CustomButton
                text="Save"
                onPress={onUpdateProfile}
                loading={isLoading}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.rowCont, {gap: normalized(5)}]}>
            <View style={{flex: 1, minWidth: 0}}>
              <CustomButton
                text="Delete Account"
                onPress={() => {
                  setModalType('deleteAccount');
                  setIsShowThemeModal(true);
                }}
                style={{
                  backgroundColor: colors.ToastColors.Error,
                }}
                loading={false}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <SimpleButton
                text="Logout"
                onPress={() => {
                  setModalType('logout');
                  setIsShowThemeModal(true);
                }}
                loading={false}
              />
            </View>

            {/* <View style={styles.nextBtnCont}>
              <SimpleButton
                text="Edit"
                onPress={() => setIsEdit(true)}
                loading={false}
                style={{backgroundColor: colors.Primary}}
                textStyle={{color: colors.White}}
              />
            </View> */}
          </View>
        )}
      </ScrollView>

      <LogoutModal
        isVisible={isShowThemeModal}
        onClose={() => setIsShowThemeModal(false)}
        title={modalType === 'deleteAccount' ? 'Delete Account' : 'Logout'}
        message={
          modalType === 'deleteAccount'
            ? 'Are you sure you want to delete your account?'
            : 'Are you sure you want to log out?'
        }
        confirmText={modalType === 'deleteAccount' ? 'Delete' : 'Logout'}
        confirmButtonStyle={
          modalType === 'deleteAccount'
            ? {backgroundColor: colors.ToastColors.Error}
            : undefined
        }
        onConfirm={modalType === 'deleteAccount' ? onDeleteAccount : onLogout}
      />

      {showImagePicker && (
        <AppImagePicker
          limit={1}
          onClose={() => setShowImagePicker(false)}
          onImageSelect={(userSelectedImage: any) => {
            setShowImagePicker(false);
            if (userSelectedImage) {
              let image = Array.isArray(userSelectedImage)
                ? userSelectedImage[0]
                : userSelectedImage;
              setSelectedImage(image);
            }
          }}
        />
      )}
    </View>
  );
};

export default EditProfileScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginVertical: normalized(12),
    },
    profilePicCont: {
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
      shadowOffset: {width: 2, height: 2},
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
