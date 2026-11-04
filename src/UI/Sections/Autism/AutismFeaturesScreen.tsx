import {FlatList, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useRef, useState, useEffect} from 'react';
import {updateAutismDraft} from '../../../Redux/AppReducers';
import {
  AppFonts,
  AUTISM_STEPPER_LIST,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import Stepper from '../../Components/Stepper';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import CustomCheckBox from '../../Components/CustomCheckBox';
import CustomInput from '../../Components/CustomInput';
import SimpleButton from '../../Components/SimpleButton';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import RTLStepper from '../../Components/RTLStepper';

const AutismFeaturesScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const draft = selector?.autismDraft ?? {};
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
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
  const isRight = selector?.language == 'ar';
  const previousData = props?.route?.params?.data;
  const [communicationArray, setCommunicationArray] = useState<string[]>(
    draft.communicationArray ?? [],
  );
  const [sensitiveArray, setSensitiveArray] = useState<string[]>(
    draft.sensitiveArray ?? [],
  );
  const [dislikeArray, setDislikeArray] = useState<string[]>(
    draft.dislikeArray ?? [],
  );
  const [behaviorArray, setBehaviorArray] = useState<string[]>(
    draft.behaviorArray ?? [],
  );
  const [behaviorOther, setBehaviorOther] = useState(draft.behaviorOther ?? '');
  const [sensiitiveOther, setSensitiveOther] = useState(
    draft.sensiitiveOther ?? '',
  );
  const [avoidanceOther, setAvoidanceOther] = useState(
    draft.avoidanceOther ?? '',
  );

  const [communicationError, setCommunicationError] = useState('');
  const [sensitiveError, setSensitiveError] = useState('');
  const [dislikesErros, setDislikeError] = useState('');
  const [behaviorError, setBehaviorError] = useState('');
  const [behaviorOtherError, setBehaviorOtherError] = useState('');
  const [avoidanceOtherError, setAvoidanceOtherError] = useState('');
  const [sensiitiveOtherError, setSensitiveOtherError] = useState('');

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

  // ------------>>>>>   list manage functions

  useEffect(() => {
    dispatch(
      updateAutismDraft({
        communicationArray,
        sensitiveArray,
        dislikeArray,
        behaviorArray,
        behaviorOther,
        sensiitiveOther,
        avoidanceOther,
      }),
    );
  }, [
    communicationArray,
    sensitiveArray,
    dislikeArray,
    behaviorArray,
    behaviorOther,
    sensiitiveOther,
    avoidanceOther,
    dispatch,
  ]);

  const handleCommunicationList = (option: string) => {
    setCommunicationArray((prev: any) =>
      prev.includes(option)
        ? prev.filter((item: any) => item !== option)
        : [...prev, option],
    );
    setCommunicationError('');
  };

  const handleSensitiveList = (option: string) => {
    setSensitiveArray((prev: any) =>
      prev.includes(option)
        ? prev.filter((item: any) => item !== option)
        : [...prev, option],
    );
    setSensitiveError('');
  };

  const handleDislikeList = (option: string) => {
    setDislikeArray((prev: any) =>
      prev.includes(option)
        ? prev.filter((item: any) => item !== option)
        : [...prev, option],
    );
    setDislikeError('');
  };

  const handleBehaviorList = (option: string) => {
    setBehaviorArray((prev: any) =>
      prev.includes(option)
        ? prev.filter((item: any) => item !== option)
        : [...prev, option],
    );
    setBehaviorError('');
  };

  const onNext = () => {
    let isFormValid = true;
    if (
      communicationArray?.length == 0 ||
      sensitiveArray?.length == 0 ||
      dislikeArray?.length == 0 ||
      behaviorArray?.length == 0
    ) {
      isFormValid = false;
    }
    if (communicationArray?.length == 0) {
      setCommunicationError('...');
      isFormValid = false;
    }
    if (sensitiveArray?.length == 0) {
      setSensitiveError('...');
      isFormValid = false;
    }
    if (dislikeArray?.length == 0) {
      setDislikeError('...');
      isFormValid = false;
    }
    if (behaviorArray?.length == 0) {
      setBehaviorError('...');
      isFormValid = false;
    }
    if (behaviorArray.includes('BEHAVIOR_OTHER') && !behaviorOther) {
      setBehaviorOtherError('...');
      isFormValid = false;
    }
    if (dislikeArray?.includes('DISLIKES_OTHER') && !avoidanceOther) {
      setAvoidanceOtherError('...');
      isFormValid = false;
    }
    if (sensitiveArray?.includes('SENSITIVE_OTHER') && !sensiitiveOther) {
      setSensitiveOtherError('...');
      isFormValid = false;
    }

    if (!isFormValid) {
      return;
    }

    const obj = {
      communicationArray,
      sensitiveArray,
      dislikeArray,
      behaviorArray,
      sensiitiveOther,
      avoidanceOther,
      behaviorOther,
    };

    const data = {
      ...(selector?.autismDraft ?? {}),
      ...(props?.route?.params?.data ?? {}),
      ...obj,
    };

    props?.navigation?.navigate(Routes.AutismSafety.MedicalScreen, {data});
  };

  const translatedStepperList = useMemo(() => {
    const order: string[] = I18n.t('AUTISM_STEPPER.ORDER') || [];
    return order.map(key => I18n.t(`AUTISM_STEPPER.${key}`)).slice(1); // 👈 removes the first item
  }, [selector?.language]);

  return (
    <View style={{flex: 1, backgroundColor: colors.Background}}>
      <Stepper
        list={translatedStepperList}
        completedSteps={[translatedStepperList[0]]}
        activeStep={translatedStepperList[1]}
        isRight={isRight}
      />
      {/* <RTLStepper
        list={translatedStepperList}
        completedSteps={[translatedStepperList[0]]}
        activeStep={translatedStepperList[1]}
        isRight={isRight}
      /> */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(100),
        }}>
        <Text
          style={[
            styles.Modal_Heading_Txt,
            {
              textAlign: isRight ? 'right' : 'left',
            },
          ]}>
          {I18n.t('SELECT_THE_FOLLOWING')}
          <Text style={{color: colors.Error}}> *</Text>
        </Text>

        <FlatList
          data={communicationList}
          numColumns={2}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            gap: normalized(3),
          }}
          ListHeaderComponent={() => (
            <View
              style={[
                styles.rowCont,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <Text
                style={[
                  styles.Input_Heading,
                  {
                    marginBottom: normalized(0),
                    flex: 1,
                    textAlign: isRight ? 'right' : 'left',
                  },
                ]}>
                {I18n.t('COMMUNICATION')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>
              {communicationError && (
                <Text style={styles.error}>{I18n.t('REQUIRED')}</Text>
              )}
            </View>
          )}
          renderItem={({item}: any) => (
            <View
              style={[
                styles.infoItem,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <CustomCheckBox
                checked={communicationArray.includes(item)}
                onChange={() => handleCommunicationList(item)}
              />
              <Text style={styles.checkboxTxt}>{I18n.t(item)}</Text>
            </View>
          )}
        />

        <FlatList
          data={SensitiveList}
          numColumns={2}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            gap: normalized(3),
          }}
          ListHeaderComponent={() => (
            <View
              style={[
                styles.rowCont,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <Text
                style={[
                  styles.Input_Heading,
                  {
                    marginBottom: normalized(0),
                    marginTop: normalized(15),
                    flex: 1,
                    textAlign: isRight ? 'right' : 'left',
                  },
                ]}>
                {I18n.t('SENSITIVE_TO')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>
              {sensitiveError && (
                <Text style={styles.error}>{I18n.t('REQUIRED')}</Text>
              )}
            </View>
          )}
          renderItem={({item}: any) => (
            <View
              style={[
                styles.infoItem,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <CustomCheckBox
                checked={sensitiveArray.includes(item)}
                onChange={() => {
                  handleSensitiveList(item);
                }}
              />
              <Text style={styles.checkboxTxt}>{I18n.t(item)}</Text>
            </View>
          )}
        />

        {sensitiveArray?.includes('SENSITIVE_OTHER') && (
          <View style={{flex: 1, marginTop: normalized(7)}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_SENSITIVE_TO_OTHER_DETAILS')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={I18n.t('OTHER_DETAILS')}
              value={sensiitiveOther}
              setValue={(val: string) => {
                setSensitiveOther(val);
                setSensitiveOtherError('');
              }}
              isMultiLine
              errorMsg={sensiitiveOtherError}
              isRight={isRight}
            />
          </View>
        )}

        <FlatList
          data={DislikesList}
          numColumns={2}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            gap: normalized(3),
          }}
          ListHeaderComponent={() => (
            <View
              style={[
                styles.rowCont,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <Text
                style={[
                  styles.Input_Heading,
                  {
                    marginBottom: normalized(0),
                    marginTop: normalized(15),
                    flex: 1,
                    textAlign: isRight ? 'right' : 'left',
                  },
                ]}>
                {I18n.t('DISLIKES')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>
              {dislikesErros && (
                <Text style={styles.error}>{I18n.t('REQUIRED')}</Text>
              )}
            </View>
          )}
          renderItem={({item}: any) => (
            <View
              style={[
                styles.infoItem,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <CustomCheckBox
                checked={dislikeArray.includes(item)}
                onChange={() => {
                  handleDislikeList(item);
                }}
              />
              <Text style={styles.checkboxTxt}>{I18n.t(item)}</Text>
            </View>
          )}
        />
        {dislikeArray?.includes('DISLIKES_OTHER') && (
          <View style={{marginTop: normalized(7), flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                  flex: 1,
                },
              ]}>
              {I18n.t('LABELS_DISLIKES_OTHER_DETAILS')}
              <Text style={{color: colors.Error}}> *</Text>
            </Text>
            <CustomInput
              placeholder={I18n.t('OTHER_DETAILS')}
              value={avoidanceOther}
              isMultiLine
              setValue={(val: string) => {
                setAvoidanceOther(val);
                setAvoidanceOtherError('');
              }}
              errorMsg={avoidanceOtherError}
              isRight={isRight}
            />
          </View>
        )}

        <FlatList
          data={BehaviorsList}
          numColumns={2}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            gap: normalized(3),
          }}
          columnWrapperStyle={{gap: normalized(10)}}
          ListHeaderComponent={() => (
            <View
              style={[
                styles.rowCont,
                {
                  flexDirection: isRight ? 'row-reverse' : 'row',
                },
              ]}>
              <Text
                style={[
                  styles.Input_Heading,
                  {
                    marginBottom: normalized(0),
                    marginTop: normalized(15),
                    flex: 1,
                    textAlign: isRight ? 'right' : 'left',
                  },
                ]}>
                {I18n.t('ATYPICAL_BEHAVIORS')}
                <Text style={{color: colors.Error}}> *</Text>
              </Text>
              {behaviorError && (
                <Text style={styles.error}>{I18n.t('REQUIRED')}</Text>
              )}
            </View>
          )}
          renderItem={({item}: any) => {
            return (
              <View
                style={[
                  styles.infoItem,
                  {
                    flexDirection: isRight ? 'row-reverse' : 'row',
                  },
                ]}>
                <CustomCheckBox
                  checked={behaviorArray.includes(item)}
                  onChange={() => {
                    handleBehaviorList(item);
                  }}
                />
                <Text style={styles.checkboxTxt}>{I18n.t(item)}</Text>
              </View>
            );
          }}
        />

        {behaviorArray.includes('BEHAVIOR_OTHER') && (
          <View style={{marginBottom: normalized(10), flex: 1}}>
            <Text
              style={[
                styles.Input_Heading,
                {
                  textAlign: isRight ? 'right' : 'left',
                },
              ]}>
              {I18n.t('LABELS_ATYPICAL_BEHAVIORS_OTHER_DETAILS')}
            </Text>
            <CustomInput
              placeholder={I18n.t('OTHER_DETAILS')}
              value={behaviorOther}
              isMultiLine
              setValue={(val: string) => {
                setBehaviorOther(val);
                setBehaviorOtherError('');
              }}
              errorMsg={behaviorOtherError}
              isRight={isRight}
            />
          </View>
        )}
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
              text={I18n.t('NEXT')}
              onPress={onNext}
              loading={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AutismFeaturesScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      marginTop: normalized(5),
      flex: 1,
    },
    checkboxTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
    },
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    error: {
      color: colors.ToastColors.Error,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
