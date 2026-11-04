import {Platform, ScrollView, StyleSheet, View} from 'react-native';
import React, {useMemo, useRef} from 'react';
import SimpleButton from '../Components/SimpleButton';
import {
  normalized,
  RIP_STEPPER_LIST,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomButton from '../Components/CustomButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import Stepper from '../Components/Stepper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {Routes} from '../../Utils/Routes';
import {setShowToast, updateRipDraft} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import DynamicFormView, {
  DynamicFormViewRef,
} from '../dynamic_form_shared/DynamicFormView';
import {
  buildRipAnswers,
  DynamicField,
  DynamicFormValues,
  serializeDynamicValue,
} from '../dynamic_form_shared/DynamicFormCore';

const RIPSubmiReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const baseData = selector?.baseData ?? {};

  const data = props?.route?.params?.data?.requestCategory;
  const questions = data?.questions ?? [];
  const scrollRef = useRef(null);
  const draft = selector?.ripDraft ?? {};

  const initialValues = draft?.rawAnswers ?? {};
  const description = draft?.description ?? '';
  const formRef = useRef<DynamicFormViewRef>(null);

  const handleDynamicFormSubmit = (
    values: DynamicFormValues,
    activeFields: DynamicField[],
  ) => {
    const formData = buildRipAnswers(activeFields, values);
    console.log('questions', questions);
    console.log('Answers', formData);
    const nextData = serializeDynamicValue({
      ...draft,
      ...(props?.route?.params?.data ?? {}),
      rawAnswers: values,
      answers: formData,
      description,
    });

    dispatch(updateRipDraft(nextData));

    props?.navigation?.navigate(Routes.RIP.ChooseLocation, {
      data: nextData,
    });
  };

  const onNext = () => {
    const didSubmit = formRef.current?.submit();
  };

  return (
    <View style={styles.container}>
      <Stepper
        list={RIP_STEPPER_LIST}
        completedSteps={[RIP_STEPPER_LIST[0], RIP_STEPPER_LIST[1]]}
        activeStep={RIP_STEPPER_LIST[1]}
      />

      <KeyboardAwareScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: normalized(20)}}>
        <DynamicFormView
          ref={formRef}
          fields={questions}
          initialValues={initialValues}
          showButtons={false}
          timeOfQuestions="open"
          context={{
            baseData,
            countryRestriction: baseData?.countryCode?.toLowerCase(),
            country: baseData?.country,
          }}
          onSubmit={handleDynamicFormSubmit}
        />
        <View
          style={[
            styles.btnRow,
            {
              marginBottom:
                Platform.OS === 'android'
                  ? insects.bottom + normalized(20)
                  : normalized(20),
            },
          ]}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton text={'Next'} onPress={onNext} loading={false} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default RIPSubmiReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: normalized(90),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
