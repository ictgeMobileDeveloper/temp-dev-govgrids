import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useMemo, useRef, useState, useEffect} from 'react';
import {useSelector, UseDispatch, useDispatch} from 'react-redux';
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
import YNComp from '../../Components/YNComp';
import SimpleButton from '../../Components/SimpleButton';
import CustomButton from '../../Components/CustomButton';
import {Routes} from '../../../Utils/Routes';
import {useGradualAnimation} from '../../../Utils/Helper';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {updateAutismDraft} from '../../../Redux/AppReducers';

const AutismInformationScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const dispatch = useDispatch();
  const draft = selector?.autismDraft ?? {};
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

  const [calmingMethods, setCalmingMethods] = useState(
    draft.calmingMethods ?? '',
  );
  const [connect, setConnect] = useState(draft.connect ?? '');
  const [places, setPlaces] = useState(draft.places ?? '');
  const [otherSugg, setOtherSugg] = useState(draft.otherSugg ?? '');
  const [wanderRisk, setWanderRisk] = useState(
    draft.wanderRisk ?? I18n.t('COMMON.NO'),
  );

  const [CalmingMethodsError, setCalmingMethodsError] = useState('');
  const [connectError, setConnectError] = useState('');
  const [placedError, setPlacedError] = useState('');
  const [otherSuggError, setOtherSuggError] = useState('');

  useEffect(() => {
    dispatch(
      updateAutismDraft({
        calmingMethods,
        connect,
        places,
        otherSugg,
        wanderRisk,
      }),
    );
  }, [calmingMethods, connect, places, otherSugg, wanderRisk, dispatch]);

  const onNext = () => {
    let isFormValid = true;
    if (!calmingMethods) {
      setCalmingMethodsError('...');
      isFormValid = false;
    }
    if (!connect) {
      setConnectError('...');
      isFormValid = false;
    }
    if (!places) {
      setPlacedError('...');
      isFormValid = false;
    }
    if (!otherSugg) {
      setOtherSuggError('...');
      isFormValid = false;
    }
    if (!isFormValid) {
      return;
    }

    const obj = {calmingMethods, connect, places, otherSugg, wanderRisk};
    const data = {
      ...(selector?.autismDraft ?? {}),
      ...(props?.route?.params?.data ?? {}),
      ...obj,
    };
    props?.navigation?.navigate(Routes.AutismSafety.AdditionalInfoScreen, {
      data,
    });
  };

  const translatedStepperList = useMemo(() => {
    const order: string[] = I18n.t('AUTISM_STEPPER.ORDER') || [];
    return order.map(key => I18n.t(`AUTISM_STEPPER.${key}`)).slice(2); // 👈 removes the first item
  }, [selector?.language]);
  const {height} = useGradualAnimation();

  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: colors.Background}}>
      {isRight ? (
        <Stepper
          list={translatedStepperList}
          completedSteps={[translatedStepperList[0], translatedStepperList[1]]}
          activeStep={translatedStepperList[2]}
          isRight={isRight}
        />
      ) : (
        <Stepper
          list={AUTISM_STEPPER_LIST}
          completedSteps={[
            AUTISM_STEPPER_LIST[0],
            AUTISM_STEPPER_LIST[1],
            AUTISM_STEPPER_LIST[2],
            AUTISM_STEPPER_LIST[3],
          ]}
          activeStep={AUTISM_STEPPER_LIST[4]}
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
          {I18n.t('INFORMATION_FOR_THE_RESPONDING_OFFICER')}
        </Text>

        <View style={{flex: 1}}>
          <Text
            style={[
              styles.Input_Heading,
              {
                textAlign: isRight ? 'right' : 'left',
              },
            ]}>
            {I18n.t('LABELS_CALMING_METHODS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('ENTER_CALMING_METHODS_PLACEHOLDER')}
            isMultiLine
            isScrollable
            value={calmingMethods}
            setValue={(val: string) => {
              setCalmingMethods(val);
              setCalmingMethodsError('');
            }}
            errorMsg={CalmingMethodsError}
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
            {I18n.t('LABELS_INTERESTS_CONNECT')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t(
              'ENTER_INTERESTS_AND_WAYS_TO_CONNECT_PLACEHOLDER',
            )}
            isMultiLine
            isScrollable
            value={connect}
            setValue={(val: string) => {
              setConnect(val);
              setConnectError('');
            }}
            errorMsg={connectError}
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
            {I18n.t('LABELS_WANDER_RISK')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>

          <YNComp
            selectedValue={wanderRisk}
            options={[I18n.t('COMMON.YES'), I18n.t('COMMON.NO')]}
            onSelect={(val: any) => {
              setWanderRisk(val);
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
            {I18n.t('LABELS_PLACES_THEY_MAY_GO')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('ENTER_PLACES_THEY_MAY_GO_PLACEHOLDER')}
            value={places}
            isMultiLine
            isScrollable
            setValue={(val: string) => {
              setPlaces(val);
              setPlacedError('');
            }}
            errorMsg={placedError}
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
            {I18n.t('LABELS_OTHER_SUGGESTIONS')}
            <Text style={{color: colors.Error}}> *</Text>
          </Text>
          <CustomInput
            placeholder={I18n.t('ENTER_OTHER_SUGGESTIONS_PLACEHOLDER')}
            value={otherSugg}
            isMultiLine
            isScrollable
            setValue={(val: string) => {
              setOtherSugg(val);
              setOtherSuggError('');
            }}
            errorMsg={otherSuggError}
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
        <Animated.View
          style={[
            keyboardPaddingBottom,
            {
              backgroundColor: 'transparent',
            },
          ]}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AutismInformationScreen;

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
