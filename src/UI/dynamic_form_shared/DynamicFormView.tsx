import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RichEditor} from 'react-native-pell-rich-editor';

import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import {
  copyAttachmentToAppStorage,
  formatPhoneNumber,
} from '../../Utils/Helper';
import {PLACE_API_KEY} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';

import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import CustomInput from '../Components/CustomInput';
import CustomDropDownList from '../Components/CustomDropDownList';
import DateTimeComp from '../Components/DateTimeComp';
import CustomCheckBox from '../Components/CustomCheckBox';
import RadioComp from '../Components/RadioComp';
import CustomDocumentPicker from '../Components/CustomDocumentPicker';
import CustomRichToolbar from '../Components/CustomRickToolbar';
import CustomGooglePlacesInput from '../Components/CustomGooglePlacesInput';
import SignatureScreen from '../ParkingPermit/SignatureScreen';

import {
  DynamicField,
  DynamicFormContext,
  DynamicFormValues,
  DynamicOption,
  getFieldKey,
  getFiles,
  getOptionLabel,
  getOptionValue,
  parseDateValue,
  parseTimeValue,
  sanitizeDecimal,
  sanitizeInteger,
  toNumberOrNull,
} from './DynamicFormCore';
import {useDynamicForm} from './useDynamicForm';
import AppAttachmentPicker from './Component/AttachmentPicker';

type DynamicFormViewProps = {
  fields: any[];
  initialValues?: DynamicFormValues;
  context?: DynamicFormContext;
  submitText?: string;
  backText?: string;
  loading?: boolean;
  timeOfQuestions?: 'open' | 'reopen' | 'close';
  showButtons?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
  onSubmit: (values: DynamicFormValues, activeFields: DynamicField[]) => void;
};

export type DynamicFormViewRef = {
  submit: () => boolean;
  validate: () => boolean;
  getValues: () => DynamicFormValues;
  getActiveFields: () => DynamicField[];
};

type FieldRendererProps = {
  field: DynamicField;
  value: any;
  error?: string;
  onChange: (field: DynamicField, value: any) => void;
  context?: DynamicFormContext;
};

const getFieldOptions = (field: DynamicField, context?: DynamicFormContext) => {
  if (
    field.type === 'radio' &&
    (!field.options || field.options.length === 0) &&
    context?.defaultRadioOptions?.length
  ) {
    return context.defaultRadioOptions;
  }

  return field.options ?? [];
};

const isRadioLikeField = (field: DynamicField) => {
  const rawType = String(
    field.raw?.type ?? field.raw?.questionType ?? '',
  ).toLowerCase();

  return field.type === 'radio' || rawType === 'radio';
};

const getSelectedOptionIndices = (value: any, options: DynamicOption[]) => {
  const selectedItems = Array.isArray(value) ? value : [];
  return selectedItems
    .map(item => {
      if (item && typeof item === 'object' && '__index' in item) {
        return Number(item.__index);
      }
      return options.findIndex(
        option => getOptionValue(option) === String(item ?? ''),
      );
    })
    .filter(index => index >= 0);
};

const getIndexedOptionValue = (option: DynamicOption, index: number) => ({
  __index: index,
  value: getOptionValue(option),
  label: getOptionLabel(option),
});

