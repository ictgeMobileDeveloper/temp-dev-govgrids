import React, {useMemo, useState} from 'react';
import {Modal, Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {normalized} from '../../../Utils/AppConstants';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomDropDownList from '../../Components/CustomDropDownList';
import SimpleButton from '../../Components/SimpleButton';
import CustomButton from '../../Components/CustomButton';
import {updateParkingSessionInStore} from '../../../Network/Services/ParkingSessionService';

const EXTEND_OPTIONS_MINUTES = [15, 30, 60, 120, 240];

const formatMinutesLabel = (mins: number) => {
  if (mins < 60) return `${mins} minutes`;
  const hrs = mins / 60;
  return `${hrs} hour${hrs > 1 ? 's' : ''}`;
};

interface ExtendSessionModalProps {
  visible: boolean;
  onClose: () => void;
  maxMinutes: number;
  onContinue: (additionalMinutes: number) => void;
  isLoading?: boolean;
  colors: any;
}

const ExtendSessionModal = ({
  visible,
  onClose,
  maxMinutes,
  onContinue,
  isLoading,
  colors,
}: ExtendSessionModalProps) => {
  const appStyles = useMemo(() => AppStyles(colors), [colors]);
  const styles = useMemo(() => makeLocalStyles(colors), [colors]);
  const availableOptions = useMemo(
    () => EXTEND_OPTIONS_MINUTES.filter(m => m <= maxMinutes),
    [maxMinutes],
  );
  const dropdownItems: {name: string}[] = EXTEND_OPTIONS_MINUTES.map(m => ({
    name: formatMinutesLabel(m),
  }));

  // const dropdownItems: {name: string}[] = useMemo(
  //   () => availableOptions.map(m => ({name: formatMinutesLabel(m)})),
  //   [availableOptions],
  // );

  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
    undefined,
  );
  const [errorMsg, setErrorMsg] = useState('');
  const handleContinue = () => {
    if (selectedIndex == null) {
      setErrorMsg('Please select additional time');
      return;
    }

    setErrorMsg('');
    onContinue(EXTEND_OPTIONS_MINUTES[selectedIndex]);
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={appStyles.rowCont}>
            <Text style={appStyles.Modal_Heading_Txt}>Request Extension</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{color: colors.TextPrimary}}>✕</Text>
            </TouchableOpacity>
          </View>

          {EXTEND_OPTIONS_MINUTES.length === 0 ? (
            <Text style={appStyles.keyTxt}>
              No additional time available to extend this session.
            </Text>
          ) : (
            <>
              <Text style={appStyles.Input_Heading}>Additional Time *</Text>

              <CustomDropDownList
                list={dropdownItems}
                selectedIndex={selectedIndex}
                onChange={i => {
                  setSelectedIndex(i);
                  setErrorMsg('');
                }}
                placeholder="Select duration"
                error={!!errorMsg}
              />
              {!!errorMsg && (
                <Text
                  style={{
                    color: colors.ToastColors.Error,
                    marginTop: normalized(4),
                  }}>
                  {errorMsg}
                </Text>
              )}
            </>
          )}

          <View style={styles.footerSpacer} />

          <CustomButton
            text={isLoading ? 'Please wait...' : 'Continue to Payment'}
            onPress={handleContinue}
            disabled={isLoading}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ExtendSessionModal;

// Only styles not already covered by AppStyles live here
const makeLocalStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: normalized(20),
    },

    sheet: {
      width: '100%',
      maxWidth: normalized(420),
      backgroundColor: colors.Background,
      borderRadius: normalized(16),
      padding: normalized(20),
    },

    closeBtn: {
      width: normalized(28),
      height: normalized(28),
      borderRadius: normalized(14),
      backgroundColor: colors.BorderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },

    footerSpacer: {
      height: normalized(20),
    },
  });
