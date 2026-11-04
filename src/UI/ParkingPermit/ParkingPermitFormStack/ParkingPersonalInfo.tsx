import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  isAndroid15Plus,
  isSmallDevice,
  normalized,
  P_Company_STEPPER_LIST,
  PP_STEPPER_LIST,
  ScreenProps,
} from '../../../Utils/AppConstants';
import Stepper from '../../Components/Stepper';
import CustomInput from '../../Components/CustomInput';
import {
  allowOnlyString,
  formatCaseNo,
  formatPhoneNumber,
  isEmailValid,
  useGradualAnimation,
} from '../../../Utils/Helper';
import DateTimeComp from '../../Components/DateTimeComp';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import moment from 'moment';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import LocationIcon from '../../Svg/LocationIcon';

import {
  clearParkingPermitDraft,
  updateParkingPermitDraft,
} from '../../../Redux/AppReducers';

import CustomGooglePlacesInput from '../../Components/CustomGooglePlacesInput';
import {PLACE_API_KEY, SECRET_KEYS} from '../../../Network/Urls';

const PPPersonalInfoScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();

  const userData = selector?.residentUserData;

  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(45);
  const LINE_HEIGHT = normalized(18);

  const [firstName, setFirstName] = useState(userData?.firstName ?? '');
  const [middleName, setMiddleName] = useState(
    userData?.middleName ? userData?.middleName : '',
  );
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [email, setEmail] = useState(userData?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber ?? '');
  const [address, setAddress] = useState<any>(userData?.address ?? '');

  const [firstNameError, setFirstNameError] = useState('');
  const [middleNameError, setMiddleNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [addressError, setAddressError] = useState('');

  const baseData = selector?.baseData;
  const [addressLines, setAddressLines] = useState<number>(1);
  const item = props?.route?.params?.site;
  const isCompany = props?.route?.params?.isCompany ?? false;
  console.log('site', item);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', e => {
      const actionType = e.data.action.type;

      if (
        actionType === 'GO_BACK' ||
        actionType === 'POP' ||
        actionType === 'POP_TO_TOP'
      ) {
        dispatch(clearParkingPermitDraft());
      }
    });

    return unsubscribe;
  }, [props.navigation, dispatch]);
  const onNext = () => {
    let isValid = true;

    if (!firstName.trim()) {
      setFirstNameError('First name is required');
      isValid = false;
    }
    if (!lastName.trim()) {
      setLastNameError('Last name is required');
      isValid = false;
    }
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isEmailValid(email)) {
      setEmailError('Enter a valid email address');
      isValid = false;
    }
    if (!phoneNumber.trim()) {
      setPhoneNumberError('Phone number is required');
      isValid = false;
    }
    if (!address.trim()) {
      setAddressError('Address is required');
      isValid = false;
    }

    if (!isValid) return;

    const applicant = {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address: userData?.address ?? address,
    };

    dispatch(updateParkingPermitDraft(applicant));

    if (userData) {
      if (isCompany) {
        props?.navigation?.navigate(Routes.ParkingPermit.CompanyForm);
      } else {
        props?.navigation?.navigate(Routes.ParkingPermit.PermitDetail);
      }
    } else {
      props?.navigation?.navigate(Routes.ParkingPermit.PermitDetail, {
        item: applicant,
      });
    }
  };
  const {height} = useGradualAnimation();

  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  return (
    <View style={styles.container}>
      <Stepper
        list={isCompany ? P_Company_STEPPER_LIST : PP_STEPPER_LIST}
        completedSteps={[]}
        activeStep={isCompany ? P_Company_STEPPER_LIST[0] : PP_STEPPER_LIST[0]}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View style={{height: normalized(10)}} />
        <View style={styles.Input_Row}>
          <View style={{flex: 1}}>
            <Text style={styles.Input_Heading}>First Name*</Text>
            <CustomInput
              placeholder={'Enter Name'}
              value={firstName}
              isEditable={!userData}
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
              placeholder={'Enter Name'}
              value={middleName}
              setValue={(val: any) => {
                setMiddleName(allowOnlyString(val));
                setMiddleNameError('');
              }}
              isEditable={!userData}
              errorMsg={middleNameError}
            />
          </View>
        </View>

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
            isEditable={!userData}
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
            isEditable={!userData}
            value={formatPhoneNumber(phoneNumber)}
            setValue={(val: any) => {
              setPhoneNumber(val);
              setPhoneNumberError('');
            }}
            errorMsg={phoneNumberError}
          />
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Text style={styles.Input_Heading}>Address*</Text>
          {userData ? (
            <TouchableOpacity
              activeOpacity={1}
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
                onTextLayout={e => {
                  const lines = e.nativeEvent.lines?.length ?? 1;
                  setAddressLines(Math.max(1, Math.min(MAX_LINES, lines)));
                }}
                style={[
                  styles.Desc_Txt,
                  {
                    flex: 1,
                    textAlign: 'left',
                    color: colors.Heading_Txt,
                    lineHeight: LINE_HEIGHT,
                    fontSize: normalized(14),
                  },
                ]}>
                {userData?.address}
              </Text>
              <LocationIcon primary={colors.Desc_Txt} />
            </TouchableOpacity>
          ) : (
            <CustomGooglePlacesInput
              apiKey={PLACE_API_KEY}
              countryRestriction={baseData?.countryCode?.toLowerCase()}
              restrictToCity
              allowedCity={baseData?.city}
              country={baseData?.country}
              onPlaceSelected={(p: any) => {
                setAddress(
                  p.address ?? p.formattedAddress ?? p.description ?? '',
                );
                setAddressError('');
              }}
              error={!!addressError}
              debounceMs={800}
              minLength={2}
              maxResults={6}
            />
          )}
        </View>

        <Text style={styles.Input_Heading}>Email*</Text>
        <CustomInput
          placeholder={'Enter Email'}
          value={email}
          setValue={(val: any) => {
            setEmail(val);
            setEmailError('');
          }}
          isEditable={!userData}
          errorMsg={emailError}
        />

        <View style={styles.submitBtnCont}>
          <CustomButton text={'Next'} onPress={onNext} loading={false} />
        </View>
      </KeyboardAwareScrollView>
      {isAndroid15Plus && (
        <Animated.View
          style={[keyboardPaddingBottom, {backgroundColor: 'transparent'}]}
        />
      )}
    </View>
  );
};

export default PPPersonalInfoScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },

    submitBtnCont: {
      width: normalized(120),
      alignSelf: 'flex-end',
    },
  });
