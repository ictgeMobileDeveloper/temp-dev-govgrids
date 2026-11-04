import {StyleSheet, View} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  Service_Stepper_List,
} from '../../../Utils/AppConstants';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {setIsHelpDeskPopped, setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import {getErrorMessage} from '../../../Utils/Helper';

import Stepper from '../../Components/Stepper';
import CustomButton from '../../Components/CustomButton';
import SimpleButton from '../../Components/SimpleButton';
import DynamicFormView, {
  DynamicFormViewRef,
} from '../../dynamic_form_shared/DynamicFormView';
import {
  appendHelpDeskCustomFields,
  DynamicField,
  DynamicFormValues,
  formatDate,
  serializeDynamicFormValues,
  toUploadFile,
} from '../../dynamic_form_shared/DynamicFormCore';

const FormSubmissionScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<DynamicFormViewRef>(null);

  const customFields = useMemo(
    () => props?.route?.params?.customFields ?? [],
    [props?.route?.params?.customFields],
  );

  const appendIfDefined = (fd: FormData, key: string, value: any) => {
    if (value === undefined || value === null || value === '') return;
    fd.append(key, String(value));
  };

  const normalizeScalar = (value: any) => {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return formatDate(value);
    if (typeof value === 'object') {
      if ('id' in value && value.id !== undefined) return value.id;
      if ('value' in value && value.value !== undefined) return value.value;
      if ('name' in value && value.name !== undefined) return value.name;
      return JSON.stringify(value);
    }
    return value;
  };

  const handleDynamicFormSubmit = (
    values: DynamicFormValues,
    activeFields: DynamicField[],
  ) => {
    const serializedValues = serializeDynamicFormValues(values);
    const routeParams: any = props?.route?.params ?? {};
    const formData = new FormData();

    const getParam = (name: string) =>
      routeParams?.[name] ?? serializedValues?.[name] ?? '';

    appendIfDefined(formData, 'title', getParam('title'));
    appendIfDefined(formData, 'taskCategory', getParam('taskCategory'));
    appendIfDefined(formData, 'team', getParam('team'));
    appendIfDefined(formData, 'technician', getParam('technician'));
    appendIfDefined(formData, 'type', getParam('type'));
    appendIfDefined(formData, 'priority', getParam('priority'));
    appendIfDefined(formData, 'status', getParam('status'));
    appendIfDefined(formData, 'requester', getParam('requester'));
    appendIfDefined(formData, 'description', getParam('description'));
    appendIfDefined(formData, 'catalogId', getParam('catalogId'));
    appendIfDefined(formData, 'dueDate', formatDate(getParam('dueDate')));

    const tags =
      (Array.isArray(routeParams?.tag) && routeParams.tag) ||
      (Array.isArray(serializedValues?.tag) && serializedValues.tag) ||
      [];

    tags.forEach((tagValue: any, idx: number) => {
      appendIfDefined(formData, `tag[${idx}]`, normalizeScalar(tagValue));
    });

    const files =
      (Array.isArray(routeParams?.file) && routeParams.file) ||
      (Array.isArray(serializedValues?.file) && serializedValues.file) ||
      [];

    files.forEach((file: any, idx: number) => {
      const uploadFile = toUploadFile(file);
      if (uploadFile) {
        formData.append(`file[${idx}]`, uploadFile as any);
      }
    });

    appendHelpDeskCustomFields(formData, activeFields, serializedValues);

    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.helpDeskRaiseTicket,
      method: 'POST',
      isFormData: true,
      authContext: 'HELPDESK',
      payload: formData,
      onComplete: (resp: any) => {
        setIsLoading(false);

        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message:
                resp?.message ?? resp?.data?.message ?? 'Ticket submitted.',
            }),
          );
          dispatch(setIsHelpDeskPopped(true));
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

  const onSubmit = () => {
    formRef.current?.submit();
  };

  return (
    <View style={styles.container}>
      <Stepper
        list={Service_Stepper_List}
        completedSteps={[Service_Stepper_List[0], Service_Stepper_List[1]]}
        activeStep={Service_Stepper_List[2]}
      />

      <KeyboardAwareScrollView contentContainerStyle={styles.contentCont}>
        <DynamicFormView
          ref={formRef}
          fields={customFields}
          showButtons={false}
          onSubmit={handleDynamicFormSubmit}
        />

        <View style={styles.btnRow}>
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
          <View style={styles.nextBtnCont}>
            <CustomButton
              text={'Submit'}
              onPress={onSubmit}
              loading={isLoading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default FormSubmissionScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    nextBtnCont: {
      width: normalized(120),
    },
    btnRow: {
      marginTop: normalized(24),
      marginBottom: normalized(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    contentCont: {
      paddingHorizontal: AppHorizontalMargin,
      paddingBottom: normalized(20),
    },
  });
