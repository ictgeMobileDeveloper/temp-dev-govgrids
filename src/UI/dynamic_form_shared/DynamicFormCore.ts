import {allowOnlyNumbers, isEmailValid} from '../../Utils/Helper';

export const DYNAMIC_FIELD_TYPE = {
  text: 'text',
  textarea: 'textarea',
  richtext: 'richtext',
  email: 'email',
  phoneNumber: 'phone-number',
  url: 'url',
  integer: 'integer',
  decimal: 'decimal',
  number: 'number',
  date: 'date',
  time: 'time',
  datetime: 'datetime',
  dropdown: 'dropdown',
  pulldownSelect: 'pulldownSelect',
  multiselect: 'multiselect',
  cascading: 'cascading',
  autocomplete: 'autocomplete',
  location: 'location',
  checkbox: 'checkbox',
  singleCheckbox: 'single-checkbox',
  radio: 'radio',
  file: 'file',
  signature: 'signature',
  color: 'color',
  heading: 'heading',
  paragraph: 'paragraph',
  group: 'group',
  array: 'array',
  messageOrNote: 'messageOrNote',
} as const;

export type DynamicFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'email'
  | 'phone-number'
  | 'url'
  | 'integer'
  | 'decimal'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'dropdown'
  | 'pulldownSelect'
  | 'multiselect'
  | 'cascading'
  | 'autocomplete'
  | 'location'
  | 'checkbox'
  | 'single-checkbox'
  | 'radio'
  | 'file'
  | 'signature'
  | 'color'
  | 'heading'
  | 'paragraph'
  | 'group'
  | 'array'
  | 'messageOrNote';

export type DynamicOption =
  | string
  | number
  | {
      id?: string | number;
      value?: string | number;
      label?: string;
      name?: string;
      title?: string;
      display?: string;
      txt?: string;
      children?: DynamicOption[];
      options?: DynamicOption[];
    };

export type DynamicOptionGroup = {
  id?: string | number;
  name: string;
  options: DynamicOption[];
};

export type DynamicField = {
  id: number | string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  multiple?: boolean;
  defaultValue?: any;
  order?: number;
  enabled?: boolean;
  fieldWidth?: string;
  colClass?: string;
  internalUseOnly?: boolean;
  displayAnswerPublicly?: boolean;
  receiveResponse?: boolean;
  showInSummary?: boolean;
  showPreview?: boolean;
  options?: DynamicOption[];
  answerOptions?: DynamicOption[];
  optionGroups?: DynamicOptionGroup[];
  minLength?: number | string | null;
  maxLength?: number | string | null;
  pattern?: string | null;
  minNumber?: number | string | null;
  maxNumber?: number | string | null;
  minDate?: string | null;
  maxDate?: string | null;
  minDaysFromToday?: number | string | null;
  minSelections?: number | string | null;
  maxSelections?: number | string | null;
  accept?: string | string[] | null;
  maxFileSize?: number | string | null;
  maxFiles?: number | string | null;
  enableCondition?: boolean;
  conditionalLogic?: any;
  enableConditionalValidation?: boolean;
  conditionalValidation?: any;
  fields?: DynamicField[];
  arrayConfig?: {
    itemFields?: DynamicField[];
    minItems?: number | string | null;
    maxItems?: number | string | null;
  };
  raw?: any;
};

export type DynamicFormValues = Record<string, any>;
export type DynamicFormErrors = Record<string, string>;

export type DynamicFormContext = {
  baseData?: any;
  countryRestriction?: string;
  country?: string;
  maxResults?: number;
  debounceMs?: number;
  defaultRadioOptions?: DynamicOption[];
  fileSizeUnit?: 'bytes' | 'mb';
};

export const getFieldKey = (field: DynamicField) => String(field.id);

