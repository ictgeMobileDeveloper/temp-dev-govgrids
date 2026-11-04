import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CloseIcon from '../../Svg/CloseIcon';
import {formatAmountToUSD} from '../../../Utils/Helper';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import CustomInput from '../../Components/CustomInput';
import SimpleButton from '../../Components/SimpleButton';
import {normalized} from '../../../Utils/AppConstants';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomButton from '../../Components/CustomButton';

type PayInvoiceModalProps = {
  visible: boolean;

  balanceDue: number;
  onClose: () => void;

  onPay: (amount: number) => void;
  loading?: boolean;
};

const PayInvoiceModal = ({
  visible,
  balanceDue,
  onClose,
  onPay,
  loading = false,
}: PayInvoiceModalProps) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const handlePay = () => {
    const err = validate(amount);
    if (err) {
      setAmountError(err);
      return;
    }
    onPay(Math.round(Number(amount) * 100) / 100);
  };

  useEffect(() => {
    if (visible) {
      setAmount(balanceDue > 0 ? String(balanceDue) : '');
      setAmountError('');
    }
  }, [visible, balanceDue]);

  const validate = (val: string): string => {
    if (!val.trim() || val === '.') {
      return 'Amount is required';
    }
    const cents = Math.round(Number(val) * 100);
    if (isNaN(cents) || cents <= 0) {
      return 'Enter an amount greater than $0.00';
    }
    if (cents > Math.round(balanceDue * 100)) {
      return `Amount cannot exceed the balance due (${formatAmountToUSD(
        balanceDue,
      )})`;
    }
    return '';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={loading ? undefined : onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.ScreenBackground,
              borderColor: colors.BorderColor,
            },
          ]}>
          <View style={styles.rowCont}>
            <Text style={styles.Modal_Heading_Txt}>Pay Invoice</Text>
            <TouchableOpacity activeOpacity={0.6} onPress={onClose}>
              <CloseIcon primary={colors.Heading_Txt} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
          <View style={{height: normalized(10)}} />
          {/* Description */}
          <Text style={[styles.Desc_Txt_N, {textAlign: 'left'}]}>
            Balance due:
            <Text style={styles.Heading1}>
              {' '}
              {formatAmountToUSD(balanceDue)}
            </Text>
            {'\n'} You can pay the full balance or part of it.
          </Text>

          {/* Amount */}
          <Text style={[styles.Input_Heading, {marginTop: normalized(14)}]}>
            Amount *
          </Text>
          <View style={[styles.Input_Row, {alignItems: 'flex-start'}]}>
            <Text
              style={[styles.Modal_Heading_Txt, {marginTop: normalized(10)}]}>
              $
            </Text>
            <View style={{flex: 1}}>
              <CustomInput
                placeholder="0.00"
                isEditable={!loading}
                keyboardType="decimal-pad"
                value={amount}
                setValue={(val: string) => {
                  let formatted = val.replace(/[^0-9.]/g, '');

                  const parts = formatted.split('.');
                  if (parts.length > 2) {
                    formatted = `${parts[0]}.${parts.slice(1).join('')}`;
                  }

                  if (formatted.includes('.')) {
                    const [whole, decimal] = formatted.split('.');
                    formatted = `${whole}.${decimal.slice(0, 2)}`;
                  }

                  setAmount(formatted);

                  const error = validate(formatted);
                  setAmountError(error);
                }}
              />
              <Text style={styles.errorMsg}>{amountError}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.rowCont, {gap: normalized(5)}]}>
            <View style={{flex: 1, minWidth: 0}}>
              <SimpleButton text={'Cancel'} onPress={onClose} loading={false} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <CustomButton
                text={'Pay Now'}
                onPress={handlePay}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (colors: any, styles: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(20),
    },
    card: {
      width: '100%',
      maxWidth: normalized(420),
      borderWidth: 1,
      borderRadius: normalized(12),
      padding: normalized(20),
    },
    closeBtn: {
      width: normalized(32),
      height: normalized(32),
      borderWidth: 1,
      borderRadius: normalized(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeTxt: {
      fontSize: normalized(14),
    },
    actions: {
      justifyContent: 'flex-end',
      gap: normalized(10),
      marginTop: normalized(20),
    },
    btnWrap: {
      minWidth: normalized(96),
    },
    errorMsg: {
      marginTop: normalized(3),
      color: 'red',
      fontSize: normalized(12),
      marginLeft: normalized(2),
    },
  });

export default PayInvoiceModal;