const DynamicFieldRenderer = ({
  field,
  value,
  error,
  onChange,
  context,
}: FieldRendererProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const baseData = context?.baseData ?? selector?.baseData ?? {};
  const dispatch = useDispatch();
  const richRef = useRef<any>(null);

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const setValue = (nextValue: any) => onChange(field, nextValue);
  const options = getFieldOptions(field, context);

  const renderEmptyOptions = () => (
    <View style={styles.emptyOptionsBox}>
      <Text style={styles.emptyOptionsTxt}>
        No options available for this field.
      </Text>
    </View>
  );

  const toggleArrayValue = (option: DynamicOption) => {
    const optionValue = getOptionValue(option);
    const current = Array.isArray(value) ? value : [];
    const exists = current.includes(optionValue);
    setValue(
      exists
        ? current.filter(item => item !== optionValue)
        : [...current, optionValue],
    );
  };

  const renderRadioOptions = () => {
    if (!options.length) return renderEmptyOptions();

    return (
      <View style={styles.optionWrap}>
        {options.map((option, index) => {
          const optionValue = getOptionValue(option);
          const selectedIndex =
            typeof value === 'object' && value !== null && '__index' in value
              ? Number(value.__index)
              : options.findIndex(
                  opt => getOptionValue(opt) === String(value ?? ''),
                );

          return (
            <RadioComp
              key={`${getFieldKey(field)}-${index}`}
              item={{id: index, txt: getOptionLabel(option)}}
              selected={{id: selectedIndex}}
              onPress={() => {
                setValue({
                  __index: index,
                  value: optionValue,
                  label: getOptionLabel(option),
                });
              }}
            />
          );
        })}
      </View>
    );
  };

  if (isRadioLikeField(field)) {
    return renderRadioOptions();
  }

  switch (field.type) {
    case 'heading':
      return <Text style={styles.headingText}>{field.label}</Text>;

    case 'paragraph':
      return (
        <Text style={styles.paragraphText}>
          {String(value || field.defaultValue || field.label)}
        </Text>
      );

    case 'text':
    case 'email':
    case 'phone-number':
    case 'url':
    case 'messageOrNote':
      return (
        <CustomInput
          placeholder={field.label}
          value={String(value ?? '')}
          setValue={(text: string) => {
            setValue(
              field.type === 'phone-number' ? formatPhoneNumber(text) : text,
            );
          }}
          keyboardType={
            field.type === 'email'
              ? 'email-address'
              : field.type === 'phone-number'
              ? 'phone-pad'
              : field.type === 'url'
              ? 'url'
              : 'default'
          }
          autoCapitalize={
            field.type === 'email' || field.type === 'url'
              ? 'none'
              : 'sentences'
          }
          autoCorrect={false}
          maxLength={toNumberOrNull(field.maxLength) ?? undefined}
          errorMsg={error}
        />
      );

    case 'textarea':
      return (
        <CustomInput
          placeholder={field.label}
          value={String(value ?? '')}
          setValue={setValue}
          isMultiLine
          maxLength={toNumberOrNull(field.maxLength) ?? undefined}
          errorMsg={error}
        />
      );

    case 'integer':
    case 'number':
      return (
        <CustomInput
          placeholder={field.label}
          value={String(value ?? '')}
          setValue={(text: string) => setValue(sanitizeInteger(text))}
          keyboardType="number-pad"
          errorMsg={error}
        />
      );

    case 'decimal':
      return (
        <CustomInput
          placeholder={field.label}
          value={String(value ?? '')}
          setValue={(text: string) => setValue(sanitizeDecimal(text))}
          keyboardType="decimal-pad"
          errorMsg={error}
        />
      );

    case 'date':
      return (
        <DateTimeComp
          mode="date"
          dateValue={parseDateValue(value)}
          placeholderDate={`Select ${field.label}`}
          onDateChange={(date: Date | null) => setValue(date)}
          minimumDate={parseDateValue(field.minDate)}
          maximumDate={parseDateValue(field.maxDate)}
          errorMsg={error}
        />
      );

    case 'time':
      return (
        <DateTimeComp
          mode="time"
          timeValue={parseTimeValue(value)}
          placeholderTime={`Select ${field.label}`}
          onTimeChange={(time: Date | null) => setValue(time)}
          errorMsg={error}
        />
      );

    case 'datetime':
      return (
        <View style={styles.rowCont}>
          <View style={styles.flexItem}>
            <DateTimeComp
              mode="date"
              dateValue={parseDateValue(value?.date)}
              placeholderDate="Select date"
              onDateChange={(date: Date | null) => setValue({...value, date})}
              minimumDate={parseDateValue(field.minDate)}
              maximumDate={parseDateValue(field.maxDate)}
              errorMsg={error}
            />
          </View>
          <View style={styles.flexItem}>
            <DateTimeComp
              mode="time"
              timeValue={parseTimeValue(value?.time)}
              placeholderTime="Select time"
              onTimeChange={(time: Date | null) => setValue({...value, time})}
              errorMsg={error}
            />
          </View>
        </View>
      );

    case 'cascading': {
      if (!options.length) return renderEmptyOptions();

      const cascadingValue = value && typeof value === 'object' ? value : {};
      const parentValue =
        cascadingValue.parentValue ?? (typeof value === 'object' ? '' : value);
      const parentIndex = options.findIndex(
        option => getOptionValue(option) === String(parentValue ?? ''),
      );
      const selectedParent =
        parentIndex >= 0 ? (options[parentIndex] as any) : null;
      const childOptions = Array.isArray(selectedParent?.options)
        ? selectedParent.options
        : Array.isArray(selectedParent?.children)
        ? selectedParent.children
        : [];
      const childIndex = childOptions.findIndex(
        (option: DynamicOption) =>
          getOptionValue(option) === String(cascadingValue.childValue ?? ''),
      );

      return (
        <View style={styles.optionWrap}>
          <CustomDropDownList
            list={options.map(option => ({
              name: getOptionLabel(option),
              value: getOptionValue(option),
            }))}
            selectedIndex={parentIndex}
            onChange={(index: number) => {
              const parentOption = options[index];
              setValue({
                parentValue: getOptionValue(parentOption),
                parentLabel: getOptionLabel(parentOption),
                childValue: '',
                childLabel: '',
              });
            }}
            placeholder={`Select ${field.label}`}
            error={Boolean(error)}
          />
          {selectedParent && childOptions.length ? (
            <CustomDropDownList
              list={childOptions.map((option: DynamicOption) => ({
                name: `${getOptionLabel(option)}`,
                value: getOptionValue(option),
              }))}
              selectedIndex={childIndex}
              onChange={(index: number) => {
                const childOption = childOptions[index];
                setValue({
                  ...cascadingValue,
                  parentValue: getOptionValue(options[parentIndex]),
                  parentLabel: getOptionLabel(options[parentIndex]),
                  childValue: getOptionValue(childOption),
                  childLabel: getOptionLabel(childOption),
                });
              }}
              placeholder={`Select ${getOptionLabel(selectedParent)} option`}
              error={Boolean(error)}
            />
          ) : null}
        </View>
      );
    }

    case 'dropdown':
    case 'pulldownSelect':
    case 'multiselect':
      if (!options.length) return renderEmptyOptions();

      if (field.multiple || field.type === 'multiselect') {
        const selectedIndexes = getSelectedOptionIndices(value, options);
        return (
          <CustomDropDownList
            list={options.map(option => ({
              name: getOptionLabel(option),
              value: getOptionValue(option),
            }))}
            selectedIndex={selectedIndexes}
            onChange={(index: number) => {
              const exists = selectedIndexes.includes(index);
              const optionValue = getOptionValue(options[index]);
              setValue(
                exists
                  ? (Array.isArray(value) ? value : []).filter(item => {
                      if (
                        item &&
                        typeof item === 'object' &&
                        '__index' in item
                      ) {
                        return Number(item.__index) !== index;
                      }

                      const itemValue =
                        item && typeof item === 'object' && 'value' in item
                          ? String(item.value ?? '')
                          : String(item ?? '');

                      return itemValue !== optionValue;
                    })
                  : [
                      ...(Array.isArray(value) ? value : []),
                      getIndexedOptionValue(options[index], index),
                    ],
              );
            }}
            placeholder={`Select ${field.label}`}
            heading={field.optionGroups}
            error={Boolean(error)}
            isMulti
          />
        );
      }

      return (
        <CustomDropDownList
          list={options.map(option => getOptionLabel(option)) as any}
          selectedIndex={options.findIndex(
            option => getOptionValue(option) === String(value ?? ''),
          )}
          onChange={(index: number) => setValue(getOptionValue(options[index]))}
          placeholder={`Select ${field.label}`}
          heading={field.optionGroups}
          error={Boolean(error)}
        />
      );

    case 'radio':
      return renderRadioOptions();

    case 'checkbox':
      if (!options.length) {
        return (
          <View style={styles.checkboxRow}>
            <CustomCheckBox
              size={normalized(15)}
              checked={Boolean(value)}
              onChange={(checked: boolean) => setValue(checked)}
              isError={Boolean(error)}
            />
            <Text style={styles.checkboxTxt}>{field.label}</Text>
          </View>
        );
      }

      return (
        <View style={styles.optionWrap}>
          {options.map((option, index) => {
            const optionValue = getOptionValue(option);
            const checked = Array.isArray(value) && value.includes(optionValue);
            return (
              <View
                key={`${getFieldKey(field)}-${index}`}
                style={styles.checkboxRow}>
                <CustomCheckBox
                  checked={checked}
                  onChange={() => toggleArrayValue(option)}
                  isError={Boolean(error)}
                />
                <Text style={styles.checkboxTxt}>{getOptionLabel(option)}</Text>
              </View>
            );
          })}
        </View>
      );

    case 'single-checkbox':
      return (
        <View style={styles.checkboxRow}>
          <CustomCheckBox
            checked={Boolean(value)}
            onChange={(checked: boolean) => setValue(checked)}
            isError={Boolean(error)}
          />
          <Text style={styles.checkboxTxt}>{field.label}</Text>
        </View>
      );

    case 'richtext':
      return (
        <>
          <CustomRichToolbar editor={richRef} />
          <View style={styles.richTextWrap}>
            <RichEditor
              ref={richRef}
              initialContentHTML={String(value ?? field.defaultValue ?? '')}
              onChange={(text: string) => setValue(text)}
              placeholder={field.label}
              initialHeight={normalized(160)}
              editorStyle={{
                backgroundColor: colors.Background,
                color: colors.Heading_Txt,
                placeholderColor: colors.Desc_Txt,
              }}
            />
          </View>
        </>
      );

    case 'file': {
      const currentFiles = getFiles(value);
      const maxFiles = field.multiple ? toNumberOrNull(field.maxFiles) ?? 5 : 1;
      const maxFileSize = toNumberOrNull(field.maxFileSize);
      const maxFileSizeBytes =
        maxFileSize !== null ? maxFileSize * 1000000 : undefined;
      const fileText =
        maxFiles === 1 ? 'Up to 1 file' : `Up to ${maxFiles} files`;
      const sizeText = maxFileSize !== null ? `Max ${maxFileSize}MB each` : '';
      const helperText = [fileText, sizeText].filter(Boolean).join(' · ');

      return (
        <AppAttachmentPicker
          limit={maxFiles}
          maxSize={maxFileSizeBytes}
          text1="Choose Files to Upload"
          text2={helperText}
          defaultValue={currentFiles}
          onSelect={async (files: any) => {
            const selectedFiles = Array.isArray(files) ? files : [];
            try {
              const copiedFiles = await Promise.all(
                selectedFiles.map((file: any) =>
                  copyAttachmentToAppStorage(file),
                ),
              );
              setValue(field.multiple ? copiedFiles : copiedFiles[0] ?? null);
            } catch (err) {
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.error,
                  message: 'Unable to copy attachment to app storage.',
                }),
              );
            }
          }}
          isError={Boolean(error)}
        />
      );
    }

    case 'signature':
      return (
        <SignatureScreen
          onSignatureAdded={(signature: string) => setValue(signature)}
          isError={Boolean(error)}
        />
      );

    case 'location':
      return (
        <CustomGooglePlacesInput
          apiKey={PLACE_API_KEY}
          value={String(value ?? '')}
          countryRestriction={
            context?.countryRestriction ?? baseData?.countryCode?.toLowerCase()
          }
          country={context?.country ?? baseData?.country}
          onChangeText={(address: string) => setValue(address)}
          onPlaceSelected={(place: any) => setValue(place?.address ?? '')}
          onError={(err: any) => {
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.warning,
                message: err?.message || 'Address search failed',
              }),
            );
          }}
          placeholder="Search Address"
          placeholderColor={error ? colors.Error : colors.Desc_Txt}
          debounceMs={context?.debounceMs ?? 300}
          minLength={2}
          maxResults={context?.maxResults ?? 6}
          inputStyle={[
            styles.placesInput,
            {
              backgroundColor: error ? colors.redLight : colors.Background,
              borderColor: error ? colors.Error : colors.BorderColor,
            },
          ]}
        />
      );

    case 'autocomplete':
      return (
        <CustomInput
          placeholder={field.label}
          value={String(value ?? '')}
          setValue={setValue}
          errorMsg={error}
        />
      );

    case 'array': {
      const arr = Array.isArray(value) ? value : [''];
      return (
        <View style={styles.optionWrap}>
          {arr.map((item, index) => (
            <CustomInput
              key={`${getFieldKey(field)}-${index}`}
              placeholder={`${field.label} ${index + 1}`}
              value={String(item ?? '')}
              setValue={(text: string) => {
                const next = [...arr];
                next[index] = text;
                setValue(next);
              }}
            />
          ))}
        </View>
      );
    }

    case 'group':
      return (
        <View style={styles.groupBox}>
          <CustomInput
            placeholder="Name"
            value={String(value?.name ?? '')}
            setValue={(text: string) => setValue({...value, name: text})}
          />
          <CustomInput
            placeholder="Email"
            value={String(value?.email ?? '')}
            setValue={(text: string) => setValue({...value, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      );

    case 'color':
    default:
      return (
        <CustomInput
          placeholder={field.label}
          value={String(value ?? '')}
          setValue={setValue}
          errorMsg={error}
        />
      );
  }
};

const DynamicFormView = forwardRef<DynamicFormViewRef, DynamicFormViewProps>(
  (
    {
      fields: rawFields,
      initialValues = {},
      context,
      timeOfQuestions,
      submitText = 'Submit',
      backText = 'Back',
      loading = false,
      showButtons = true,
      contentStyle,
      onBack,
      onSubmit,
    },
    ref,
  ) => {
    const colors = useSelector(
      (state: AppRootStore) => state.SliceReducer.themeColors,
    );
    const styles = useMemo(
      () => ({...makeStyles(colors), ...AppStyles(colors)}),
      [colors],
    );

    const scopedFields = useMemo(() => {
      if (!timeOfQuestions) return rawFields;
      return rawFields.filter(field => {
        const phase = field?.raw?.timeOfQuestion ?? field?.timeOfQuestion;
        return phase === timeOfQuestions; // strict match only, no fallback
      });
    }, [rawFields, timeOfQuestions]);

    const {visibleFields, values, errors, setFieldValue, validate} =
      useDynamicForm(scopedFields, initialValues, context);

    const handleSubmit = () => {
      if (!validate()) return false;
      onSubmit(values, visibleFields);
      return true;
    };
    useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmit,
        validate,
        getValues: () => values,
        getActiveFields: () => visibleFields,
      }),
      [handleSubmit, validate, values, visibleFields],
    );

    return (
      <View style={[styles.formCont, contentStyle]}>
        {visibleFields.map(field => {
          const key = getFieldKey(field);
          const isDisplayOnly =
            field.type === 'heading' || field.type === 'paragraph';
          const error = errors[key];

          return (
            <View key={key} style={styles.fieldWrap}>
              {!isDisplayOnly ? (
                <Text style={styles.Input_Heading}>
                  {field.label} {field.required ? '*' : ''}
                </Text>
              ) : null}

              <DynamicFieldRenderer
                field={field}
                value={values[key]}
                error={error}
                onChange={setFieldValue}
                context={context}
              />
              {!!error && !isDisplayOnly ? (
                <Text style={styles.errorTxt}>{error}</Text>
              ) : null}
            </View>
          );
        })}
        {showButtons ? (
          <View style={styles.btnRow}>
            {!!onBack && (
              <View style={styles.btnCont}>
                <SimpleButton
                  text={backText}
                  onPress={onBack}
                  loading={false}
                />
              </View>
            )}

            <View style={styles.btnCont}>
              <CustomButton
                text={submitText}
                onPress={() => {
                  handleSubmit();
                }}
                loading={loading}
              />
            </View>
          </View>
        ) : null}
      </View>
    );
  },
);