export const stripHtml = (text: any) =>
  String(text ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

export const escapeHtml = (value: any) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const toNumberOrNull = (value: any) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const getOptionLabel = (option: DynamicOption) => {
  if (typeof option === 'object' && option !== null) {
    const nestedName = (option as any)?.value?.name;
    const nestedValue = (option as any)?.value?.value;
    const fallbackValue =
      typeof option.value === 'object' ? undefined : option.value;

    return String(
      option.label ??
        option.name ??
        option.title ??
        option.display ??
        option.txt ??
        nestedName ??
        nestedValue ??
        fallbackValue ??
        option.id ??
        '',
    );
  }
  return String(option ?? '');
};

export const getOptionHeading = (optionGroup: DynamicOption) => {
  return getOptionLabel(optionGroup);
};

export const getOptionValue = (option: DynamicOption) => {
  if (typeof option === 'object' && option !== null) {
    const nestedValue = (option as any)?.value?.value;
    const nestedName = (option as any)?.value?.name;
    const fallbackValue =
      typeof option.value === 'object' ? undefined : option.value;

    return String(
      nestedValue ??
        nestedName ??
        fallbackValue ??
        option.id ??
        option.label ??
        option.name ??
        option.title ??
        option.display ??
        option.txt ??
        '',
    );
  }
  return String(option ?? '');
};

export const normalizeOptions = (options: any): DynamicOption[] => {
  if (Array.isArray(options)) return options;
  if (options && typeof options === 'object') return Object.values(options);
  return [];
};

const normalizeFieldOptions = (field: any): DynamicOption[] => {
  const options = normalizeOptions(field.options);
  if (options.length) return options;

  const answerOptions = normalizeOptions(field.answerOptions);
  if (answerOptions.length) return answerOptions;

  const optionGroups = normalizeOptions(field.optionGroups);
  if (String(field.type ?? field.questionType).toLowerCase() === 'cascading') {
    return optionGroups.map((group: any) => {
      const name = getOptionLabel(group);
      const children = normalizeOptions(
        group?.options ?? group?.answerOptions ?? group?.children,
      );
      return group && typeof group === 'object'
        ? {...group, label: name, name, options: children}
        : {value: group, label: name, name, options: children};
    });
  }

  return optionGroups.flatMap((group: any) => {
    const groupOptions = normalizeOptions(
      group?.options ?? group?.answerOptions ?? group?.children,
    );
    if (!groupOptions.length) return [group];

    return groupOptions;
  });
};

const normalizeFieldOptionGroups = (field: any): DynamicOptionGroup[] => {
  if (
    normalizeOptions(field.options).length ||
    normalizeOptions(field.answerOptions).length
  ) {
    return [];
  }

  return normalizeOptions(field.optionGroups).map((group: any) => ({
    ...group,
    name: getOptionHeading(group),
    options: normalizeOptions(
      group?.options ?? group?.answerOptions ?? group?.children,
    ),
  }));
};

export const normalizeFieldType = (type: any): DynamicFieldType => {
  const value = String(type ?? '').trim();
  const lower = value.toLowerCase();

  if (lower === 'shorttext' || lower === 'short_text') return 'text';
  if (lower === 'longtext' || lower === 'long_text') return 'textarea';
  if (lower === 'pulldownselect' || lower === 'select') return 'dropdown';
  if (lower === 'dropdownlist') return 'dropdown';
  if (lower === 'checkboxgroup') return 'checkbox';
  if (lower === 'singleline' || lower === 'single line text') return 'text';
  if (lower === 'multiline' || lower === 'multi-line text') return 'textarea';
  if (lower === 'link/url') return 'url';
  if (lower === 'time') return 'time';
  if (lower === 'phone') return 'phone-number';
  if (lower === 'number') return 'integer';
  if (lower === 'date') return 'date';
  if (lower === 'time') return 'time';
  if (lower === 'datetime') return 'datetime';
  if (lower === 'messageornote') return 'messageOrNote';

  return value as DynamicFieldType;
};

export const normalizeDynamicFields = (fields: any[] = []) => {
  return [...fields]
    .filter(item => item?.enabled !== false)
    .map<DynamicField>(item => ({
      id: item.id,
      label: item.label ?? item.questionPrompt ?? item.name ?? '',
      type: normalizeFieldType(item.type ?? item.questionType),
      required: item.required ?? item.isResponseRequired ?? false,
      multiple: item.multiple ?? false,
      defaultValue: item.defaultValue ?? '',
      order: item.order ?? 0,
      enabled: item.enabled,
      fieldWidth: item.fieldWidth,
      colClass: item.colClass,
      internalUseOnly: item.internalUseOnly,
      displayAnswerPublicly: item.displayAnswerPublicly,
      receiveResponse: item.receiveResponse,
      showInSummary: item.showInSummary,
      showPreview: item.showPreview,
      options: normalizeFieldOptions(item),
      answerOptions: normalizeFieldOptions(item),
      optionGroups: normalizeFieldOptionGroups(item),
      minLength: item.minLength ?? item.answerMinLength,
      maxLength: item.maxLength ?? item.answerMaxLength,
      pattern: item.pattern,
      minNumber: item.minNumber,
      maxNumber: item.maxNumber,
      minDate: item.minDate,
      maxDate: item.maxDate,
      minDaysFromToday: item.minDaysFromToday,
      minSelections: item.minSelections,
      maxSelections: item.maxSelections,
      accept: item.accept,
      maxFileSize: item.maxFileSize,
      maxFiles: item.maxFiles,
      enableCondition: item.enableCondition,
      conditionalLogic: item.conditionalLogic,
      enableConditionalValidation: item.enableConditionalValidation,
      conditionalValidation: item.conditionalValidation,
      fields: item.fields,
      arrayConfig: item.arrayConfig,
      raw: item,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

export const formatDate = (value: any) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatTime = (value: any) => {
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
};

export const parseDateValue = (value: any) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const parseTimeValue = (value: any) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const timeText = String(value).trim();
  const timeMatch = timeText.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const date = new Date();
    date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    return date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const sanitizeInteger = (txt: string) => allowOnlyNumbers(txt);

export const sanitizeDecimal = (txt: string) => {
  const cleaned = txt.replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) +
    cleaned.slice(firstDot + 1).replace(/\./g, '')
  );
};

export const parseAccept = (accept: any): string[] => {
  if (!accept) return [];
  if (Array.isArray(accept)) return accept.map(String).filter(Boolean);
  if (typeof accept === 'string') {
    try {
      const parsed = JSON.parse(accept);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return accept
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const getFiles = (value: any) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const toUploadFile = (file: any) => {
  if (!file?.uri) return null;
  const uri = String(file.uri);
  const uploadUri =
    uri.startsWith('file://') || uri.startsWith('content://')
      ? uri
      : `file://${uri}`;

  return {
    uri: uploadUri,
    type: file.type || 'application/octet-stream',
    name: file.filename || file.name || `upload-${Date.now()}`,
  } as any;
};

export const isArrayLikeField = (field: DynamicField) =>
  field.multiple ||
  field.type === 'checkbox' ||
  field.type === 'multiselect' ||
  (field.type === 'file' && field.multiple);

export const isEmptyValue = (value: any) => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'boolean') return value === false;
  if (value instanceof Date) return Number.isNaN(value.getTime());
  if (typeof value === 'object' && value !== null) {
    if ('date' in value || 'time' in value) {
      return (
        !String(value.date ?? '').trim() && !String(value.time ?? '').trim()
      );
    }
    if ('address' in value) return !String(value.address ?? '').trim();
    return Object.keys(value).length === 0;
  }
  return !String(value ?? '').trim();
};

export const getInitialFieldValue = (field: DynamicField) => {
  if (
    field.defaultValue !== null &&
    field.defaultValue !== undefined &&
    field.defaultValue !== ''
  ) {
    if (isArrayLikeField(field) && field.type !== 'file') {
      return Array.isArray(field.defaultValue)
        ? field.defaultValue
        : [field.defaultValue];
    }
    return field.defaultValue;
  }

  if (field.type === 'checkbox' || field.type === 'multiselect') return [];
  if (field.type === 'single-checkbox') return false;
  if (field.type === 'file') return field.multiple ? [] : null;
  if (field.type === 'date' || field.type === 'time') return '';
  if (field.type === 'datetime') return {date: '', time: ''};
  if (field.type === 'color') return '#01BD91';
  if (field.type === 'array') return [''];
  if (field.type === 'group') return {};
  if (field.multiple) return [];
  return '';
};

const getCascadingChildOptions = (
  field: DynamicField,
  parentValue: any,
): DynamicOption[] | null => {
  const parent = (field.options ?? []).find(
    option => getOptionValue(option) === String(parentValue ?? ''),
  );
  if (!parent) return null;
  if (typeof parent !== 'object') return [];
  return normalizeOptions(parent.options ?? parent.children);
};

export const getComparableValue = (
  field: DynamicField,
  values: DynamicFormValues,
) => {
  const value = values[getFieldKey(field)];
  if (field.type === 'cascading') {
    const childValue =
      value && typeof value === 'object'
        ? value.childValue ?? value.child?.value ?? value.child?.id
        : undefined;
    if (
      childValue !== undefined &&
      childValue !== null &&
      String(childValue).trim()
    ) {
      return String(childValue).trim();
    }
    const parentValue =
      value && typeof value === 'object' ? value.parentValue : value;
    const childOptions = getCascadingChildOptions(field, parentValue);
    if (childOptions === null) {
      return value && typeof value === 'object'
        ? ''
        : String(parentValue ?? '').trim();
    }
    return childOptions.length ? '' : String(parentValue ?? '').trim();
  }
  if (Array.isArray(value)) return value.map(item => String(item ?? '').trim());
  if (value instanceof Date) return formatDate(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value && typeof value === 'object' && 'value' in value) {
    return String(value.value ?? '').trim();
  }
  return String(value ?? '').trim();
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, days: number) => {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);
  return next;
};

const parseValidDate = (value: any) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
};

const getFieldByConditionName = (fields: DynamicField[], name: any) => {
  const target = String(name ?? '').trim();
  return fields.find(
    field => String(field.id) === target || String(field.label) === target,
  );
};

export const evaluateCondition = (
  fields: DynamicField[],
  values: DynamicFormValues,
  condition: any,
) => {
  const sourceField = getFieldByConditionName(fields, condition?.field);
  if (!sourceField) return false;

  const sourceValue = getComparableValue(sourceField, values);
  const expectedValue = String(condition?.value ?? '').trim();
  const operator = String(condition?.operator ?? 'equals').toLowerCase();

  if (Array.isArray(sourceValue)) {
    if (operator === 'equals' || operator === 'contains') {
      return sourceValue.includes(expectedValue);
    }
    if (operator === 'not_equals' || operator === 'not equals') {
      return !sourceValue.includes(expectedValue);
    }
    return false;
  }

  switch (operator) {
    case 'equals':
    case 'equal':
    case 'is':
      return sourceValue === expectedValue;
    case 'not_equals':
    case 'not equals':
    case 'not_equal':
    case 'is not':
      return sourceValue !== expectedValue;
    case 'contains':
      return sourceValue.includes(expectedValue);
    case 'not_contains':
    case 'not contains':
      return !sourceValue.includes(expectedValue);
    case 'greater_than':
    case 'greater than':
      return Number(sourceValue) > Number(expectedValue);
    case 'less_than':
    case 'less than':
      return Number(sourceValue) < Number(expectedValue);
    default:
      return sourceValue === expectedValue;
  }
};

export const isFieldVisible = (
  fields: DynamicField[],
  values: DynamicFormValues,
  field: DynamicField,
) => {
  if (!field.enableCondition) return true;
  const logic = field.conditionalLogic ?? {};
  const conditions = Array.isArray(logic.conditions) ? logic.conditions : [];
  if (!conditions.length) return true;
  const matchType = String(logic.matchType ?? 'all').toLowerCase();
  const shouldShow = String(logic.show ?? 'show').toLowerCase() === 'show';
  const matched =
    matchType === 'any'
      ? conditions.some((condition: any) =>
          evaluateCondition(fields, values, condition),
        )
      : conditions.every((condition: any) =>
          evaluateCondition(fields, values, condition),
        );
  return shouldShow ? matched : !matched;
};

export const getEffectiveField = (
  fields: DynamicField[],
  values: DynamicFormValues,
  field: DynamicField,
) => {
  if (!field.enableConditionalValidation) return field;
  const rules = Array.isArray(field.conditionalValidation?.rules)
    ? field.conditionalValidation.rules
    : [];
  const matchedRule = rules.find((rule: any) =>
    evaluateCondition(fields, values, rule?.condition ?? rule),
  );
  if (!matchedRule) return field;
  const overrides = matchedRule?.validation ?? matchedRule;
  return {...field, ...overrides};
};

const getRequiredError = (field: DynamicField, value: any) => {
  if (!field.required) return '';
  if (field.type === 'cascading') {
    const parentValue = value?.parentValue;
    const childValue = value?.childValue;
    if (
      parentValue === undefined ||
      parentValue === null ||
      String(parentValue).trim() === ''
    ) {
      return `${field.label} is required`;
    }
    const childOptions = getCascadingChildOptions(field, parentValue);
    if (
      (childOptions === null || childOptions.length > 0) &&
      (childValue === undefined ||
        childValue === null ||
        String(childValue).trim() === '')
    ) {
      return `${field.label} is required`;
    }
    return '';
  }
  return isEmptyValue(value) ? `${field.label} is required` : '';
};

const getTextError = (field: DynamicField, value: any) => {
  const textTypes = [
    'text',
    'textarea',
    'richtext',
    'email',
    'phone-number',
    'url',
    'messageOrNote',
  ];
  if (!textTypes.includes(field.type)) return '';
  const text =
    field.type === 'richtext' ? stripHtml(value) : String(value ?? '').trim();
  if (!text) return '';
  const minLength = toNumberOrNull(field.minLength);
  const maxLength = toNumberOrNull(field.maxLength);
  if (minLength !== null && text.length < minLength) {
    return `${field.label} must be at least ${minLength} characters.`;
  }
  if (maxLength !== null && text.length > maxLength) {
    return `${field.label} must be less than or equal to ${maxLength} characters.`;
  }
  if (field.type === 'email' && !isEmailValid(text)) {
    return 'Enter a valid email address.';
  }
  if (
    field.type === 'url' &&
    !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(text)
  ) {
    return 'Enter a valid URL.';
  }
  if (field.type === 'phone-number' && text.replace(/\D/g, '').length < 10) {
    return 'Enter a valid phone number.';
  }
  if (field.pattern) {
    try {
      const regex = new RegExp(field.pattern);
      if (!regex.test(text)) return `${field.label} format is invalid.`;
    } catch {}
  }
  return '';
};

const getNumberError = (field: DynamicField, value: any) => {
  if (!['integer', 'decimal', 'number'].includes(field.type)) return '';
  const text = String(value ?? '').trim();
  if (!text) return '';
  const numberValue = Number(text);
  if (Number.isNaN(numberValue))
    return `${field.label} must be a valid number.`;
  const minNumber = toNumberOrNull(field.minNumber);
  const maxNumber = toNumberOrNull(field.maxNumber);
  if (
    minNumber !== null &&
    maxNumber !== null &&
    (numberValue < minNumber || numberValue > maxNumber)
  ) {
    return `${field.label} must be within ${minNumber} to ${maxNumber}.`;
  }
  if (minNumber !== null && numberValue < minNumber) {
    return `${field.label} must be at least ${minNumber}.`;
  }
  if (maxNumber !== null && numberValue > maxNumber) {
    return `${field.label} must be less than or equal to ${maxNumber}.`;
  }
  return '';
};

const getDateError = (field: DynamicField, value: any) => {
  if (field.type !== 'date') return '';
  if (!value) return '';
  const selectedDate = parseValidDate(value);
  if (!selectedDate) {
    return 'Enter a valid date.';
  }
  const minDate = parseValidDate(field.minDate);
  const maxDate = parseValidDate(field.maxDate);
  const minDays = toNumberOrNull(field.minDaysFromToday);
  const minDaysDate =
    minDays !== null && minDays > 0 ? addDays(new Date(), minDays) : null;
  if (
    minDate &&
    maxDate &&
    (selectedDate < minDate || selectedDate > maxDate)
  ) {
    return `${field.label} must be within ${formatDate(
      minDate,
    )} to ${formatDate(maxDate)}.`;
  }
  if (minDate && selectedDate < minDate) {
    return `${field.label} must be on or after ${formatDate(minDate)}.`;
  }
  if (maxDate && selectedDate > maxDate) {
    return `${field.label} must be on or before ${formatDate(maxDate)}.`;
  }
  if (minDaysDate && selectedDate < minDaysDate) {
    return `${field.label} must be at least ${minDays} days from today.`;
  }
  return '';
};

const getTimeError = (field: DynamicField, value: any) => {
  if (field.type !== 'time') return '';
  if (!value) return '';
  const parsedTime = parseTimeValue(value);
  return parsedTime ? '' : 'Enter a valid time.';
};

const getSelectionError = (field: DynamicField, value: any) => {
  if (
    !['checkbox', 'multiselect', 'dropdown', 'cascading', 'radio'].includes(
      field.type,
    )
  ) {
    return '';
  }
  if (!Array.isArray(value)) return '';
  const minSelections = toNumberOrNull(field.minSelections);
  const maxSelections = toNumberOrNull(field.maxSelections);
  if (minSelections !== null && value.length < minSelections) {
    return `Select at least ${minSelections} option(s).`;
  }
  if (maxSelections !== null && value.length > maxSelections) {
    return `Select no more than ${maxSelections} option(s).`;
  }
  return '';
};

const getFileError = (
  field: DynamicField,
  value: any,
  context?: DynamicFormContext,
) => {
  if (field.type !== 'file') return '';
  const files = getFiles(value);
  const maxFiles = toNumberOrNull(field.maxFiles);
  const rawMaxFileSize = toNumberOrNull(field.maxFileSize);
  const maxFileSize =
    rawMaxFileSize !== null && context?.fileSizeUnit !== 'bytes'
      ? rawMaxFileSize * 1000000
      : rawMaxFileSize;
  const acceptedTypes = parseAccept(field.accept);
  if (maxFiles !== null && files.length > maxFiles) {
    return `You can upload up to ${maxFiles} file(s).`;
  }
  for (const file of files) {
    const size = Number(file?.size ?? file?.fileSize ?? 0);
    const type = String(file?.type ?? '').toLowerCase();
    const name = String(file?.name ?? file?.filename ?? '').toLowerCase();
    if (maxFileSize !== null && size > maxFileSize) {
      return `File size must be less than ${Math.round(
        maxFileSize / 1000000,
      )} MB.`;
    }
    if (acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(raw => {
        const accepted = String(raw).toLowerCase();
        if (accepted.endsWith('/*'))
          return type.startsWith(accepted.replace('/*', '/'));
        if (accepted.startsWith('.')) return name.endsWith(accepted);
        return type === accepted || name.endsWith(accepted);
      });
      if (!isAccepted) return 'Selected file type is not allowed.';
    }
  }
  return '';
};

export const getDynamicFieldError = (
  fields: DynamicField[],
  values: DynamicFormValues,
  field: DynamicField,
  context?: DynamicFormContext,
) => {
  const effectiveField = getEffectiveField(fields, values, field);
  const value = values[getFieldKey(field)];
  return (
    getRequiredError(effectiveField, value) ||
    getTextError(effectiveField, value) ||
    getNumberError(effectiveField, value) ||
    getDateError(effectiveField, value) ||
    getTimeError(effectiveField, value) ||
    getSelectionError(effectiveField, value) ||
    getFileError(effectiveField, value, context)
  );
};

export const validateDynamicForm = (
  fields: DynamicField[],
  values: DynamicFormValues,
  context?: DynamicFormContext,
) => {
  const errors: DynamicFormErrors = {};
  fields.forEach(field => {
    if (!isFieldVisible(fields, values, field)) return;
    const error = getDynamicFieldError(fields, values, field, context);
    if (error) errors[getFieldKey(field)] = error;
  });
  return errors;
};

export const getDisplayValue = (field: DynamicField, value: any) => {
  const options = Array.isArray(field.options) ? field.options : [];
  if (field.type === 'file' || field.type === 'signature') return '';
  if (field.type === 'date') return formatDate(value);
  if (field.type === 'time') return formatTime(value);
  if (field.type === 'single-checkbox') return value ? 'Yes' : 'No';
  if (field.type === 'richtext') return stripHtml(value);
  if (field.type === 'cascading') {
    if (!value || typeof value !== 'object') {
      const parentOption = (field.options ?? []).find(
        option => getOptionValue(option) === String(value ?? ''),
      );
      if (getCascadingChildOptions(field, value)?.length) return '';
      return parentOption ? getOptionLabel(parentOption) : String(value ?? '');
    }
    const parentValue = value.parentValue;
    const childValue = value.childValue;
    if (childValue !== undefined && childValue !== null && String(childValue)) {
      const childOption = getCascadingChildOptions(field, parentValue)?.find(
        option => getOptionValue(option) === String(childValue),
      );
      return String(
        value.childLabel ||
          (childOption ? getOptionLabel(childOption) : childValue),
      );
    }
    if (getCascadingChildOptions(field, parentValue)?.length) return '';
    const parentOption = (field.options ?? []).find(
      option => getOptionValue(option) === String(parentValue ?? ''),
    );
    return String(
      value.parentLabel ||
        (parentOption ? getOptionLabel(parentOption) : parentValue ?? ''),
    );
  }
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (item && typeof item === 'object' && 'label' in item) {
          return String(item.label ?? '');
        }
        const scalarItem = getAnswerScalarValue(item);
        const matched = options.find(
          option => getOptionValue(option) === String(scalarItem),
        );
        return matched ? getOptionLabel(matched) : String(scalarItem ?? '');
      })
      .filter(Boolean)
      .join(', ');
  }
  if (
    ['dropdown', 'radio', 'cascading', 'pulldownSelect'].includes(field.type)
  ) {
    const scalarValue =
      value && typeof value === 'object' && 'value' in value
        ? value.value
        : value;
    const matched = options.find(
      option => getOptionValue(option) === String(scalarValue ?? ''),
    );
    if (value && typeof value === 'object' && 'label' in value) {
      return String(value.label ?? '');
    }
    return matched ? getOptionLabel(matched) : String(value ?? '');
  }
  if (field.type === 'datetime') {
    return [formatDate(value?.date), formatTime(value?.time)]
      .filter(Boolean)
      .join(' ');
  }
  return String(value ?? '');
};

