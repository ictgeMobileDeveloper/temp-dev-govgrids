import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import CustomInput from '../Components/CustomInput';
import {allowOnlyNumbers, getErrorMessage} from '../../Utils/Helper';
import CustomCheckBox from '../Components/CustomCheckBox';
import CustomButton from '../Components/CustomButton';
import DateTimeComp from '../Components/DateTimeComp';
import moment from 'moment';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {Routes} from '../../Utils/Routes';

const FlagRaisingNewReqScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();

  const userData = selector?.residentUserData;

  //   ----------->>> values states
  const [firstName, setFirstName] = useState(userData?.firstName ?? '');
  const [middleName, setMiddleName] = useState(userData?.middleName ?? '');
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [email, setEmail] = useState(userData?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? '');
  const [attendees, setAttendees] = useState('');
  const [flag, setFlag] = useState('');
  const [raisingDate, setRaisingDate] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //   --------->>>> Errors

  const [attendeesError, setAttendeesError] = useState('');
  const [flagError, setFlagError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [agreeError, setAgreeError] = useState(false);

  const onSubmit = () => {
    let isFormValid = true;
    if (!attendees.trim()) {
      setAttendeesError('Please enter your first name');
      isFormValid = false;
    } else {
      setAttendeesError('');
    }
    if (!flag) {
      setFlagError('Please enter your first name');
      isFormValid = false;
    } else {
      setFlagError('');
    }
    if (!description) {
      setDescriptionError('Please enter your first name');
      isFormValid = false;
    } else {
      setDescriptionError('');
    }
    if (!agree) {
      setAgreeError(true);
      isFormValid = false;
    } else {
      setAgreeError(false);
    }
    if (!isFormValid) return;

    setIsLoading(true);
    const payload = {
      descriptionOfEvent: description,
      desiredDateOfRaising: moment(raisingDate).format('YYYY-MM-DD'),
      email: email,
      firstName: firstName,
      flagBeingRaised: flag,
      lastName: lastName,
      middleName: middleName,
      numberOfAttendeesExpected: attendees,
      organizationName: userData?.organizationName,
      phoneNumber: phoneNumber,
      termsAgreed: agree,
      source: 'mobile',
      platform: Platform.OS,
    };

    apiHandler({
      endpoint: ENDPOINTS.createFlagRaisingReq,
      method: 'POST',
      payload,
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setIsLoading(false);

        dispatch(
          setShowToast({
            type: resp?.status
              ? AppStrings.ToastType.success
              : AppStrings.ToastType.error,
            message: resp?.status ? resp?.data?.message : getErrorMessage(resp),
          }),
        );
        if (resp?.status) {
          props?.navigation?.goBack();
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Submit Request'}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View style={{height: normalized(12)}} />
        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>First Name*</Text>
            <CustomInput
              placeholder={'Enter First Name'}
              value={firstName}
              isEditable={false}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Middle Name</Text>
            <CustomInput
              placeholder={'Enter Middle Name'}
              isEditable={false}
              value={middleName}
            />
          </View>
        </View>
        <View style={styles.Input_Row}>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Last Name*</Text>
            <CustomInput
              placeholder={'Enter Last Name'}
              value={lastName}
              isEditable={false}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Phone Number*</Text>
            <CustomInput
              placeholder={'XXX - XXX - XXXX'}
              maxLength={12}
              isEditable={false}
              value={phoneNumber}
            />
          </View>
        </View>

        <Text style={styles.Input_Heading}>Email*</Text>
        <CustomInput
          placeholder={'Enter Email'}
          isEditable={false}
          value={email}
        />

        <Text style={styles.Input_Heading}>Number of Attendees Expected*</Text>
        <CustomInput
          placeholder={'Enter Expected Attendeed'}
          keyboardType={'number-pad'}
          value={attendees}
          setValue={(val: any) => {
            setAttendees(allowOnlyNumbers(val));
            setAttendeesError('');
          }}
          errorMsg={attendeesError}
        />

        <Text style={styles.Input_Heading}>Flag To Be Raised*</Text>
        <CustomInput
          isMultiLine
          placeholder={'Enter Reason'}
          value={flag}
          setValue={(val: any) => {
            setFlag(val);
            setFlagError('');
          }}
          errorMsg={flagError}
        />

        <View style={{flex: 1}}>
          <Text style={styles.Input_Heading}>
            Desired Date Of Flag Raising*
          </Text>
          <DateTimeComp
            mode="date"
            dateValue={raisingDate}
            onDateChange={setRaisingDate}
            minimumDate={new Date()}
          />
        </View>

        <Text style={styles.Input_Heading}>Description*</Text>
        <CustomInput
          placeholder={'Add description Of Event'}
          value={description}
          setValue={(val: any) => {
            setDescription(val);
            setDescriptionError('');
          }}
          isMultiLine
          errorMsg={descriptionError}
        />

        <View
          style={[
            styles.checkboxCont,
            // { opacity: checkOpacity},
          ]}>
          <CustomCheckBox
            checked={agree}
            onChange={(val: any) => {
              setAgree(val);
              setAgreeError(false);
            }}
            isError={agreeError}
          />
          <Text style={styles.Desc_Txt_N}>{'  I agree to the '}</Text>
          {/* we are using parking permit terms and condition */}
          <Text
            onPress={() =>
              props?.navigation?.navigate(Routes.FlagRaising.TermsNCondition)
            }
            style={[styles.Desc_Txt_N, {color: colors.Primary}]}>
            Terms & Conditions
          </Text>
        </View>

        <View style={styles.submitBtnCont}>
          <CustomButton
            text={'Submit Request'}
            onPress={onSubmit}
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default FlagRaisingNewReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    checkboxCont: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: normalized(12),
    },
    submitBtnCont: {
      width: normalized(140),
      alignSelf: 'flex-end',
    },
  });
