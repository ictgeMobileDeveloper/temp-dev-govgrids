import {useEffect, useMemo, useState} from 'react';
import {
  DynamicField,
  DynamicFormContext,
  DynamicFormErrors,
  DynamicFormValues,
  getFieldKey,
  getInitialFieldValue,
  isFieldVisible,
  normalizeDynamicFields,
  validateDynamicForm,
} from './DynamicFormCore';

export const useDynamicForm = (
  rawFields: any[] = [],
  initialValues: DynamicFormValues = {},
  context?: DynamicFormContext,
) => {
  const fields = useMemo<DynamicField[]>(
    () => normalizeDynamicFields(rawFields),
    [rawFields],
  );

  const [values, setValues] = useState<DynamicFormValues>(() => {
    const nextValues: DynamicFormValues = {};

    fields.forEach(field => {
      const key = getFieldKey(field);
      nextValues[key] =
        initialValues[key] !== undefined
          ? initialValues[key]
          : getInitialFieldValue(field);
    });

    return nextValues;
  });

  const [errors, setErrors] = useState<DynamicFormErrors>({});

  useEffect(() => {
    setValues(prev => {
      let hasChange = false;
      const nextValues = {...prev};

      fields.forEach(field => {
        const key = getFieldKey(field);

        if (nextValues[key] !== undefined) return;

        if (field.type !== 'date' && field.type !== 'time') return;

        nextValues[key] =
          initialValues[key] !== undefined
            ? initialValues[key]
            : getInitialFieldValue(field);
        hasChange = true;
      });

      return hasChange ? nextValues : prev;
    });
  }, [fields, initialValues]);

  const setFieldValue = (field: DynamicField, value: any) => {
    const key = getFieldKey(field);
    setValues(prev => ({...prev, [key]: value}));
    setErrors(prev => ({...prev, [key]: ''}));
  };

  const validate = () => {
    const nextErrors = validateDynamicForm(fields, values, context);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const visibleFields = useMemo(
    () => fields.filter(field => isFieldVisible(fields, values, field)),
    [fields, values],
  );

  return {
    fields,
    visibleFields,
    values,
    errors,
    setValues,
    setErrors,
    setFieldValue,
    validate,
  };
};
