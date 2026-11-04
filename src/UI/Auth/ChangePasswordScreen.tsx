import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomHeader from '../Components/CustomHeader';
import {
  ChangePasswordEndpoints,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomInput from '../Components/CustomInput';
import EyeIcon from '../Svg/EyeIcon';
import HideEyeIcon from '../Svg/HideEyeIcon';
import SimpleButton from '../Components/SimpleButton';
import CustomButton from '../Components/CustomButton';
import {
  setCDRUserData,
  setDAMUserData,
  setHelpDeskUserData,
  setIsAlertShow,
  setIsLoader,
  setResidentUserData,
  setShowToast,
  setSIRUserData,
  setTimeKeepingUserData,
} from '../../Redux/AppReducers';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS, websocketUrl} from '../../Network/Urls';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import TickIcon from '../Svg/TickIcon';
import CloseIcon from '../Svg/CloseIcon';
import {sessionSocketRegistry} from '../../Network/Services/SessionSocketRegistry';
import {clearAuthContext} from '../../Network/Services/AuthTokenService';
import {deleteToken, getMessaging} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';

const ChangePasswordScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const data = props?.route?.params;

  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [currentPass, setCurrentPass] = useState('');
  const [hideCurrentPass, setHideCurrentPass] = useState(true);
  const [currentPassError, setCurrentPassError] = useState('');

  const [newPass, setNewPass] = useState('');
  const [hideNewPass, setHideNewPass] = useState(true);
  const [newPassError, setNewPassError] = useState('');

  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [hideConfirmNewPassword, setHideConfrimNewPassword] = useState(true);
  const [confirmPassError, setConfirmPassError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // password Validation

  const passwordHasUppercase = /[A-Z]/.test(newPass);
  const passwordHasLowercase = /[a-z]/.test(newPass);
  const passwordHasSpecialChar = /[^A-Za-z0-9]/.test(newPass);

  const passwordHasAllCharacterTypes =
    passwordHasUppercase && passwordHasLowercase && passwordHasSpecialChar;

  const passwordHasMinLength = newPass.length >= 12;

  const role = (data?.role ??
    'RESIDENT') as keyof typeof ChangePasswordEndpoints;
  const {endpoint, clear, sessionEndPoint} = ChangePasswordEndpoints[role];

  console.log('role', role, endpoint, clear);

  const onChangePassword = () => {
    let isFormValid = true;
    if (!currentPass) {
      setCurrentPassError('Please Enter Password');
      isFormValid = false;
    }
    if (currentPass?.length < 12) {
      setCurrentPassError('Password must be 12 digits long');
      isFormValid = false;
    }
    if (!newPass) {
      setNewPassError('Please Enter Password');
      isFormValid = false;
    }
    if (newPass?.length < 12) {
      setNewPassError('Password must be 12 digits long');
      isFormValid = false;
    }
    if (!confirmNewPass) {
      setConfirmPassError('Please Enter Password');
      isFormValid = false;
    }
    if (confirmNewPass?.length < 12) {
      setConfirmPassError('Password must be 12 digits long');
      isFormValid = false;
    }
    if (newPass != confirmNewPass) {
      isFormValid = false;
      setNewPassError('Passwords do not match.');
      setConfirmPassError('Passwords do not match.');
    }
    if (!isFormValid) {
      return;
    }
    const payload = {
      newPassword: newPass,
      oldPassword: currentPass,
      retypeNewPassword: confirmNewPass,
    };

    dispatch(setIsLoader(true));
    setIsLoading(true);
    apiHandler({
      // endpoint:
      //   data?.isCDR || data?.isSIR
      //     ? ENDPOINTS.staffChangePassword
      //     : data?.isVendor
      //     ? ENDPOINTS.vendorChangePassword
      //     : ENDPOINTS.changePassword,
      endpoint: endpoint,
      method: 'POST',
      payload,
      authContext: role,
      // authContext: data?.isVendor
      //   ? 'DAM'
      //   : data?.isCDR
      //   ? 'CDR'
      //   : data?.isSIR
      //   ? 'SIR'
      //   : 'RESIDENT',
      onComplete: (resp: any) => {
        setIsLoading(false);
        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Password Changed Successfully',
            }),
          );
          dispatch(setIsLoader(false));
          // sessionSocketRegistry.disconnect(role, sessionEndPoint);
          props?.navigation?.pop(4);
          clearAuthContext(role);
          dispatch(clear(null));
          deleteToken(getMessaging(getApp()));
          sessionSocketRegistry.disconnect(
            role,
            websocketUrl + sessionEndPoint,
          );
          // if (data?.isVendor) {
          //   dispatch(setDAMUserData(null));
          // } else if (data?.isCDR) {
          //   dispatch(setCDRUserData(null));
          // } else if (data?.isSIR) {
          //   dispatch(setSIRUserData(null));
          // } else {
          //   dispatch(setResidentUserData(null));
          // }

          dispatch(
            setIsAlertShow({
              value: true,
              message: 'Session Expired. Login Again.',
            }),
          );
        } else {
          console.log('getErrorMessage:', getErrorMessage(resp));
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          dispatch(setIsLoader(false));
        }
      },
    });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.Background,
      }}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Change Password'}
      />

      <View
        style={{marginHorizontal: normalized(20), marginTop: normalized(20)}}>
        <Text style={styles.Input_Heading}>Current Password</Text>
        <CustomInput
          placeholder={'*********'}
          value={currentPass}
          setValue={(val: string) => {
            setCurrentPass(val);
            setCurrentPassError('');
          }}
          errorMsg={currentPassError}
          RightIcon={hideCurrentPass ? EyeIcon : HideEyeIcon}
          onRightIconPress={() => {
            setHideCurrentPass((prev: any) => !prev);
          }}
          secureEntry={hideCurrentPass}
        />

        {currentPassError && (
          <Text style={styles.errorMsg}>{currentPassError}</Text>
        )}

        <Text style={styles.Input_Heading}>New Password</Text>
        <CustomInput
          placeholder={'*********'}
          value={newPass}
          setValue={(val: string) => {
            setNewPass(val);
            setNewPassError('');
          }}
          errorMsg={newPassError}
          RightIcon={hideNewPass ? EyeIcon : HideEyeIcon}
          onRightIconPress={() => {
            setHideNewPass((prev: any) => !prev);
          }}
          secureEntry={hideNewPass}
        />

        <Text style={styles.Input_Heading}>Confirm Password</Text>
        <CustomInput
          placeholder={'*********'}
          value={confirmNewPass}
          setValue={(val: string) => {
            setConfirmNewPass(val);
            setConfirmPassError('');
          }}
          errorMsg={confirmPassError}
          RightIcon={hideConfirmNewPassword ? EyeIcon : HideEyeIcon}
          onRightIconPress={() => {
            setHideConfrimNewPassword((prev: any) => !prev);
          }}
          secureEntry={hideNewPass}
        />
        {confirmPassError && (
          <Text style={styles.errorMsg}>{confirmPassError}</Text>
        )}

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
              Password includes one uppercase, lowercase, and special character.
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
        <View style={styles.buttons}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Cancel'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
              style={{marginTop: 0}}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton
              text={'Save'}
              onPress={() => {
                console.log('SAVE PRESSED');
                onChangePassword();
              }}
              loading={isLoading}
              style={{marginTop: 0}}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    buttons: {
      width: normalized(200),
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      alignSelf: 'flex-end',
      marginTop: normalized(15),
    },
    nextBtnCont: {
      width: normalized(90),
    },
    errorMsg: {
      marginTop: normalized(3),
      color: 'red',
      fontSize: normalized(12),
      marginLeft: normalized(2),
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