export const serializeDynamicValue = (value: any): any => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeDynamicValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((next: any, key) => {
      next[key] = serializeDynamicValue(value[key]);
      return next;
    }, {});
  }
  return value;
};

export const serializeDynamicFormValues = (values: DynamicFormValues) => {
  return Object.keys(values ?? {}).reduce((next: DynamicFormValues, key) => {
    next[key] = serializeDynamicValue(values[key]);
    return next;
  }, {});
};

export const getAnswerScalarValue = (value: any) => {
  if (value && typeof value === 'object' && 'value' in value) {
    return value.value;
  }
  return value;
};

export const buildRipAnswers = (
  fields: DynamicField[],
  values: DynamicFormValues,
) => {
  return fields.map(field => {
    const rawValue = values[getFieldKey(field)];
    const value = getAnswerScalarValue(rawValue);
    if (field.type === 'file') {
      const fileNames = getFiles(rawValue)
        .map((file: any) => file?.name ?? file?.filename ?? file?.uri ?? '')
        .filter(Boolean);

      return {
        question: field.id,
        answer: field.multiple ? fileNames : fileNames[0] ?? '',
      };
    }
    if (field.type === 'checkbox') {
      return {
        question: field.id,
        answer: getDisplayValue(field, rawValue) || '',
      };
    }
    if (
      field.type === 'pulldownSelect' ||
      field.type === 'dropdown' ||
      field.type === 'multiselect' ||
      field.type === 'cascading'
    ) {
      return {
        question: field.id,
        answer: getDisplayValue(field, rawValue) || '',
      };
    }
    if (field.type === 'date' || field.type === 'datetime') {
      return {
        question: field.id,
        answer: value ? new Date(value?.date ?? value).toString() : '',
      };
    }
    if (field.type === 'time') {
      return {
        question: field.id,
        answer: value ? serializeDynamicValue(value) : '',
      };
    }
    return {question: field.id, answer: serializeDynamicValue(value) ?? ''};
  });
};

