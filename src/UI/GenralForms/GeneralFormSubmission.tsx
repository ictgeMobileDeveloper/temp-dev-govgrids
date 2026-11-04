import React, {useMemo, useState} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';

import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage, truncateName} from '../../Utils/Helper';
import DynamicFormView from '../dynamic_form_shared/DynamicFormView';
import {
  buildGeneralFormData,
  DynamicField,
  DynamicFormValues,
} from '../dynamic_form_shared/DynamicFormCore';
import {truncateFileName} from '../../Utils/Helper';

const GeneralFormSubmissionScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();

  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors, insects],
  );

  const form = props?.route?.params?.form;
  console.log(form);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (
    values: DynamicFormValues,
    activeFields: DynamicField[],
  ) => {
    const formData = buildGeneralFormData({
      form,
      fields: activeFields,
      values,
    });

    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.generalFormSubmit,
      method: 'POST',
      payload: formData,
      isFormData: true,
      useRecaptcha: true,
      onComplete: (resp: any) => {
        setIsLoading(false);

        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: resp?.message ?? 'Form submitted successfully.',
            }),
          );

          props.navigation.goBack();
        } else {
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
    <View style={[styles.container, styles.safeArea]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props.navigation.goBack()}
        text={truncateName(form?.name) ?? 'General Form'}
        desc={form?.description}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentCont}
        keyboardShouldPersistTaps="handled">
        <DynamicFormView
          fields={form?.fields ?? []}
          loading={isLoading}
          submitText="Submit"
          backText="Back"
          onBack={() => props.navigation.goBack()}
          onSubmit={onSubmit}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default GeneralFormSubmissionScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    contentCont: {
      paddingHorizontal: AppHorizontalMargin,
      paddingBottom: normalized(30),
    },
    formDesc: {
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      lineHeight: normalized(19),
      marginBottom: normalized(16),
    },
  });
