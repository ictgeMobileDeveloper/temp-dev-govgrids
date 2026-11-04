import React, {useMemo, useState} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from 'react-native';
import moment from 'moment';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import CalendarIcon from '../Svg/CalendarIcon';
import ClockIcon from '../Svg/ClockIcon';
import CustomDatePicker from './CustomDateTimePicker';
import {AppStyles} from '../../Utils/AppStyles';

type Mode = 'date' | 'time';

type Props = {
  mode: Mode;
  dateValue?: Date | null; // controlled (date)
  timeValue?: Date | null; // controlled (time)
  onDateChange?: (d: Date | null) => void;
  onTimeChange?: (t: Date | null) => void;
  placeholderDate?: string;
  placeholderTime?: string;
  errorMsg?: string;
  error?: boolean;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  dateFormat?: string; // default 'DD MMM YYYY'
  timeFormat?: string; // default 'hh:mm A'
  autoCloseAndroid?: boolean; // default true
};

const DateTimeComp: React.FC<Props> = ({
  mode,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  placeholderDate = 'Select Date',
  placeholderTime = 'Select Time',
  errorMsg,
  error,
  disabled = false,
  minimumDate,
  maximumDate,
  dateFormat = 'DD MMM YYYY',
  timeFormat = 'hh:mm A',
  autoCloseAndroid = true,
}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);

  const [internalDate, setInternalDate] = useState<Date | null>(null);
  const [internalTime, setInternalTime] = useState<Date | null>(null);

  const [show, setShow] = useState(false);
  const [tempVal, setTempVal] = useState<Date | null>(null);

  const isDate = mode === 'date';
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const currentVal = isDate
    ? dateValue !== undefined
      ? dateValue
      : internalDate ?? null
    : timeValue !== undefined
    ? timeValue
    : internalTime ?? null;

  const displayText = useMemo(() => {
    if (!currentVal) return isDate ? placeholderDate : placeholderTime;
    return isDate
      ? moment(currentVal).format(dateFormat)
      : moment(currentVal).format(timeFormat);
  }, [
    currentVal,
    isDate,
    placeholderDate,
    placeholderTime,
    dateFormat,
    timeFormat,
  ]);

  const openPicker = () => {
    if (disabled) return;
    setTempVal(currentVal ?? new Date());
    setShow(true);
  };

  const applyChange = (val: Date) => {
    if (isDate) {
      onDateChange?.(val);
      if (dateValue === undefined) setInternalDate(val);
    } else {
      onTimeChange?.(val);
      if (timeValue === undefined) setInternalTime(val);
    }
  };

  return (
    <View style={{position: 'relative'}}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={openPicker}
        disabled={disabled}
        style={[
          styles.inputContainer,
          {
            borderColor:
              errorMsg || error ? colors.ToastColors.Error : colors.BorderColor,
            backgroundColor:
              error || errorMsg ? colors.redLight : colors.Background,
            opacity: disabled ? 0.6 : 1,
          },
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.txt,
            {
              color: errorMsg
                ? colors.ToastColors.Error
                : currentVal
                ? colors.Heading_Txt
                : colors.Desc_Txt,
            },
          ]}>
          {displayText}
        </Text>
        {isDate ? (
          <CalendarIcon
            primary={errorMsg ? colors.ToastColors.Error : colors.Desc_Txt}
          />
        ) : (
          <ClockIcon
            primary={errorMsg ? colors.ToastColors.Error : colors.Desc_Txt}
          />
        )}
      </TouchableOpacity>

      {Platform.OS === 'android' && show ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: normalized(44) + normalized(6),
            zIndex: 999,
          }}>
          <CustomDatePicker
            value={tempVal ? tempVal : new Date()}
            mode={isDate ? 'date' : 'time'}
            onChange={(val: Date) => {
              applyChange(val);
              if (autoCloseAndroid) setShow(false);
            }}
            minimumDate={isDate ? minimumDate : undefined}
            maximumDate={isDate ? maximumDate : undefined}
            iosForceModal={false}
          />
        </View>
      ) : null}

      {/* iOS: TRUE MODAL with wheels (spinner) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent
          animationType="fade"
          onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)} />
          <View style={styles.sheetBg}>
            <View style={[styles.sheet, {backgroundColor: '#FFFFFF01'}]}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.sheetBtn, {color: colors.Desc_Txt}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, {color: colors.Heading_Txt}]}>
                  {isDate ? 'Select Date' : 'Select Time'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    if (tempVal) applyChange(tempVal);
                    setShow(false);
                  }}>
                  <Text style={[styles.sheetBtn, {color: colors.Primary}]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>

              <CustomDatePicker
                value={tempVal ? tempVal : new Date()}
                mode={isDate ? 'date' : 'time'}
                onChange={(val: Date) => setTempVal(val)}
                minimumDate={isDate ? minimumDate : undefined}
                maximumDate={isDate ? maximumDate : undefined}
                iosForceModal
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DateTimeComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: normalized(8),
      width: '100%',
      paddingHorizontal: normalized(10),
      // marginVertical: normalized(6),
      height: normalized(44),
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    txt: {
      fontSize: normalized(15),
      fontFamily: AppFonts.InterRegular,
      color: colors?.Desc_Txt,
    },
    // iOS modal sheet styles
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    sheet: {
      // borderTopLeftRadius: normalized(16),
      // borderTopRightRadius: normalized(16),
      paddingBottom: normalized(16),
      paddingTop: normalized(8),
      borderWidth: 1,
      // borderColor: colors.BorderColor,
      borderTopColor: colors.BorderColor,
      overflow: 'hidden',
    },
    sheetBg: {
      borderTopLeftRadius: normalized(16),
      borderTopRightRadius: normalized(16),
      backgroundColor: colors.Background,
    },
    sheetHeader: {
      height: normalized(44),
      paddingHorizontal: normalized(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sheetBtn: {
      fontSize: normalized(15),
      fontFamily: AppFonts.InterMedium ?? AppFonts.InterRegular,
    },
    sheetTitle: {
      fontSize: normalized(15),
      fontFamily: AppFonts.InterMedium ?? AppFonts.InterRegular,
    },
  });
