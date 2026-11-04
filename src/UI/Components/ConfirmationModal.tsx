import React from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {useSelector} from 'react-redux';

import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';
import CloseIcon from '../Svg/CloseIcon';
import CustomButton from './CustomButton';

type PaymentAction = {
  text: string;
  onPress?: () => void;
};

type Props = {
  visible: boolean;
  text: string;
  Heading?: string;
  buttonText?: string;
  actions?: PaymentAction[];
  onOk: () => void;
  onClose: () => void;
  showCancel?: boolean;
  onCancel?: () => void;
  onLeft?: () => void;
};

let showModal:
  | ((Heading: string, text: string, actions?: PaymentAction[]) => void)
  | null = null;

export const PaymentAlert = {
  register: (fn: typeof showModal) => {
    showModal = fn;
  },

  show: (Heading: string, text: string, actions?: PaymentAction[]) => {
    if (Platform.OS === 'ios') {
      Alert.alert(Heading, text, actions);
    } else {
      showModal?.(Heading, text, actions);
    }
  },
};

const CustomConfirmModal = ({
  visible,
  text,
  Heading,
  actions = [{text: 'OK'}],
  onClose,
}: Props) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const styles = {
    ...makeStyles(colors),
    ...AppStyles(colors),
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={150}
      animationOutTiming={100}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.content}>
            {Heading && <Text style={styles.heading}>{Heading}</Text>}

            <Text style={styles.text}>{text}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeButton}>
            <CloseIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          {actions.map((action, index) => (
            <View key={index} style={styles.actionButton}>
              <CustomButton
                text={action.text}
                onPress={() => {
                  onClose();
                  action.onPress?.();
                }}
                loading={false}
              />
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default CustomConfirmModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.Background,
      borderRadius: normalized(12),
      padding: normalized(20),
    },

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    content: {
      flex: 1,
    },

    heading: {
      color: colors.Heading_Txt,
      fontSize: normalized(18),
      fontWeight: '600',
      marginBottom: normalized(6),
    },

    text: {
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      lineHeight: normalized(22),
    },

    closeButton: {
      width: normalized(28),
      height: normalized(28),
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: normalized(10),
    },

    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: normalized(10),
      marginTop: normalized(20),
    },

    actionButton: {
      minWidth: normalized(90),
    },
  });
