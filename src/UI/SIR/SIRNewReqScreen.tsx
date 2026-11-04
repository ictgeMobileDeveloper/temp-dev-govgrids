import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {
  isAndroid15Plus,
  isSmallDevice,
  normalized,
  ScreenProps,
  SIR_INCIDENT_TYPE_LIST,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import CustomInput from '../Components/CustomInput';
import {
  allowOnlyString,
  base64ToPng,
  copyAttachmentToAppStorage,
  formatPhoneNumber,
  getErrorMessage,
  makeId,
  useGradualAnimation,
} from '../../Utils/Helper';
import CustomButton from '../Components/CustomButton';
import SignatureScreen from '../ParkingPermit/SignatureScreen';
import CustomDropDownList from '../Components/CustomDropDownList';
import DateTimeComp from '../Components/DateTimeComp';
import moment from 'moment';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {
  setOfflineFoiaReq,
  setofflineSIRReq,
  setShowToast,
} from '../../Redux/AppReducers';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import {Routes} from '../../Utils/Routes';

const SIRNewReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = selector.themeColors;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const userData = selector?.SIRUserData;
  const dispatch = useDispatch();
  const isOnline = selector?.isNetConnected;

  //   ----------->>> values states
  const [firstName, setFirstName] = useState(userData?.firstName ?? '');
  const [middleName, setMiddleName] = useState(
    userData?.middleName ? userData?.middleName : '',
  );
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [email, setEmail] = useState(userData?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? '');
  const [incidentIndex, setIncidentIndex] = useState<any>(null);
  const [reportedDate, setReportedDate] = useState<Date | undefined>();
  const [reportedTime, setReportedTime] = useState(null);
  const [occuredDate, setOccuredDate] = useState<Date | undefined>();
  const [occuredTime, setOccuredTime] = useState(null);
  const [complaint, setComplaint] = useState('');
  const [respondingOfficer, setRespondingOfficer] = useState('');
  const [witness, setWitness] = useState('');
  const [suspect, setSuspect] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [signature, setSignature] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otherIncident, setOtherIncident] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');

  //   --------->>>> Erros

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [incidentError, setIncidentError] = useState(false);
  const [repDateError, setRepDateError] = useState('');
  const [repTimeError, setRepTimeError] = useState('');
  const [occDateError, setOccDateError] = useState('');
  const [occTimeError, setOccTimeError] = useState('');
  const [complaintError, setComplaintError] = useState('');
  const [respOfficerError, setRespOfficerError] = useState('');
  const [witnessError, setWitnessError] = useState('');
  const [suspectError, setSuspectError] = useState('');
  const [caseDetailsError, setCaseDetailsError] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [otherIncidentError, setOtherIncidentError] = useState('');
  const [plateError, setPlateError] = useState('');
  const [modelError, setModelError] = useState('');
  const isLoggedIn = Boolean(selector?.SIRUserData?.id);
  const onSubmit = async () => {
    let isValid = true;

    if (!firstName) {
      setFirstNameError('...');
      isValid = false;
    }
    if (!lastName) {
      setLastNameError('...');
      isValid = false;
    }
    if (!phoneNumber || phoneNumber?.length < 12) {
      setPhoneNumberError('...');
      isValid = false;
    }
    if (!email) {
      setEmailError('...');
      isValid = false;
    }
    if (incidentIndex == null) {
      setIncidentError(true);
      isValid = false;
    }
    if (SIR_INCIDENT_TYPE_LIST[incidentIndex]?.name == 'Other') {
      isValid = false;
      setOtherIncidentError('...');
    }
    if (SIR_INCIDENT_TYPE_LIST[incidentIndex]?.key == 'vehicleLeftOverNight') {
      if (!plate) {
        setPlateError('...');
        isValid = false;
      }
      if (!model) {
        setModelError('...');
        isValid = false;
      }
    }
    if (reportedDate == null) {
      setRepDateError('...');
      isValid = false;
    }
    if (reportedTime == null) {
      setRepTimeError('... ');
      isValid = false;
    }
    if (occuredDate == null) {
      setOccDateError('...');
      isValid = false;
    }
    if (occuredTime == null) {
      setOccTimeError('...');
      isValid = false;
    }
    if (!complaint) {
      setComplaintError('..');
      isValid = false;
    }
    if (!respondingOfficer) {
      setRespOfficerError('..');
      isValid = false;
    }
    if (!witness) {
      setWitnessError('...');
      isValid = false;
    }
    if (!suspect) {
      setSuspectError('...');
      isValid = false;
    }
    if (!caseDetails) {
      setCaseDetailsError('...');
      isValid = false;
    }
    if (!signature) {
      setSignatureError('...');
      isValid = false;
    }
    if (!isValid) return;

    let copiedAttachment = signature;
    try {
      copiedAttachment = await copyAttachmentToAppStorage(signature);
      setSignature(copiedAttachment);
    } catch (copyErr) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Unable to copy attachment to app storage.',
        }),
      );
      return;
    }
    const payload = {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address: '',
      incidentType: SIR_INCIDENT_TYPE_LIST[incidentIndex]?.key,
      dateReported: moment(reportedDate)?.format('YYYY-MM-DD'),
      timeReported: moment(reportedTime)?.format('hh:MM A'),
      dateOccurred: moment(occuredDate)?.format('YYYY-MM-DD'),
      timeOccurred: moment(occuredTime)?.format('hh:MM A'),
      complainant: complaint,
      respondingOfficer,
      plateNumber: plate,
      makeModel: model,
      witness,
      suspect,
      caseDetails,
      securityGuardSignature: signature,
      otherTypeOfIncident: otherIncident,
    };

    if (!isOnline) {
      const sirData = [payload, ...(selector?.offlineSIRRequests ?? [])];
      await setDataInAsync(AsyncKeyStrings.SirRequests, sirData);
      dispatch(setofflineSIRReq(sirData));
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: 'Request Saved.',
        }),
      );
      props?.navigation?.goBack();
      return;
    }

    const formData = new FormData();

    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('address', userData?.address);
    formData.append('incidentType', SIR_INCIDENT_TYPE_LIST[incidentIndex]?.key);
    formData.append('dateReported', moment(reportedDate)?.format('YYYY-MM-DD'));
    formData.append('timeReported', moment(reportedTime)?.format('hh:MM A'));
    formData.append('dateOccurred', moment(occuredDate)?.format('YYYY-MM-DD'));
    formData.append('timeOccurred', moment(occuredTime)?.format('hh:MM A'));
    formData.append('complainant', complaint);
    formData.append('respondingOfficer', respondingOfficer);
    formData.append('plateNumber', plate);
    formData.append('makeModel', model);
    formData.append('witness', witness);
    formData.append('suspect', suspect);
    formData.append('caseDetails', caseDetails);
    formData.append('securityGuardSignature', signature);
    formData.append('otherTypeOfIncident', otherIncident);

    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.makeSirReport,
      method: 'POST',
      isFormData: true,
      payload: formData,
      useRecaptcha: true,
      recaptchaAction: 'login',
      authContext: 'SIR',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setIsLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.data?.message,
            }),
          );
          props?.navigation?.goBack();
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
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Submit New Request'}
        onOfflinePress={
          !isOnline
            ? () => props?.navigation?.navigate(Routes.SIR.OfflineReqScreen)
            : undefined
        }
      />
      <KeyboardAvoidingView
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? isSmallDevice
              ? normalized(20)
              : normalized(0)
            : -5
        }
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: normalized(20),
            paddingBottom: normalized(30),
          }}>
          <View style={{height: normalized(10)}} />
          <View style={styles.Input_Row}>
            <View style={{flex: 1}}>
              <Text style={styles.Input_Heading}>First Name*</Text>
              <CustomInput
                placeholder={'Enter Name'}
                value={firstName}
                setValue={(val: any) => {
                  setFirstName(allowOnlyString(val));
                  setFirstNameError('');
                }}
                isEditable={!isLoggedIn}
                errorMsg={firstNameError}
              />
            </View>
            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Middle Name</Text>
              <CustomInput
                placeholder={'Enter Name'}
                value={middleName}
                setValue={(val: any) => {
                  setMiddleName(allowOnlyString(val));
                }}
                isEditable={!isLoggedIn}
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
                placeholder={'Enter Name'}
                value={lastName}
                setValue={(val: any) => {
                  setLastName(allowOnlyString(val));
                  setLastNameError('');
                }}
                isEditable={!isLoggedIn}
                errorMsg={lastNameError}
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
                value={phoneNumber}
                keyboardType={'number-pad'}
                setValue={(phone: any) => {
                  setPhoneNumber(formatPhoneNumber(phone));
                  setPhoneNumberError('');
                }}
                isEditable={!isLoggedIn}
                errorMsg={phoneNumberError}
              />
            </View>
          </View>

          <Text style={styles.Input_Heading}>Email*</Text>
          <CustomInput
            placeholder={'Enter Email'}
            value={email}
            setValue={(val: any) => {
              setEmail(val);
              setEmailError('');
            }}
            isEditable={!isLoggedIn}
            errorMsg={emailError}
          />

          <Text style={styles.Input_Heading}>Incident Type*</Text>
          <View>
            <CustomDropDownList
              list={SIR_INCIDENT_TYPE_LIST.map(o => o.name)}
              selectedIndex={incidentIndex}
              onChange={i => {
                setIncidentIndex(i);
                setIncidentError(false);
              }}
              placeholder="Select Incident Type"
              error={incidentError}
            />
          </View>

          {SIR_INCIDENT_TYPE_LIST[incidentIndex]?.name == 'Other' && (
            <>
              <Text style={styles.Input_Heading}>Other Type of Incident*</Text>
              <CustomInput
                placeholder={'Enter Other Type of Incident'}
                value={otherIncident}
                setValue={(val: any) => {
                  setOtherIncident(val);
                  setOtherIncidentError('');
                }}
                errorMsg={otherIncidentError}
              />
            </>
          )}

          {SIR_INCIDENT_TYPE_LIST[incidentIndex]?.key ==
            'vehicleLeftOverNight' && (
            <>
              <Text style={styles.Input_Heading}>Plate Number*</Text>
              <CustomInput
                placeholder={'Enter Plate Number'}
                value={plate}
                setValue={(val: any) => {
                  setPlate(val);
                  setPlateError('');
                }}
                errorMsg={plateError}
              />

              <Text style={styles.Input_Heading}>Make/Model*</Text>
              <CustomInput
                placeholder={'Enter Make/Model'}
                value={model}
                setValue={(val: any) => {
                  setModel(val);
                  setModelError('');
                }}
                errorMsg={modelError}
              />
            </>
          )}

          <View style={styles.Input_Row}>
            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Date Reported*</Text>
              <DateTimeComp
                mode="date"
                dateValue={reportedDate}
                onDateChange={(val: any) => {
                  setReportedDate(val);
                  setRepDateError('');
                }}
                minimumDate={occuredDate}
                maximumDate={new Date()}
                errorMsg={repDateError}
              />
            </View>
            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Time Reported*</Text>
              <DateTimeComp
                mode="time"
                timeValue={reportedTime}
                onTimeChange={(val: any) => {
                  setReportedTime(val);
                  setRepTimeError('');
                }}
                maximumDate={new Date()}
                errorMsg={repTimeError}
              />
            </View>
          </View>

          <View style={styles.Input_Row}>
            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Date Occurred*</Text>
              <DateTimeComp
                mode="date"
                dateValue={occuredDate}
                onDateChange={(val: any) => {
                  setOccuredDate(val);
                  setOccDateError('');
                }}
                maximumDate={reportedDate}
                errorMsg={occDateError}
              />
            </View>

            <View
              style={{
                flex: 1,
              }}>
              <Text style={styles.Input_Heading}>Time Occurred*</Text>
              <DateTimeComp
                mode="time"
                timeValue={occuredTime}
                onTimeChange={(val: any) => {
                  setOccuredTime(val);
                  setOccTimeError('');
                }}
                maximumDate={new Date()}
                errorMsg={occTimeError}
              />
            </View>
          </View>

          <Text style={styles.Input_Heading}>Complaint*</Text>
          <CustomInput
            placeholder={'Enter Complaint'}
            value={complaint}
            setValue={(val: any) => {
              setComplaint(val);
              setComplaintError('');
            }}
            errorMsg={complaintError}
          />

          <Text style={styles.Input_Heading}>Responding Officer*</Text>
          <CustomInput
            placeholder={'Enter Name'}
            value={respondingOfficer}
            setValue={(val: any) => {
              setRespondingOfficer(val);
              setRespOfficerError('');
            }}
            errorMsg={respOfficerError}
          />

          <Text style={styles.Input_Heading}>Witness*</Text>
          <CustomInput
            placeholder={'Enter Wintess'}
            value={witness}
            setValue={(val: any) => {
              setWitness(val);
              setWitnessError('');
            }}
            errorMsg={witnessError}
          />

          <Text style={styles.Input_Heading}>Suspect*</Text>
          <CustomInput
            placeholder={'Enter Name'}
            value={suspect}
            setValue={(val: any) => {
              setSuspect(val);
              setSuspectError('');
            }}
            errorMsg={suspectError}
          />

          <Text style={styles.Input_Heading}>Case Details*</Text>
          <CustomInput
            placeholder={'Add Details'}
            value={caseDetails}
            setValue={(val: any) => {
              setCaseDetails(val);
              setCaseDetailsError('');
            }}
            isMultiLine
            errorMsg={caseDetailsError}
          />

          <Text style={styles.Input_Heading}>Signature*</Text>
          <SignatureScreen
            onSignatureAdded={async (dataUrl: any) => {
              const fileUri = await base64ToPng(dataUrl);
              const filename =
                makeId(6) + fileUri.substring(fileUri.lastIndexOf('/') + 1);
              const fileType = filename?.split('.').pop();
              setSignature({
                uri: fileUri,
                type: `image/${fileType}`,
                name: filename || `photo.${fileType}`,
              });
              setSignatureError('');
            }}
            isError={signatureError}
          />

          <View style={styles.submitBtnCont}>
            <CustomButton
              text={'Submit Request'}
              onPress={onSubmit}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isAndroid15Plus && (
        <Animated.View
          style={[
            keyboardPaddingBottom,
            {
              backgroundColor: 'transparent',
            },
          ]}
        />
      )}
    </View>
  );
};

export default SIRNewReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    submitBtnCont: {
      width: normalized(130),
      alignSelf: 'flex-end',
      marginBottom: normalized(40),
    },
  });
