import {
  evaluateCondition,
  getComparableValue,
  getDisplayValue,
  getOptionValue,
  normalizeDynamicFields,
  validateDynamicForm,
} from '../src/UI/dynamic_form_shared/DynamicFormCore';

jest.mock('../src/Utils/Helper', () => ({
  allowOnlyNumbers: jest.fn(),
  isEmailValid: jest.fn(),
}));

describe('normalizeDynamicFields', () => {
  it('keeps cascading groups as parent options with nested child options', () => {
    const [field] = normalizeDynamicFields([
      {
        id: 172,
        label: 'What do you like',
        type: 'cascading',
        options: [],
        optionGroups: [
          {
            id: 'Sweets',
            name: 'Sweets',
            options: [{id: 'gulab jamun', name: 'gulab jamun'}],
          },
          {
            id: 'Chaye / Coffee',
            name: 'Chaye / Coffee',
            options: [{id: 'Coffee', name: 'Coffee'}],
          },
        ],
      },
    ]);

    expect(field.options).toEqual([
      {
        id: 'Sweets',
        name: 'Sweets',
        label: 'Sweets',
        options: [{id: 'gulab jamun', name: 'gulab jamun'}],
      },
      {
        id: 'Chaye / Coffee',
        name: 'Chaye / Coffee',
        label: 'Chaye / Coffee',
        options: [{id: 'Coffee', name: 'Coffee'}],
      },
    ]);

    expect(
      getDisplayValue(field, {
        parentValue: 'Sweets',
        parentLabel: 'Sweets',
        childValue: 'gulab jamun',
        childLabel: 'gulab jamun',
      }),
    ).toBe('gulab jamun');
  });

  it('uses a parent value when that option has no sub-options', () => {
    const [field] = normalizeDynamicFields([
      {
        id: 172,
        label: 'What do you like',
        type: 'cascading',
        required: true,
        optionGroups: [
          {name: 'Sweets', options: [{id: 'gulab jamun', name: 'Gulab jamun'}]},
          {name: 'Fruit', options: []},
        ],
      },
    ]);
    const value = {
      parentValue: 'Fruit',
      parentLabel: 'Fruit',
      childValue: '',
      childLabel: '',
    };

    expect(getComparableValue(field, {'172': value})).toBe('Fruit');
    expect(getDisplayValue(field, value)).toBe('Fruit');
    expect(validateDynamicForm([field], {'172': value})).toEqual({});
  });

  it('uses the child value when the selected parent has sub-options', () => {
    const [field] = normalizeDynamicFields([
      {
        id: 172,
        label: 'What do you like',
        type: 'cascading',
        required: true,
        optionGroups: [
          {name: 'Sweets', options: [{id: 'gulab jamun', name: 'Gulab jamun'}]},
        ],
      },
    ]);
    const parentOnly = {
      parentValue: 'Sweets',
      parentLabel: 'Sweets',
      childValue: '',
      childLabel: '',
    };
    const selected = {
      ...parentOnly,
      childValue: 'gulab jamun',
      childLabel: 'Gulab jamun',
    };

    expect(getComparableValue(field, {'172': parentOnly})).toBe('');
    expect(getDisplayValue(field, parentOnly)).toBe('');
    expect(getComparableValue(field, {'172': 'Sweets'})).toBe('');
    expect(getDisplayValue(field, 'Sweets')).toBe('');
    expect(getComparableValue(field, {'172': selected})).toBe('gulab jamun');
    expect(getDisplayValue(field, selected)).toBe('Gulab jamun');
    expect(getDisplayValue(field, {...selected, childLabel: ''})).toBe(
      'Gulab jamun',
    );
    expect(validateDynamicForm([field], {'172': parentOnly})).toEqual({
      '172': 'What do you like is required',
    });
  });

  it('requires both parent and child selections for a required cascading field', () => {
    const fields = normalizeDynamicFields([
      {
        id: 172,
        label: 'What do you like',
        type: 'cascading',
        required: true,
      },
    ]);

    expect(
      validateDynamicForm(fields, {
        '172': {parentValue: 'Sweets', childValue: ''},
      }),
    ).toEqual({'172': 'What do you like is required'});

    expect(
      validateDynamicForm(fields, {
        '172': {parentValue: 'Sweets', childValue: 'gulab jamun'},
      }),
    ).toEqual({});
  });

  it('evaluates cascading conditions against the selected child value', () => {
    const fields = normalizeDynamicFields([
      {
        id: 172,
        label: 'what do you like',
        type: 'cascading',
      },
    ]);
    const values = {
      '172': {
        parentValue: 'Sweets',
        parentLabel: 'Sweets',
        childValue: 'gulab jaman',
        childLabel: 'gulab jaman',
      },
    };

    expect(
      evaluateCondition(fields, values, {
        field: 'what do you like',
        operator: 'equals',
        value: 'gulab jaman',
      }),
    ).toBe(true);
    expect(
      evaluateCondition(fields, values, {
        field: 'what do you like',
        operator: 'equals',
        value: 'Sweets',
      }),
    ).toBe(false);
  });

  it('keeps flat options when they are provided', () => {
    const [field] = normalizeDynamicFields([
      {
        id: 173,
        label: 'Favorite color',
        type: 'dropdown',
        options: [{id: 'blue', name: 'Blue'}],
        optionGroups: [{name: 'Colors', options: [{id: 'red', name: 'Red'}]}],
      },
    ]);

    expect(field.options).toEqual([{id: 'blue', name: 'Blue'}]);
  });

  it('uses option groups as options for a regular dropdown', () => {
    const [field] = normalizeDynamicFields([
      {
        id: 167,
        label: 'are you intrested in job',
        type: 'dropdown',
        optionType: 'c_custom',
        options: [],
        optionGroups: [
          {
            id: 'Yes/No',
            name: 'Yes/No',
            options: [
              {id: 'Yes', name: 'Yes'},
              {id: 'No', name: 'No'},
            ],
          },
        ],
        defaultValue: 'Yesdsa',
      },
    ]);

    expect(field.type).toBe('dropdown');
    expect(field.optionGroups).toEqual([
      {
        id: 'Yes/No',
        name: 'Yes/No',
        options: [
          {id: 'Yes', name: 'Yes'},
          {id: 'No', name: 'No'},
        ],
      },
    ]);
    expect(field.options).toEqual([
      {id: 'Yes', name: 'Yes'},
      {id: 'No', name: 'No'},
    ]);
    expect(getDisplayValue(field, 'Yes')).toBe('Yes');
    expect(field.defaultValue).toBe('Yesdsa');
  });

  it('preserves multiple dropdown groups in their original order', () => {
    const [field] = normalizeDynamicFields([
      {
        id: 174,
        label: 'City and area',
        type: 'dropdown',
        options: [],
        optionGroups: [
          {id: 'Lahore', name: 'Lahore', options: [{id: 'EME', name: 'EME'}]},
          {
            id: 'Karachi',
            name: 'Karachi',
            options: [{id: 'bhains', name: 'bhains'}],
          },
          {
            id: 'Multan',
            name: 'Multan',
            options: [{id: 'Kannt', name: 'Kannt'}],
          },
        ],
      },
    ]);

    expect(field.optionGroups?.map(group => group.name)).toEqual([
      'Lahore',
      'Karachi',
      'Multan',
    ]);
    expect(field.options?.map(option => getOptionValue(option))).toEqual([
      'EME',
      'bhains',
      'Kannt',
    ]);
  });
});
