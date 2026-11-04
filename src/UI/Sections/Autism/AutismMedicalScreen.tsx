import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useRef, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AUTISM_STEPPER_LIST,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import I18n from 'i18n-js';
import en from '../../../assets/translation/en.json';
import es from '../../../assets/translation/es.json';
import ar from '../../../assets/translation/ar.json';
import it from '../../../assets/translation/it.json';
import pl from '../../../assets/translation/pl.json';
import Stepper from '../../Components/Stepper';
import CustomInput from '../../Components/CustomInput';
import SimpleButton from '../../Components/SimpleButton';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {updateAutismDraft} from '../../../Redux/AppReducers';

const AutismMedicalScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const draft = selector?.autismDraft ?? {};
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

  const [diagnosis, setDiagnosis] = useState(draft.diagnosis ?? '');
  const [medication, setMedication] = useState(draft.medication ?? '');
  const [serviceConnection, setServiceConnection] = useState(
    draft.serviceConnection ?? '',
  );
  const [otherMedicalInfo, setOtherMedicalInfo] = useState(
    draft.otherMedicalInfo ?? '',
  );
  const [diagnosisError, setDiagnosisError] = useState('');
  const [medicationError, setMedicationError] = useState('');
  const [serviceConnectionError, setServiceConnectionError] = useState('');
  const [otherMedicalInfoError, setOtherMedicalInfoError] = useState('');

  const medicationRef = useRef(null);
  const serviceConnectionRef = useRef(null);
  const otherMedicalInfoRef = useRef(null);

  // ---------------------

  useEffect(() => {
    dispatch(
      updateAutismDraft({
        diagnosis,
        medication,
        serviceConnection,
        otherMedicalInfo,
      }),
    );
  }, [diagnosis, medication, serviceConnection, otherMedicalInfo, dispatch]);

  const focusNextField = (inputRef: any) => {
    if (inputRef?.current) {
      inputRef?.current?.focus();
    }
  };

  const onNext = () => {
    let isFormValid = true;
    if (!diagnosis) {
      setDiagnosisError('...');
      isFormValid = false;
    }
    if (!medication) {
      setMedicationError('...');
      isFormValid = false;
    }
    if (!serviceConnection) {
      setServiceConnectionError('...');
      isFormValid = false;
    }
    if (!otherMedicalInfo) {
      setOtherMedicalInfoError('...');
      isFormValid = false;
    }

    if (!isFormValid) {
      return;
    }

    const obj = {
      diagnosis,
      medication,
      serviceConnection,
      otherMedicalInfo,
    };
    const data = {
      ...(selector?.autismDraft ?? {}),
      ...(props?.route?.params?.data ?? {}),
      ...obj,
    };

    props?.navigation?.navigate(Routes.AutismSafety.InformationScreen, {data});
  };

  const translatedStepperList = useMemo(() => {
    const order: string[] = I18n.t('AUTISM_STEPPER.ORDER') || [];
    return order.map(key => I18n.t(`AUTISM_STEPPER.${key}`)).slice(2); // 👈 removes the first item
  }, [selector?.language]);

  return (
    <View style={{flex: 1, backgroundColor: colors.Background}}>
      {isRight ? (
        <Stepper
          list={translatedStepperList}
          completedSteps={[translatedStepperList[0]]}
          activeStep={translatedStepperList[1]}
          isRight={isRight}
        />
      ) : (
        <Stepper
          list={AUTISM_STEPPER_LIST}
          completedSteps={[
            AUTISM_STEPPER_LIST[0],
            AUTISM_STEPPER_LIST[1],
            AUTISM_STEPPER_LIST[2],
          ]}
          activeStep={AUTISM_STEPPER_LIST[3]}
        />
      )}
      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(12),
        }}>
        <Text
          style={[
            styles.Modal_Heading_Txt,
            {
              textAlign: isRight ? 'right' : 'left',
            },
          ]}>
          {I18n.t('MEDICAL_INFORMATION')}
        </Text>

        <View style={{flex: 1}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_MEDICAL_DIAGNOSIS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            isMultiLine
            isScrollable
            placeholder={I18n.t('MEDICAL_DIAGNOSIS_PLACEHOLDER')}
            value={diagnosis}
            onSubmitEditing={() => focusNextField(medicationRef)}
            setValue={(val: string) => {
              setDiagnosis(val);
              setDiagnosisError('');
            }}
            errorMsg={diagnosisError}
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
            {I18n.t('LABELS_MEDICAL_MEDICATION')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('MEDICAL_MEDICATION_PLACEHOLDER')}
            isMultiLine
            isScrollable
            ref={medicationRef}
            value={medication}
            setValue={(val: string) => {
              setMedication(val);
              setMedicationError('');
            }}
            errorMsg={medicationError}
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
            {I18n.t('LABELS_MEDICAL_SERVICE_CONNECTION')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('MEDICAL_SERVICE_CONNECTION_PLACEHOLDER')}
            isMultiLine
            isScrollable
            ref={serviceConnectionRef}
            value={serviceConnection}
            setValue={(val: string) => {
              setServiceConnection(val);
              setServiceConnectionError('');
            }}
            errorMsg={serviceConnectionError}
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
            {I18n.t('LABELS_OTHER_MEDICAL_INFO')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            isMultiLine
            isScrollable
            placeholder={I18n.t('OTHER_MEDICAL_INFO_PLACEHOLDER')}
            ref={otherMedicalInfoRef}
            value={otherMedicalInfo}
            setValue={(val: string) => {
              setOtherMedicalInfo(val);
              setOtherMedicalInfoError('');
            }}
            errorMsg={otherMedicalInfoError}
            isRight={isRight}
          />
        </View>

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
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AutismMedicalScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