export default DynamicFormView;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    formCont: {
      width: '100%',
    },
    fieldWrap: {
      marginBottom: normalized(14),
    },
    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
    },
    flexItem: {
      flex: 1,
    },
    optionWrap: {
      gap: normalized(8),
      marginTop: normalized(4),
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: normalized(10),
      minHeight: normalized(37),
      paddingVertical: normalized(4),
    },
    checkboxTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
      flex: 1,
      flexWrap: 'wrap',
      lineHeight: normalized(18),
    },
    richTextWrap: {
      height: normalized(170),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      overflow: 'hidden',
      marginTop: normalized(8),
    },
    errorTxt: {
      marginTop: normalized(3),
      color: colors.ToastColors?.Error ?? colors.Error,
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuRegular,
      marginBottom: normalized(4),
    },
    placesInput: {
      borderWidth: 1,
      height: normalized(45),
      borderRadius: normalized(8),
      backgroundColor: colors.Background,
    },
    emptyOptionsBox: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      paddingVertical: normalized(12),
      paddingHorizontal: normalized(10),
      backgroundColor: colors.Background,
    },
    emptyOptionsTxt: {
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    groupBox: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(10),
      padding: normalized(10),
      gap: normalized(8),
    },
    headingText: {
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginVertical: normalized(8),
    },
    paragraphText: {
      fontSize: normalized(14),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      lineHeight: normalized(20),
      marginBottom: normalized(8),
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(12),
      marginTop: normalized(20),
      marginBottom: normalized(20),
    },
    btnCont: {
      flex: 1,
    },
  });