export const appendHelpDeskCustomFields = (
  formData: FormData,
  fields: DynamicField[],
  values: DynamicFormValues,
) => {
  let customFieldIndex = 0;
  fields.forEach(field => {
    const rawValue = values[getFieldKey(field)];
    const value =
      field.type === 'cascading'
        ? getDisplayValue(field, rawValue)
        : getAnswerScalarValue(rawValue);
    if (value === undefined || value === null || value === '') return;
    const valuesToAppend =
      field.multiple && field.type !== 'file'
        ? Array.isArray(value)
          ? value
          : [value]
        : [value];
    valuesToAppend.forEach(item => {
      const itemValue = getAnswerScalarValue(item);
      if (itemValue === undefined || itemValue === null || itemValue === '')
        return;
      formData.append(
        `customFields[${customFieldIndex}][fieldId]`,
        String(field.id),
      );
      if (field.type === 'file') {
        getFiles(item).forEach((file: any, fileIndex: number) => {
          const uploadFile = toUploadFile(file);
          if (!uploadFile) return;
          const key = field.multiple
            ? `customFields[${customFieldIndex}][file][${fileIndex}]`
            : `customFields[${customFieldIndex}][file]`;
          formData.append(key, uploadFile);
        });
      } else {
        formData.append(
          `customFields[${customFieldIndex}][value]`,
          String(itemValue ?? ''),
        );
      }
      customFieldIndex += 1;
    });
  });
  return formData;
};

