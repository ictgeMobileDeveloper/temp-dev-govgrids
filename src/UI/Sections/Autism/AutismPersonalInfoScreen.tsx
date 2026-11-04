import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useRef, useState, useEffect} from 'react';
import {normalized, ScreenProps} from '../../../Utils/AppConstants';
import {useSelector, useDispatch} from 'react-redux';
import {updateAutismDraft, clearAutismDraft} from '../../../Redux/AppReducers';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import Stepper from '../../Components/Stepper';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import CustomInput from '../../Components/CustomInput';
import DateTimeComp from '../../Components/DateTimeComp';
import YNComp from '../../Components/YNComp';
import LocationIcon from '../../Svg/LocationIcon';
import {
  allowOnlyString,
  extractNumbers,
  formatPhoneNumber,
} from '../../../Utils/Helper';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {notifyAuthTokenChanged} from '../../../Network/Services/AuthTokenService';

const AutismPersonalInfoScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.autismDraft ?? {};

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('beforeRemove', e => {
      const actionType = e.data.action.type;

      if (
        actionType === 'GO_BACK' ||
        actionType === 'POP' ||
        actionType === 'POP_TO_TOP'
      ) {
        dispatch(clearAutismDraft());
      }
    });

    return unsubscribe;
  }, [props.navigation, dispatch]);

  const scrollRef = useRef(null);
  const isRight = selector?.language == 'ar';
  I18n.locale = selector?.language;
  I18n.fallbacks = true;
  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };
  const isOnline = selector?.isNetConnected;

  const [firstName, setFirstName] = useState(draft.firstName ?? '');
  const [middleName, setMiddleName] = useState(draft.middleName ?? '');
  const [lastName, setLastName] = useState(draft.lastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(new Date());
  const [age, setAge] = useState(draft.age ?? '');
  const [gender, setGender] = useState(draft.gender ?? I18n.t('MALE'));
  const [otherGender, setOtherGender] = useState(draft.otherGender ?? '');
  const [heightInches, setHeightInches] = useState(draft.heightInches ?? '');
  const [heightFeet, setHeightFeet] = useState(draft.heightFeet ?? '');
  const [race, setRace] = useState(draft.race ?? '');
  const [weightLbs, setWeightLbs] = useState(draft.weightLbs ?? '');
  const [eyeColor, setEyeColor] = useState(draft.eyeColor ?? '');
  const [hairColor, setHairColor] = useState(draft.hairColor ?? '');
  const [phoneNumber, setPhoneNumber] = useState(draft.phoneNumber ?? '');
  const [address, setAddress] = useState(draft.address ?? '');
  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(45);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [heightFeetError, setHeightFeetError] = useState('');
  const [heightInchesError, setHeightInchesError] = useState('');
  const [raceError, setRaceError] = useState('');
  const [weightLbsError, setWeightLbsError] = useState('');
  const [eyeColorError, setEyeColorError] = useState(false);
  const [hairColorError, setHairColorError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [otherGenderError, setOtherGenderError] = useState('');

  const nickNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const weightLbsRef = useRef(null);
  const eyeColorRef = useRef(null);
  const hairColorRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const wornItemsRef = useRef(null);
  const IdenfifyMarksRef = useRef(null);
  const medicationRef = useRef(null);
  const serviceConnectionRef = useRef(null);
  const otherMedicalInfoRef = useRef(null);

  // ---------------------
  useEffect(() => {
    dispatch(
      updateAutismDraft({
        firstName,
        middleName,
        lastName,
        age,
        gender,
        otherGender,
        address,
        heightInches,
        heightFeet,
        race,
        weightLbs,
        eyeColor,
        hairColor,
        phoneNumber,
        isOnline,
      }),
    );
  }, [
    firstName,
    middleName,
    lastName,
    age,
    gender,
    otherGender,
    address,
    heightInches,
    heightFeet,
    race,
    weightLbs,
    eyeColor,
    hairColor,
    phoneNumber,
    isOnline,
    dispatch,
  ]);

  const focusNextField = (inputRef: any) => {
    if (inputRef?.current) {
      inputRef?.current?.focus();
    }
  };

  const setInchesValue = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (digits === '') {
      setHeightInches('');
      setHeightInchesError('');
      return;
    }
    const num = parseInt(digits.replace(/^0+/, '') || '0', 10);
    if (num >= 1 && num <= 11) {
      setHeightInches(String(num));
      setHeightInchesError('');
    } else {
      setHeightInchesError('Please enter a number between 1 and 11');
    }
    setHeightInchesError('');
  };

  const onNext = async () => {
    let isFormValid = true;
    if (!firstName) {
      setFirstNameError('...');
      isFormValid = false;
    }
    if (!lastName) {
      setLastNameError('...');
      isFormValid = false;
    }
    if (!age || age == '-') {
      setDateOfBirthError('...');
      isFormValid = false;
    }
    if (!heightFeet) {
      setHeightFeetError('...');
      isFormValid = false;
    }
    if (!heightInches) {
      setHeightInchesError('...');
      isFormValid = false;
    }
    if (!race) {
      setRaceError('...');
      isFormValid = false;
    }
    if (!weightLbs) {
      setWeightLbsError('...');
      isFormValid = false;
    }
    if (!eyeColor) {
      setEyeColorError(true);
      isFormValid = false;
    }
    if (!hairColor) {
      setHairColorError(true);
      isFormValid = false;
    }
    if (!phoneNumber || phoneNumber?.length < 12) {
      setPhoneNumberError('...');
      isFormValid = false;
    }
    if (!address) {
      setAddressError('...');
      isFormValid = false;
    }

    if (gender == I18n.t('OTHER') && !otherGender) {
      setOtherGenderError('...');
      isFormValid = false;
    }
    if (!isFormValid) return;
    const data = {
      firstName,
      middleName,
      lastName,
      dateOfBirth: moment(dateOfBirth).format('YYYY-MM-DD'),
      age,
      gender,
      otherGender,
      address,
      heightInches,
      heightFeet,
      race,
      weightLbs,
      eyeColor,
      hairColor,
      phoneNumber,
      isOnline: isOnline,
    };
    props?.navigation?.navigate(Routes.AutismSafety.RequiredDataScreen, {
      data: {
        ...(selector?.autismDraft ?? {}),
        ...data,
      },
    });
  };

  const translatedStepperList = useMemo(() => {
    const order: string[] = I18n.t('AUTISM_STEPPER.ORDER') || [];
    return order.map(key => I18n.t(`AUTISM_STEPPER.${key}`));
  }, [selector?.language]);

  return (
    <View style={{backgroundColor: colors.Background, flex: 1}}>
      <Stepper
        list={translatedStepperList}
        completedSteps={[]}
        activeStep={translatedStepperList[0]}
        isRight={isRight}
      />
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(12),
        }}>
        <View
          style={[
            styles.Input_Row,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <View style={{flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_FIRST_NAME')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={I18n.t('ENTER_NAME')}
              value={firstName}
              setValue={(val: any) => {
                setFirstName(allowOnlyString(val));
                setFirstNameError('');
              }}
              errorMsg={firstNameError}
              isRight={isRight}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_MIDDLE_NAME')}
            </Text>
            <CustomInput
              placeholder={I18n.t('ENTER_NAME')}
              value={middleName}
              setValue={(val: any) => {
                setMiddleName(allowOnlyString(val));
              }}
              errorMsg={''}
              isRight={isRight}
            />
          </View>
        </View>
        <View
          style={[
            styles.Input_Row,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <View
            style={{
              flex: 1,
            }}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_LAST_NAME')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>

            <CustomInput
              placeholder={I18n.t('ENTER_NAME')}
              value={lastName}
              setValue={(val: any) => {
                setLastName(allowOnlyString(val));
                setLastNameError('');
              }}
              errorMsg={lastNameError}
              isRight={isRight}
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_DOB')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <DateTimeComp
              mode="date"
              dateValue={dateOfBirth}
              onDateChange={(val: any) => {
                setDateOfBirth(val);
                const birthDate = new Date(val);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (
                  m < 0 ||
                  (m === 0 && today.getDate() < birthDate.getDate())
                ) {
                  age--;
                }
                setAge(String(age));
                setDateOfBirthError('');
              }}
              placeholderDate={I18n.t('SELECT_DATE')}
              maximumDate={new Date()}
              errorMsg={dateOfBirthError}
            />
          </View>
        </View>
        <View style={{}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_AGE')}
          </Text>
          <CustomInput
            placeholder={'-'}
            value={age}
            isEditable={false}
            isRight={isRight}
          />
        </View>

        <Text
          style={[
            styles.Input_Heading,
            {
              textAlign: isRight ? 'right' : 'left',
            },
          ]}>
          {I18n.t('LABELS_SEX')}
          <Text style={{color: colors.Error}}> *</Text>
        </Text>
        <View>
          <YNComp
            selectedValue={gender}
            options={[I18n.t('MALE'), I18n.t('FEMALE'), I18n.t('OTHER')]}
            onSelect={(val: any) => {
              setGender(val);
              setOtherGenderError('');
            }}
            itemStyle={{flexDirection: isRight ? 'row-reverse' : 'row'}}
          />
        </View>

        {gender === I18n.t('OTHER') && (
          <View style={{marginTop: normalized(10)}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_OTHER_SEX')}
            </Text>
            <CustomInput
              placeholder={I18n.t('OTHER_SEX_PLACEHOLDER')}
              value={otherGender}
              setValue={(val: string) => {
                setOtherGender(val);
                setOtherGenderError('');
              }}
              errorMsg={otherGenderError}
              isRight={isRight}
            />
          </View>
        )}

        <Text
          style={[
            styles.Input_Heading,
            {
              textAlign: isRight ? 'right' : 'left',
            },
          ]}>
          {I18n.t('LABELS_ADDRESS')}
          <Text style={{color: colors.Error}}> *</Text>
        </Text>
        {isOnline ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              props?.navigation?.navigate(Routes.MapScreen, {
                onChooseLocation: (loc: any) => {
                  setAddress(loc?.address);
                  setAddressError('');
                },
                headingTxt: I18n.t('MAP'),
                btnTxt: I18n.t('USE_THIS_LOCATION'),
                address: I18n.t('ADDRESS'),
                selectedAddress: I18n.t('SELECTED_ADDRESS'),
                isRight: isRight,
              });
            }}
            style={[
              styles.addressBox,
              {
                backgroundColor: addressError
                  ? colors.redLight
                  : colors.Background,
                borderColor: addressError ? colors.Error : colors.BorderColor,
                flexDirection: isRight ? 'row-reverse' : 'row',
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
                  textAlign: isRight ? 'right' : 'left',
                  color: addressError
                    ? colors.Error
                    : address
                    ? colors.Heading_Txt
                    : colors.Desc_Txt,
                  lineHeight: LINE_HEIGHT,
                  fontSize: normalized(14),
                },
              ]}>
              {address ? address : I18n.t('SELECT_ADDRESS')}
            </Text>
            <LocationIcon
              primary={selector?.isDarkTheme ? colors.Desc_Txt : '#1E1E1E'}
            />
          </TouchableOpacity>
        ) : (
          <CustomInput
            placeholder={I18n.t('TYPE_ADDRESS')}
            value={address}
            setValue={(val: any) => {
              setAddress(val);
              setAddressError('');
            }}
            errorMsg={addressError}
          />
        )}

        <View
          style={[
            styles.Input_Row,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
              justifyContent: 'center',
            },
          ]}>
          <View
            style={{
              flex: 1,
            }}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_HEIGHT')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={I18n.t('HEIGHT.FEET')}
              value={heightFeet}
              setValue={(val: string) => {
                const digits = val.replace(/[^0-9]/g, '');
                if (digits === '') {
                  setHeightFeet('');
                  setHeightFeetError('');
                  return;
                }
                const num = parseInt(digits.replace(/^0+/, '') || '0', 10);
                if (num >= 1 && num <= 10) {
                  setHeightFeet(String(num));
                  setHeightFeetError('');
                } else
                  setHeightFeetError('Please enter a number between 1 and 10');
                setHeightFeetError('');
              }}
              keyboardType="number-pad"
              maxLength={2}
              errorMsg={heightFeetError}
              isRight={isRight}
            />
          </View>

          <View
            style={{
              flex: 1,
            }}>
            <View style={styles.heightLabelSpacer} />
            <CustomInput
              placeholder={I18n.t('HEIGHT.INCHES')}
              value={heightInches}
              setValue={setInchesValue}
              keyboardType="number-pad"
              maxLength={2}
              errorMsg={heightInchesError}
              isRight={isRight}
            />
          </View>

          <View
            style={{
              flex: 1,
            }}>
            <View style={styles.heightLabelSpacer} />
            <CustomInput
              value={`${heightFeet}' ${heightInches}''`}
              isEditable={false}
              isRight={isRight}
            />
          </View>
        </View>

        <View
          style={[
            styles.Input_Row,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <View style={{flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_RACE')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={I18n.t('RACE_PLACEHOLDER')}
              onSubmitEditing={() => focusNextField(weightLbsRef)}
              value={race}
              setValue={(val: string) => {
                setRace(val);
                setRaceError('');
              }}
              errorMsg={raceError}
              isRight={isRight}
            />
          </View>
          <View style={{flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_WEIGHT')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              ref={weightLbsRef}
              placeholder={I18n.t('WEIGHT_PLACEHOLDER')}
              keyboardType="number-pad"
              value={weightLbs}
              setValue={(val: string) => {
                const numbers = extractNumbers(val);
                setWeightLbs(numbers);
                setWeightLbsError('');
              }}
              errorMsg={weightLbsError}
              isRight={isRight}
            />
          </View>
        </View>

        <View
          style={[
            styles.Input_Row,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <View style={{flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_EYE_COLOR')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              ref={weightLbsRef}
              placeholder={I18n.t('EYE_COLOR_PLACEHOLDER')}
              value={eyeColor}
              setValue={(val: string) => {
                setEyeColor(val);
                setEyeColorError(false);
              }}
              errorMsg={eyeColorError}
              isRight={isRight}
            />
          </View>
          <View style={{flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_HAIR_COLOR')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              ref={weightLbsRef}
              placeholder={I18n.t('HAIR_COLOR_PLACEHOLDER')}
              value={hairColor}
              setValue={(val: string) => {
                setHairColor(val);
                setHairColorError(false);
              }}
              errorMsg={hairColorError}
              isRight={isRight}
            />
          </View>
        </View>

        <View
          style={{
            flex: 1,
          }}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_PHONE_NUMBER')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('PHONE_NUMBER_PLACEHOLDER')}
            value={phoneNumber}
            setValue={(val: any) => {
              setPhoneNumber(formatPhoneNumber(val));
              setPhoneNumberError('');
            }}
            keyboardType="number-pad"
            errorMsg={phoneNumberError}
            isRight={isRight}
          />
        </View>

        <View
          style={[
            styles.nextBtnCont,
            {
              alignSelf: isRight ? 'flex-start' : 'flex-end',
            },
          ]}>
          <CustomButton
            text={I18n.t('NEXT')}
            onPress={onNext}
            loading={false}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AutismPersonalInfoScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    nextBtnCont: {
      width: normalized(90),
    },
    heightLabelSpacer: {
      minHeight: normalized(35),
    },
  });
