import React, {useMemo} from 'react';
import {StyleSheet, Platform} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {normalized} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';

type Props = {
  value: Date;
  mode: 'date' | 'time';
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  iosForceModal?: boolean; // 👈 added
};

const CustomDatePicker = ({
  value,
  mode,
  onChange,
  minimumDate,
  maximumDate,
  iosForceModal = false,
}: Props) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector = useSelector((s: AppRootStore) => s.SliceReducer);
  const display =
    Platform.OS === 'ios' ? (iosForceModal ? 'spinner' : 'compact') : 'default';

  return (
    <DateTimePicker
      mode={mode}
      display={display}
      value={value}
      style={styles.datePicker}
      onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) onChange(selectedDate);
      }}
      is24Hour={false}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      textColor={colors.Heading_Txt}
      // themeVariant={'light'}
    />
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    datePicker: {
      alignSelf: 'flex-start',
      opacity: 1,

      // backgroundColor: colors.Background,
      // backgroundColor: 'red',
    },
  });

export default CustomDatePicker;