export const buildGeneralFormDescriptionHtml = (
  fields: DynamicField[],
  values: DynamicFormValues,
) => {
  const rows = fields
    .map(field => {
      const displayValue = getDisplayValue(field, values[getFieldKey(field)]);
      if (!displayValue) return '';
      const rowClass =
        field.type === 'textarea' || field.type === 'richtext'
          ? 'service-description-block-row'
          : 'service-description-row';
      const valueClass =
        field.type === 'textarea' || field.type === 'richtext'
          ? 'service-description-block-value'
          : 'service-description-value';
      return `
        <div class="${rowClass}">
          <span class="service-description-label">${escapeHtml(
            field.label,
          )}</span>
          <span class="${valueClass}">${escapeHtml(displayValue)}</span>
        </div>`;
    })
    .join('');

  return `
    <div class="service-description-wrapper">
      <div class="service-description-banner">Submitted via Public Form</div>
      <div class="service-description-content">${rows}</div>
    </div>`;
};

export const buildGeneralFormData = ({
  form,
  fields,
  values,
}: {
  form: any;
  fields: DynamicField[];
  values: DynamicFormValues;
}) => {
  const formData = new FormData();
  formData.append('formId', String(form?.id ?? form?.formId ?? ''));
  formData.append('portal', 'public');
  formData.append(
    'description',
    buildGeneralFormDescriptionHtml(fields, values),
  );

  fields.forEach((field, index) => {
    const value = values[getFieldKey(field)];
    formData.append(`answers[${index}][fieldId]`, String(field.id));
    if (field.type === 'file') {
      const uploadFile = toUploadFile(getFiles(value)[0]);
      if (uploadFile) {
        formData.append(`answers[${index}][file]`, uploadFile);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, valueIndex) => {
        formData.append(
          `answers[${index}][value][${valueIndex}]`,
          String(getAnswerScalarValue(item)),
        );
      });
      return;
    }
    const rawAnswerValue =
      field.type === 'cascading'
        ? getDisplayValue(field, value)
        : field.type === 'date'
        ? formatDate(value)
        : field.type === 'time'
        ? formatTime(value)
        : field.type === 'single-checkbox'
        ? value
          ? 'true'
          : ''
        : value;
    const answerValue = getAnswerScalarValue(rawAnswerValue);
    formData.append(`answers[${index}][value]`, String(answerValue ?? ''));
  });

  return formData;
};
