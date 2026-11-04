import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import {
  AppFonts,
  FOIA_FORM_TYPES,
  FOIA_PAYMENT_LIST,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomInput from '../Components/CustomInput';
import {
  allowOnlyString,
  copyAttachmentToAppStorage,
  formatPhoneNumber,
  getErrorMessage,
  makeId,
} from '../../Utils/Helper';
import LocationIcon from '../Svg/LocationIcon';
import CustomDocumentPicker from '../Components/CustomDocumentPicker';
import CustomButton from '../Components/CustomButton';
import CustomSwitcher from '../Components/CustomSwitcher';
import CustomDropDownList from '../Components/CustomDropDownList';
import CustomCheckBox from '../Components/CustomCheckBox';
import YNComp from '../Components/YNComp';
import DateTimeComp from '../Components/DateTimeComp';
import moment from 'moment';
import {Routes} from '../../Utils/Routes';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setOfflineFoiaReq, setShowToast} from '../../Redux/AppReducers';
import {AppStrings, AsyncKeyStrings} from '../../Utils/AppStrings';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewMode,
  KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {useReCaptcha} from '../../../App';

const FOIANewReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  /////////////////////////////

  const [formTypeIndex, setFormTypeIndex] = useState(0);
  const [paymentTypeIndex, setPaymentTypeIndex] = useState(0);
  const dispatch = useDispatch();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const userData = selector?.residentUserData;

  //   ----------->>> values states
  const [firstName, setFirstName] = useState(userData?.firstName ?? '');
  const [middleName, setMiddleName] = useState(
    userData?.middleName ? userData?.middleName : userData ? ' ' : '',
  );
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [email, setEmail] = useState(userData?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? '');
  const [address, setAddress] = useState(userData?.address ?? '');
  const [addressCoords, setAddressCoords] = useState({});
  const [addressLine2, setAddressLine2] = useState(
    userData?.addressLine2 ?? '',
  );
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>('');
  const [policeCaseNumber, setPoliceCaseNumber] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [clientName, setClientname] = useState('');
  const [incidentDate, setincidentDate] = useState<Date | null>(new Date());
  const [incidentTime, setIncidentTime] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [other, setOther] = useState('');
  const isOnline = selector?.isNetConnected;

  //   --------->>>> Erros

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressLine2Error, setAddressLine2Error] = useState('');
  const [descError, setDescError] = useState('');
  const [fileError, setFileError] = useState(false);
  const [hasPoliceCase, setHasPoliceCaes] = useState('No');
  const [hasAttorney, setHasAttorney] = useState('No');
  const [policeCaseNumberError, setPoliceCaseNumberError] = useState('');
  const [officeNameError, setOfficeNameError] = useState('');
  const [clientNameError, setClientNameError] = useState('');
  const [otherError, setOtherError] = useState('');

  //   -------------->>>  Refs

  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const emailRef = useRef(null);
  const addressLine2Ref = useRef(null);
  const descRef = useRef(null);
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const [selectedInfo, setSelectedInfo] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(45);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);
  const isResidentLoggedIn = Boolean(selector?.residentUserData);
  const recaptchaRef = useReCaptcha();

  function simulateUpload(
    // setUploading: (u: boolean) => void,
    // setProgress: (p: number) => void,
    speedMs: number = 300,
    step: number = 0.05,
  ) {
    setUploading(true);
    setProgress(0);

    const id = setInterval(() => {
      setProgress((prev: any) => {
        const next = prev + step;
        if (next >= 1) {
          clearInterval(id);
          setUploading(false);
          return 1;
        }
        return next;
      });
    }, speedMs);
  }

  const toggleInfoSelection = (item: string) => {
    if (selectedInfo.includes(item)) {
      setSelectedInfo(prev => prev.filter(i => i !== item));
    } else {
      setSelectedInfo(prev => [...prev, item]);
    }
  };

  const informationArr = [
    'Police Report',
    '911 Calls',
    'CAD Report',
    'Body worn Camera Video',
    'Dash Cam Video',
    'Surveillance Video',
    'Photographs',
    'Other',
  ];

  const onSubmit = async () => {
    let isValid = true;
    setFirstNameError('');
    setMiddleNameError('');
    setLastNameError('');
    setEmailError('');
    setPhoneNumberError('');
    setAddressError('');
    setAddressLine2Error('');
    setDescError('');
    setFileError(false);

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    } else if (/\d/.test(firstName)) {
      setFirstNameError('First name cannot contain numbers');
      isValid = false;
    }

    if (middleName && /\d/.test(middleName)) {
      setMiddleNameError('Middle name cannot contain numbers');
      isValid = false;
    }

    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    } else if (/\d/.test(lastName)) {
      setLastNameError('Last name cannot contain numbers');
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      isValid = false;
    }

    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanedPhone) {
      setPhoneNumberError('Phone number is required');
      isValid = false;
    } else if (cleanedPhone.length !== 10) {
      setPhoneNumberError('Phone number must be 10 digits');
      isValid = false;
    }

    if (!address.trim()) {
      setAddressError('Address is required');
      isValid = false;
    }

    if (!description.trim()) {
      setDescError('Description is required');
      isValid = false;
    }

    if (formTypeIndex && hasPoliceCase == 'Yes') {
      if (!policeCaseNumber || policeCaseNumber?.length < 4) {
        isValid = false;
        setPoliceCaseNumberError('.');
      } else {
        setPoliceCaseNumberError('');
      }
    }
    if (formTypeIndex == 1 && hasAttorney == 'Yes') {
      if (!officeName) {
        isValid = false;
        setOfficeNameError('.');
      } else {
        setOfficeNameError('');
      }
      if (formTypeIndex == 1 && !clientName) {
        isValid = false;
        setClientNameError('.');
      }
    }

    if (formTypeIndex && selectedInfo?.includes(informationArr[7]) && !other) {
      isValid = false;
      setOtherError('..');
    }

    if (!isValid) {
      console.log('Form is invalid');
      return;
    }
    let copiedAttachment = null;

    if (file?.uri) {
      try {
        copiedAttachment = await copyAttachmentToAppStorage(file);
        setFile(copiedAttachment);
      } catch (copyErr) {
        console.log('Error copying attachment:', copyErr);
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'Unable to copy attachment to app storage.',
          }),
        );
        return;
      }
    }

    const payload: any = {
      formType: formTypeIndex ? 'publicSafetyRequest' : 'cityHallRequest',
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address,
      addressLine2,
      descriptionOfRequest: description,
      organizationName: userData?.organizationName ?? '',
      paymentMethod: FOIA_PAYMENT_LIST[paymentTypeIndex]?.name,
      attachments: copiedAttachment || null,
      id: selector?.offlineFoiaRequests?.length + 1,
    };

    if (formTypeIndex) {
      payload.incidentDate = moment(incidentDate).format('YYYY-MM-DD');
      payload.incidentTime = moment(incidentTime).format('hh:mm A');
      payload.officeName = officeName;
      payload.clientName = clientName;
      payload.policeCaseNumber =
        hasPoliceCase === 'Yes' ? policeCaseNumber : '';
      payload.policeReport = selectedInfo.includes(informationArr[0]);
      payload.calls911 = selectedInfo.includes(informationArr[1]);
      payload.cadReport = selectedInfo.includes(informationArr[2]);
      payload.bodyWornCamera = selectedInfo.includes(informationArr[3]);
      payload.dashCamVideo = selectedInfo.includes(informationArr[4]);
      payload.surveillanceVideo = selectedInfo.includes(informationArr[5]);
      payload.photographs = selectedInfo.includes(informationArr[6]);
      payload.other = selectedInfo.includes(informationArr[7]) ? other : '';
    }

    if (!isOnline) {
      const offflineData = [payload, ...selector?.offlineFoiaRequests];
      await setDataInAsync(AsyncKeyStrings.FoiaRequests, offflineData);
      dispatch(setOfflineFoiaReq(offflineData));
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
    formData.append(
      'formType',
      formTypeIndex ? 'publicSafetyRequest' : 'cityHallRequest',
    );
    formData.append('firstName', firstName);
    formData.append('middleName', middleName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('address', address);
    formData.append('addressLine2', addressLine2);
    formData.append('descriptionOfRequest', description);
    formData.append('organizationName', userData?.organizationName);
    formData.append('paymentMethod', FOIA_PAYMENT_LIST[paymentTypeIndex]?.name);
    if (file?.uri) {
      formData.append('attachments', {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name || file.filename || 'attachment',
      } as any);
    }
    if (formTypeIndex) {
      formData.append(
        'incidentDate',
        moment(incidentDate).format('YYYY-MM-DD'),
      );
      formData.append('incidentTime', moment(incidentTime).format('hh:mm A'));
      formData.append('officeName', officeName);
      formData.append('clientName', clientName);
      formData.append('policeReport', selectedInfo.includes(informationArr[0]));
      formData.append('calls911', selectedInfo.includes(informationArr[1]));
      formData.append('cadReport', selectedInfo.includes(informationArr[2]));
      formData.append(
        'policeCaseNumber',
        hasPoliceCase === 'Yes' ? policeCaseNumber : '',
      );
      formData.append('source', 'mobile');
      formData.append('platform', Platform.OS);
      formData.append(
        'bodyWornCamera',
        selectedInfo.includes(informationArr[3]),
      );
      formData.append('dashCamVideo', selectedInfo.includes(informationArr[4]));
      formData.append(
        'surveillanceVideo',
        selectedInfo.includes(informationArr[5]),
      );
      formData.append('photographs', selectedInfo.includes(informationArr[6]));
      formData.append(
        'other',
        selectedInfo.includes(informationArr[7]) ? other : '',
      );
    }
    const token = await recaptchaRef.current?.getToken('login');
    formData.append('recaptchToken', token);

    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.foiaSubmitRequest,
      method: 'POST',
      payload: formData,
      isFormData: true,
      useRecaptcha: true,
      recaptchaAction: 'login',
      ...(selector?.residentUserData && {
        authContext: 'RESIDENT',
      }),
      onComplete: async (resp: any) => {
        console.log('FOIA Response :', resp);
        console.log('FOIA Payload Response :', formData);
        if (resp?.status) {
          setIsLoading(false);
          if (resp?.data?.data?.otpRequired) {
            props?.navigation?.navigate(Routes.Auth.Otp, {
              isFoiaOtp: true,
              email: email,
            });
            return;
          }

          props?.navigation?.goBack();
          dispatch(
            setShowToast({
              message: resp?.data?.message,
              type: AppStrings.ToastType.success,
            }),
          );
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
        text={'Online FOIA Requests'}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <CustomSwitcher
          list={FOIA_FORM_TYPES}
          selectedIndex={formTypeIndex}
          onChange={i => setFormTypeIndex(i)}
        />

        {formTypeIndex == 1 && (
          <>
            <Text style={styles.Input_Heading}>
              Public Safety Department charges the following fees for Freedom of
              Information Requests:
            </Text>
            <Text style={styles.Input_Heading}>
              Documents - 50 cents per page;
            </Text>
            <Text style={styles.Input_Heading}>
              prepayment is required if total exceeds $10.00
            </Text>
            <Text style={styles.Input_Heading}>
              Body Worn Camera Video, Dash Cam Video, Surveillance Video -
              $15.00
            </Text>
            <Text style={styles.Input_Heading}>
              Photographs - $10.00 911 calls - $25.00
            </Text>
            <Text style={styles.Input_Heading}>Scanner Use Fee - $20.00</Text>
          </>
        )}
        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>First Name*</Text>
            <CustomInput
              placeholder={'Enter First Name'}
              value={firstName}
              isEditable={!isResidentLoggedIn}
              setValue={(val: any) => {
                setFirstName(allowOnlyString(val));
                setFirstNameError('');
              }}
              errorMsg={firstNameError}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text style={styles.Input_Heading}>Middle Name</Text>
            <CustomInput
              placeholder={'Enter Middle Name'}
              value={middleName}
              setValue={(val: any) => {
                setMiddleName(allowOnlyString(val));
                setMiddleNameError('');
              }}
              isEditable={!isResidentLoggedIn}
              errorMsg={middleNameError}
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
              setValue={(val: any) => {
                setLastName(allowOnlyString(val));
                setLastNameError('');
              }}
              isEditable={!isResidentLoggedIn}
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
              keyboardType={'number-pad'}
              value={phoneNumber}
              setValue={(phone: any) => {
                setPhoneNumber(formatPhoneNumber(phone));
                setPhoneNumberError('');
              }}
              isEditable={!isResidentLoggedIn}
              errorMsg={phoneNumberError}
            />
          </View>
        </View>
        <View style={{}}>
          <Text style={styles.Input_Heading}>Email*</Text>
          <CustomInput
            placeholder={'Enter Email'}
            keyboardType={'email-address'}
            value={email}
            setValue={(val: any) => {
              setEmail(val);
              setEmailError('');
            }}
            isEditable={!isResidentLoggedIn}
            errorMsg={emailError}
          />
        </View>
        <View
          style={{
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Address*</Text>
          {isOnline ? (
            <TouchableOpacity
              disabled={isResidentLoggedIn}
              activeOpacity={1}
              onPress={async () => {
                props?.navigation?.navigate(Routes.MapScreen, {
                  onChooseLocation: (loc: any) => {
                    setAddress(loc?.address);
                    setAddressCoords(loc?.location);
                    setAddressError('');
                  },
                });
              }}
              style={[
                styles.addressBox,
                {
                  backgroundColor: addressError
                    ? colors.redLight
                    : colors.Background,
                  borderColor: addressError ? colors.Error : colors.BorderColor,
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
                    color: addressError
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
          ) : (
            <CustomInput
              placeholder={'Type Address'}
              value={address}
              setValue={(val: any) => {
                setAddress(val);
                setAddressError('');
              }}
              isEditable={!isResidentLoggedIn}
              errorMsg={addressError}
            />
          )}
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Address Line 2</Text>
          <CustomInput
            placeholder={'123'}
            value={addressLine2}
            isEditable={!isResidentLoggedIn}
            setValue={(val: any) => {
              setAddressLine2(val);
              setAddressLine2Error('');
            }}
            errorMsg={addressLine2Error}
          />
        </View>

        {formTypeIndex == 1 && (
          <>
            <Text style={styles.Input_Heading}>Communication</Text>

            <FlatList
              data={informationArr}
              keyExtractor={(item, index) => `${item}-${index}`}
              numColumns={2}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              renderItem={({item}) => {
                const isSelected = selectedInfo.includes(item);
                return (
                  <View style={styles.infoItem}>
                    <CustomCheckBox
                      checked={isSelected}
                      onChange={() => toggleInfoSelection(item)}
                    />
                    <Text style={styles.checkboxTxt}>{item}</Text>
                  </View>
                );
              }}
            />

            {selectedInfo.includes('Other') && (
              <>
                <Text style={styles.Input_Heading}>Other</Text>
                <CustomInput
                  // onSubmitEditing={() => focusNextField(descRef)}
                  placeholder={'Enter Other'}
                  value={other}
                  setValue={(val: string) => {
                    setOther(val);
                    setOtherError('');
                  }}
                  errorMsg={otherError}
                />
              </>
            )}

            <View style={{height: normalized(5)}} />
            <Text style={styles.Input_Heading}>Police Case Number</Text>
            <YNComp
              selectedValue={hasPoliceCase}
              options={['Yes', 'No']}
              onSelect={(val: any) => {
                setPoliceCaseNumberError('');
                setHasPoliceCaes(val);
              }}
            />

            {hasPoliceCase == 'Yes' && (
              <>
                <Text style={styles.Input_Heading}>Police Case Number*</Text>
                <CustomInput
                  // onSubmitEditing={() => focusNextField(descRef)}
                  placeholder={'Police Case Number'}
                  value={policeCaseNumber}
                  keyboardType={'number-pad'}
                  setValue={(val: string) => {
                    const cleaned = val.replace(/[^0-9]/g, '');
                    let formatted = cleaned;
                    if (cleaned.length > 2) {
                      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
                    }

                    setPoliceCaseNumber(formatted);
                    setPoliceCaseNumberError('');
                  }}
                  errorMsg={policeCaseNumberError}
                />
              </>
            )}

            <Text style={styles.Input_Heading}>Has Attorney Office</Text>

            <YNComp
              selectedValue={hasAttorney}
              options={['Yes', 'No']}
              onSelect={val => {
                setHasAttorney(val);
                setOfficeNameError('');
                setClientNameError('');
              }}
            />

            {hasAttorney == 'Yes' && (
              <>
                <Text style={styles.Input_Heading}>Office Name*</Text>
                <CustomInput
                  placeholder={'Enter Office Name'}
                  value={officeName}
                  setValue={(val: string) => {
                    setOfficeName(val);
                    setOfficeNameError('');
                  }}
                  errorMsg={officeNameError}
                />

                <Text style={styles.Input_Heading}>Client Name*</Text>
                <CustomInput
                  placeholder={'Enter Client Name'}
                  value={clientName}
                  setValue={(val: any) => {
                    setClientname(val);
                    setClientNameError('');
                  }}
                  errorMsg={clientNameError}
                />
              </>
            )}

            <View style={styles.Input_Row}>
              <View style={{flex: 1}}>
                <Text style={styles.Input_Heading}>Incident Date*</Text>
                <DateTimeComp
                  mode="date"
                  dateValue={incidentDate}
                  onDateChange={setincidentDate}
                  maximumDate={new Date()}
                />
              </View>
              <View
                style={{
                  flex: 1,
                }}>
                <Text style={styles.Input_Heading}>Incident Time*</Text>
                <DateTimeComp
                  mode="time"
                  timeValue={incidentTime}
                  onTimeChange={setIncidentTime}
                  onDateChange={setIncidentTime}
                  maximumDate={new Date()}
                />
              </View>
            </View>
          </>
        )}
        <View
          style={{
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Description*</Text>
          <CustomInput
            placeholder={'Add Description of Request'}
            value={description}
            setValue={(val: any) => {
              setDescription(val);
              setDescError('');
            }}
            isMultiLine={true}
            errorMsg={descError}
          />
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Upload Documents</Text>
          <CustomDocumentPicker
            uploading={uploading}
            progress={progress}
            type={'file'}
            limit={1}
            onSelect={(obj: any) => {
              const data = obj?.[0];

              setFileError(false);

              if (!data?.uri) {
                setFile(null);
                return;
              }

              setFile({
                uri: data.uri,
                type: data.type || 'application/octet-stream',
                name: data.name || data.filename || 'attachment',
                filename: data.filename || data.name || 'attachment',
              });
            }}
            isError={fileError}
          />
        </View>
        <View style={{height: normalized(10)}} />
        <Text style={styles.Input_Heading}>Payment Method</Text>
        <CustomDropDownList
          parentScrollRef={scrollRef}
          list={FOIA_PAYMENT_LIST.map(o => o.name)}
          selectedIndex={paymentTypeIndex}
          onChange={i => setPaymentTypeIndex(i)}
        />

        <View style={styles.submitBtnCont}>
          <CustomButton
            text={'Submit Request'}
            onPress={() => {
              onSubmit();
            }}
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default FOIANewReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    submitBtnCont: {
      width: normalized(140),
      alignSelf: 'flex-end',
    },
    detailTxt: {
      color: '#2E2F30',
      fontSize: normalized(18),
      fontFamily: AppFonts.InterRegular,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginTop: normalized(5),
      flex: 1,
    },
    checkboxTxt: {
      color: '#595D62',
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
