import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {clearAutismDraft, updateAutismDraft} from '../../../Redux/AppReducers';
import Stepper from '../../Components/Stepper';
import {
  AppFonts,
  AUTISM_STEPPER_LIST,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import PlusIcon from '../../Svg/PlusIcon';
import MinusIcon from '../../Svg/MinusIcon';
import CustomInput from '../../Components/CustomInput';
import {LocationHandler} from '../../Location/LocationHandler';
import LocationIcon from '../../Svg/LocationIcon';
import YNComp from '../../Components/YNComp';
import SimpleButton from '../../Components/SimpleButton';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import moment from 'moment';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {AppStrings, AsyncKeyStrings} from '../../../Utils/AppStrings';
import {
  setIsAutismPopped,
  setShowToast,
  setofflineAutismReq,
} from '../../../Redux/AppReducers';
import {
  copyAttachmentToAppStorage,
  getErrorMessage,
} from '../../../Utils/Helper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {setDataInAsync} from '../../../Utils/AsyncStorage';
import {isEmailValid} from '../../../Utils/Helper';

const AutismAdditinalInfoScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const draft = selector?.autismDraft ?? {};
  const userData = selector?.residentUserData;

  const data = {
    ...(selector?.autismDraft ?? {}),
    ...(props?.route?.params?.data ?? {}),
  };

  const isOnline = selector?.isNetConnected;

  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  I18n.locale = selector?.language;
  I18n.fallbacks = true;
  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };
  const isRight = selector.language == 'ar';
  const initialGuardian = {
    guardianFirstName: '',
    guardianMiddleName: '',
    guardianLastName: '',
    guardianEmail: '',
    guardianPhoneNumber: '',
    guardianAddress: '',
    errors: {
      guardianFirstName: '',
      guardianLastName: '',
      guardianEmail: '',
      guardianPhoneNumber: '',
      guardianAddress: '',
    },
  };

  const communicationList = [
    'COMMUNICATION_VERBAL',
    'COMMUNICATION_NON_VERBAL',
    'COMMUNICATION_DRAWING',
    'COMMUNICATION_PICTURES',
    'COMMUNICATION_ASL',
    'COMMUNICATION_YES_NO',
    'COMMUNICATION_CAN_READ',
    'COMMUNICATION_CAN_WRITE',
  ];
  const SensitiveList = [
    'SENSITIVE_NOISE',
    'SENSITIVE_LIGHT',
    'SENSITIVE_CROWDS',
    'SENSITIVE_TOUCH',
    'SENSITIVE_OTHER',
  ];

  const DislikesList = [
    'DISLIKES_EYE_CONTACT',
    'DISLIKES_BEING_WET',
    'DISLIKES_BEING_DIRTY',
    'DISLIKES_STRANGERS',
    'DISLIKES_CLOTHES_SHOES',
    'DISLIKES_OTHER',
  ];

  const BehaviorsList = [
    'BEHAVIOR_SPEAKS_LOUDLY',
    'BEHAVIOR_SELF_INJURY',
    'BEHAVIOR_WILL_RUN',
    'BEHAVIOR_VOCAL_STIMMING',
    'BEHAVIOR_HIGH_PITCHED_NOISE',
    'BEHAVIOR_NO_SENSE_DANGER',
    'BEHAVIOR_TICS',
    'BEHAVIOR_SENSORY_SEEKING',
    'BEHAVIOR_WATER_SEEKING',
    'BEHAVIOR_OTHER',
  ];

  type Guardian = {
    guardianFirstName: string;
    guardianMiddleName: string;
    guardianLastName: string;
    guardianEmail: string;
    guardianPhoneNumber: string;
    guardianAddress: string;
    errors: {
      guardianFirstName: string;
      guardianLastName: string;
      guardianEmail: string;
      guardianPhoneNumber: string;
      guardianAddress: string;
    };
  };

  const [guardians, setGuardians] = useState<Guardian[]>(
    draft.guardians ?? [{...initialGuardian}],
  );

  const [addtionalInfo, setAdditionalInfo] = useState(
    draft.addtionalInfo ?? '',
  );
  const [policeInteraction, setPolicaInteraction] = useState(
    draft.policeInteraction ?? '',
  );
  const [uniformed, setUniformed] = useState(
    draft.uniformed ?? I18n.t('COMMON.NO'),
  );
  const [policeDep, setPoliceDep] = useState(
    draft.policeDep ?? I18n.t('COMMON.NO'),
  );

  const [isLoading, setIsLoading] = useState(false);

  const [addressError, setAddressError] = useState('');
  const [additionalInfoError, setAddtionalInfoError] = useState('');
  const [policeInteractionError, setPoliceInteractionError] = useState('');

  const MAX_LINES = 3;
  const BASE_HEIGHT = normalized(45);
  const LINE_HEIGHT = normalized(18);
  const [addressLines, setAddressLines] = useState<number>(1);

  const addGuardian = () => {
    setGuardians((prev: Guardian[]) => [...prev, {...initialGuardian}]);
  };

  const removeGuardian = (index: number) => {
    setGuardians((prev: Guardian[]) =>
      prev.filter((_, i: number) => i !== index),
    );
  };

  const updateGuardian = (
    index: number,
    field: keyof Omit<Guardian, 'errors'>,
    value: string,
  ) => {
    setGuardians((prev: Guardian[]) =>
      prev.map((guardian: Guardian, i: number) => {
        if (i !== index) return guardian;

        return {
          ...guardian,
          [field]: value,
          errors: {
            ...guardian.errors,
            ...(field in guardian.errors ? {[field]: ''} : {}),
          },
        };
      }),
    );
  };

  const formattedCommunicationData = communicationList.map((key: any) => ({
    keyName: I18n.t(key),
    name: key,
    value: data?.communicationArray.includes(key),
    languageLabel: I18n.t(key),
  }));

  const formattedSensitiveData = SensitiveList.map((key: any) => ({
    keyName: I18n.t(key),
    name: key,
    value: data?.sensitiveArray.includes(key),
    languageLabel: I18n.t(key),
  }));

  const formattedAvoidanceData = DislikesList.map((key: any) => ({
    keyName: I18n.t(key),
    name: key,
    value: data?.dislikeArray.includes(key),
    languageLabel: I18n.t(key),
  }));

  const formattedBehaviorData = BehaviorsList.map((key: any) => ({
    keyName: I18n.t(key),
    name: key,
    value: data?.behaviorArray.includes(key),
    languageLabel: I18n.t(key),
  }));

  useEffect(() => {
    dispatch(
      updateAutismDraft({
        guardians,
        addtionalInfo,
        policeInteraction,
        uniformed,
        policeDep,
      }),
    );
  }, [
    guardians,
    addtionalInfo,
    policeInteraction,
    uniformed,
    policeDep,
    dispatch,
  ]);

  const onNext = async () => {
    let isFormValid = true;
    const updatedGuardians = guardians.map(guardian => {
      const updatedErrors = {
        guardianFirstName: '',
        guardianLastName: '',
        guardianEmail: '',
        guardianPhoneNumber: '',
        guardianAddress: '',
      };
      if (!guardian.guardianFirstName) {
        updatedErrors.guardianFirstName = 'First Name is required';
        isFormValid = false;
      }
      if (!guardian.guardianLastName) {
        updatedErrors.guardianLastName = 'Last Name is required';
        isFormValid = false;
      }
      if (!guardian.guardianEmail) {
        updatedErrors.guardianEmail = 'Email is required';
        isFormValid = false;
      } else if (!isEmailValid(guardian.guardianEmail)) {
        updatedErrors.guardianEmail = 'Please enter a valid email';
        isFormValid = false;
      }
      if (!guardian.guardianPhoneNumber) {
        updatedErrors.guardianPhoneNumber = 'Phone number is required';
        isFormValid = false;
      }
      if (!guardian.guardianAddress) {
        updatedErrors.guardianAddress = 'Address is required';
        isFormValid = false;
      }

      return {
        ...guardian,
        errors: updatedErrors,
      };
    });
    setGuardians(updatedGuardians);
    if (!policeInteraction) {
      setPoliceInteractionError('...');
      isFormValid = false;
    }
    if (!addtionalInfo) {
      setAddtionalInfoError('...');
      isFormValid = false;
    }
    if (!isFormValid) return;

    const cleanedGuardians = guardians.map(({errors, ...rest}) => rest);
    const payload = {
      language: selector?.language,
      firstName: data?.firstName,
      middleName: data?.middleName,
      lastName: data?.lastName,
      dateOfBirth: moment(data?.dateOfBirth).format('YYYY-MM-DD'),
      age: data?.age,
      sex: data?.gender?.toLowerCase(),
      otherSex: data?.otherGender,
      address: data?.address,
      race: data?.race,
      height: `${data?.heightFeet}' ${data?.heightInches}''`,
      heightFeet: data?.heightFeet,
      heightInches: data?.heightInches,
      weight: data?.weightLbs,
      eyeColor: data?.eyeColor,
      hairColor: data?.hairColor,
      phoneNumber: data?.phoneNumber,
      wornItems: data?.wornItems,
      identificationMarks: data?.identifyingMarks,
      communication: formattedCommunicationData,
      communicationOtherDetails: '',
      sensitiveTo: formattedSensitiveData,
      sensitiveToOtherDetails: data?.sensiitiveOther,
      dislikes: formattedAvoidanceData,
      dislikesOtherDetails: data?.avoidanceOther,
      atypicalBehaviors: formattedBehaviorData,
      atypicalBehaviorOtherDetails: data?.behaviorOther,
      medicalDiagnosis: data?.diagnosis,
      medicalMedication: data?.medication,
      medicalServiceConnection: data?.serviceConnection,
      otherMedicalInformation: data?.otherMedicalInfo,
      claimingMethods: data?.calmingMethods,
      interestsAndWaysToConnect: data?.connect,
      wanderRisk: data?.wanderRisk,
      placesTheyMayGo: data?.places,
      otherSuggestions: data?.otherSugg,
      guardians: cleanedGuardians,
      fearOfK9Units: policeDep,
      additionalInformationForOfficer: addtionalInfo,
      photoGraph: data?.photoGraph,
    };

    if (!isOnline) {
      let copiedPhoto = payload.photoGraph;
      try {
        copiedPhoto = await copyAttachmentToAppStorage(payload.photoGraph);
      } catch (_copyErr) {}

      const offlinePayload = {
        ...payload,
        photoGraph: copiedPhoto,
      };

      const autismData = [
        offlinePayload,
        ...(selector?.offlineAutismRequests ?? []),
      ];
      await setDataInAsync(AsyncKeyStrings.AutismRequests, autismData);
      dispatch(setofflineAutismReq(autismData));
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: 'Request Saved.',
        }),
      );
      dispatch(clearAutismDraft());
      dispatch(setIsAutismPopped(true));
      return;
    }

    const formData = new FormData();
    formData.append('language', payload.language ?? '');
    formData.append('firstName', payload.firstName ?? '');
    formData.append('middleName', payload.middleName ?? '');
    formData.append('lastName', payload.lastName ?? '');
    formData.append('dateOfBirth', payload.dateOfBirth ?? '');
    formData.append('age', payload.age ?? '');
    formData.append('sex', payload.sex ?? '');
    formData.append('otherSex', payload.otherSex ?? '');
    formData.append('address', payload.address ?? '');
    formData.append('race', payload.race ?? '');
    formData.append('height', payload.height ?? '');
    formData.append('heightFeet', payload.heightFeet ?? '');
    formData.append('heightInches', payload.heightInches ?? '');
    formData.append('weight', payload.weight ?? '');
    formData.append('eyeColor', payload.eyeColor ?? '');
    formData.append('hairColor', payload.hairColor ?? '');
    formData.append('phoneNumber', payload.phoneNumber ?? '');
    formData.append('wornItems', payload.wornItems ?? '');
    formData.append('identificationMarks', payload.identificationMarks ?? '');
    formData.append('communication', JSON.stringify(payload.communication));
    formData.append(
      'communicationOtherDetails',
      payload.communicationOtherDetails ?? '',
    );
    formData.append('sensitiveTo', JSON.stringify(payload.sensitiveTo));
    formData.append(
      'sensitiveToOtherDetails',
      payload.sensitiveToOtherDetails ?? '',
    );
    formData.append('dislikes', JSON.stringify(payload.dislikes));
    formData.append('dislikesOtherDetails', payload.dislikesOtherDetails ?? '');
    formData.append(
      'atypicalBehaviors',
      JSON.stringify(payload.atypicalBehaviors),
    );
    formData.append(
      'atypicalBehaviorOtherDetails',
      payload.atypicalBehaviorOtherDetails ?? '',
    );
    formData.append('medicalDiagnosis', payload.medicalDiagnosis ?? '');
    formData.append('medicalMedication', payload.medicalMedication ?? '');
    formData.append(
      'medicalServiceConnection',
      payload.medicalServiceConnection ?? '',
    );
    formData.append(
      'otherMedicalInformation',
      payload.otherMedicalInformation ?? '',
    );
    formData.append('claimingMethods', payload.claimingMethods ?? '');
    formData.append(
      'interestsAndWaysToConnect',
      payload.interestsAndWaysToConnect ?? '',
    );
    formData.append('wanderRisk', payload.wanderRisk ?? '');
    formData.append('placesTheyMayGo', payload.placesTheyMayGo ?? '');
    formData.append('otherSuggestions', payload.otherSuggestions ?? '');
    formData.append('guardians', JSON.stringify(payload.guardians ?? []));
    formData.append('fearOfK9Units', payload.fearOfK9Units ?? '');
    formData.append(
      'additionalInformationForOfficer',
      payload.additionalInformationForOfficer ?? '',
    );
    const photo = payload.photoGraph;
    if (photo?.uri) {
      const rawUri = String(photo.uri);
      const normalizedUri =
        rawUri.startsWith('file://') || rawUri.startsWith('content://')
          ? rawUri
          : `file://${rawUri}`;

      formData.append('photoGraph', {
        uri: normalizedUri,
        type: photo?.type ?? 'image/jpeg',
        name:
          photo?.name ?? photo?.filename ?? `autism_photo_${Date.now()}.jpg`,
      } as any);
      formData.append('source', 'mobile');
      formData.append('platform', Platform.OS);
    }
    setIsLoading(true);
    console.log('payload autism : ', payload);
    apiHandler({
      endpoint: ENDPOINTS.submitAutismFormRequest,
      method: 'POST',
      payload: formData,
      isFormData: true,
      ...(userData?.token && {authContext: 'RESIDENT'}),
      useRecaptcha: true,
      recaptchaAction: 'login',
      onComplete: (resp: any) => {
        if (resp?.status) {
          dispatch(clearAutismDraft());
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.message ?? 'Your Form has been submitted.',
            }),
          );
          dispatch(setIsAutismPopped(true));
          props?.navigation?.pop(6);
          setIsLoading(false);
        } else {
          console.log('autism error ', resp);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
        }
      },
    });
  };

  const translatedStepperList = useMemo(() => {
    const order: string[] = I18n.t('AUTISM_STEPPER.ORDER') || [];
    return order.map(key => I18n.t(`AUTISM_STEPPER.${key}`)).slice(1); // 👈 removes the first item
  }, [selector?.language]);

  return (
    <View style={{flex: 1, backgroundColor: colors.Background}}>
      {isRight ? (
        <Stepper
          list={translatedStepperList}
          completedSteps={[translatedStepperList[0]]}
          activeStep={translatedStepperList[4]}
          isRight={isRight}
          isLastItem={true}
        />
      ) : (
        <Stepper
          list={translatedStepperList}
          completedSteps={[
            translatedStepperList[0],
            translatedStepperList[1],
            translatedStepperList[2],
            translatedStepperList[3],
          ]}
          activeStep={translatedStepperList[4]}
          isRight={isRight}
          isLastItem={true}
        />
      )}

      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(12),
        }}>
        <View style={{height: normalized(15)}} />
        <Text
          style={[
            styles.Modal_Heading_Txt,
            {
              textAlign: isRight ? 'right' : 'left',
            },
          ]}>
          {I18n.t('ADDITIONAL_INFORMATION')}
        </Text>

        <View
          style={[
            styles.rowCont,
            {
              // width: ScreenSize.width - normalized(60),
              marginLeft: isRight ? normalized(20) : 0,
              marginRight: isRight ? 0 : normalized(20),
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('GUARDIAN_INFO')}
          </Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              addGuardian();
            }}>
            <PlusIcon />
          </TouchableOpacity>
        </View>

        {guardians.map((guardian, index) => (
          <View key={index}>
            <View
              style={[
                styles.rowCont,
                {marginTop: index > 0 ? normalized(12) : 0},
              ]}>
              <Text
                style={[
                  styles.guardianTxt,
                  {
                    textAlign: isRight ? 'right' : 'left',
                    flex: 1,
                  },
                ]}>
                {`${I18n.t('GUARDIAN')} - ${index + 1}`}
              </Text>
              {index > 0 && (
                <TouchableOpacity
                  // style={styles.rowCont}
                  onPress={() => removeGuardian(index)}>
                  <MinusIcon />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.rowCont, {gap: normalized(12)}]}>
              <View style={{flex: 1}}>
                <Text
                  style={[
                    styles.Input_Heading,
                    {
                      textAlign: isRight ? 'right' : 'left',
                    },
                  ]}>
                  {I18n.t('LABELS_GUARDIAN_FIRST_NAME')}
                  <Text style={{color: colors.Error}}> *</Text>
                </Text>
                <CustomInput
                  placeholder={I18n.t('LABELS_GUARDIAN_FIRST_NAME')}
                  value={guardian.guardianFirstName}
                  setValue={(val: any) =>
                    updateGuardian(index, 'guardianFirstName', val)
                  }
                  errorMsg={guardian.errors.guardianFirstName}
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
                  {I18n.t('LABELS_GUARDIAN_MIDDLE_NAME')}
                </Text>
                <CustomInput
                  placeholder={I18n.t('LABELS_GUARDIAN_NAME')}
                  value={guardian.guardianMiddleName}
                  setValue={(val: any) =>
                    updateGuardian(index, 'guardianMiddleName', val)
                  }
                  isRight={isRight}
                />
              </View>
            </View>

            <View style={[styles.rowCont, {gap: normalized(12)}]}>
              <View style={{flex: 1}}>
                <Text
                  style={[
                    styles.Input_Heading,
                    {
                      textAlign: isRight ? 'right' : 'left',
                    },
                  ]}>
                  {I18n.t('LABELS_GUARDIAN_LAST_NAME')}
                  <Text style={{color: colors.Error}}> *</Text>
                </Text>
                <CustomInput
                  placeholder={I18n.t('LABELS_GUARDIAN_LAST_NAME')}
                  value={guardian.guardianLastName}
                  setValue={(val: any) =>
                    updateGuardian(index, 'guardianLastName', val)
                  }
                  errorMsg={guardian.errors.guardianLastName}
                  isRight={isRight}
                />
              </View>
            </View>
            <View style={{flex: 1}}>
              <Text
                style={[
                  styles.Input_Heading,
                  {
                    textAlign: isRight ? 'right' : 'left',
                  },
                ]}>
                {I18n.t('LABELS_GUARDIAN_EMAIL')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>
              <CustomInput
                placeholder={I18n.t('LABELS_GUARDIAN_EMAIL')}
                value={guardian.guardianEmail}
                setValue={(val: any) =>
                  updateGuardian(index, 'guardianEmail', val)
                }
                errorMsg={guardian.errors.guardianEmail}
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
                {I18n.t('LABELS_GUARDIAN_PHONE_NUMBER')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>
              <CustomInput
                placeholder={I18n.t('LABELS_GUARDIAN_PHONE_NUMBER')}
                keyboardType={'number-pad'}
                value={guardian.guardianPhoneNumber}
                setValue={(val: string) => {
                  const digitsOnly = val.replace(/\D/g, '');
                  const trimmed = digitsOnly.slice(0, 10);
                  let formatted = trimmed;
                  if (trimmed.length > 6) {
                    formatted = `${trimmed.slice(0, 3)}-${trimmed.slice(
                      3,
                      6,
                    )}-${trimmed.slice(6)}`;
                  } else if (trimmed.length > 3) {
                    formatted = `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`;
                  }

                  updateGuardian(index, 'guardianPhoneNumber', formatted);
                }}
                errorMsg={guardian.errors.guardianPhoneNumber}
                isRight={isRight}
              />
            </View>

            <View style={{}}>
              <Text
                style={[
                  styles.Input_Heading,
                  {
                    textAlign: isRight ? 'right' : 'left',
                  },
                ]}>
                {I18n.t('LABELS_GUARDIAN_ADDRESS')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>

              {isOnline ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={async () => {
                    props?.navigation?.navigate(Routes.MapScreen, {
                      onChooseLocation: (loc: any) => {
                        updateGuardian(index, 'guardianAddress', loc?.address);
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
                      backgroundColor: guardian.errors.guardianAddress
                        ? colors.redLight
                        : colors.Background,
                      borderColor: guardian.errors.guardianAddress
                        ? colors.Error
                        : colors.Grey_2,
                      height:
                        BASE_HEIGHT +
                        Math.max(0, Math.min(addressLines, MAX_LINES) - 1) *
                          LINE_HEIGHT,
                      flexDirection: isRight ? 'row-reverse' : 'row',
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
                        color: guardian.errors.guardianAddress
                          ? colors.Error
                          : colors.Desc_Txt,
                      },
                    ]}>
                    {guardian.guardianAddress
                      ? guardian.guardianAddress
                      : I18n.t('SELECT_ADDRESS')}
                  </Text>
                  <LocationIcon primary={colors.Desc_Txt} />
                </TouchableOpacity>
              ) : (
                <CustomInput
                  placeholder={I18n.t('TYPE_ADDRESS')}
                  value={guardian.guardianAddress}
                  setValue={(val: any) => {
                    updateGuardian(index, 'guardianAddress', val);
                    setAddressError('');
                  }}
                  errorMsg={addressError}
                />
              )}
            </View>
          </View>
        ))}

        <View style={{flex: 1}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_HAS_PRIOR_POLICE_INTERACTIONS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('HAS_PRIOR_POLICE_INTERACTIONS_PLACEHOLDER')}
            isMultiLine
            value={policeInteraction}
            setValue={(val: string) => {
              setPolicaInteraction(val);
              setPoliceInteractionError('');
            }}
            errorMsg={policeInteractionError}
            isRight={isRight}
          />
        </View>

        <View style={{flex: 1, marginTop: normalized(10)}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_UNIFORMED_OFFICER_INTERACTION')}

            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <YNComp
            selectedValue={uniformed}
            options={[I18n.t('COMMON.YES'), I18n.t('COMMON.NO')]}
            onSelect={(val: any) => {
              setUniformed(val);
            }}
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
            {I18n.t('FEAR_OF_DOGS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <YNComp
            selectedValue={policeDep}
            options={[I18n.t('COMMON.YES'), I18n.t('COMMON.NO')]}
            onSelect={val => {
              setPoliceDep(val);
            }}
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
            {I18n.t('LABELS_ADDITIONAL_OFFICER_INFO')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={`${I18n.t('LABELS_ADDITIONAL_OFFICER_INFO')}`}
            isMultiLine
            value={addtionalInfo}
            setValue={(val: string) => {
              setAdditionalInfo(val);
              setAddtionalInfoError('');
            }}
            errorMsg={additionalInfoError}
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
          {I18n.t('AUTISM_FORM_LAST_MESSAGE')}
        </Text>

        <View
          style={[
            styles.btnRow,
            {
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={I18n.t('BACK')}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton
              text={I18n.t('SUBMIT')}
              onPress={onNext}
              loading={isLoading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AutismAdditinalInfoScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    simpleTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Heading,
    },

    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    guardianTxt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Primary,
    },
  });
