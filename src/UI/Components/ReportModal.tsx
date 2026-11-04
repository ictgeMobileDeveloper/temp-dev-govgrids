import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import AppStatusBar from './AppStatusBar';
import CustomInput from './CustomInput';
import SimpleButton from './SimpleButton';
import CustomButton from './CustomButton';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';

const ReportModal = (props: any) => {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const onClose = () => {
    setReason('');
    setReasonError('');
    props?.onClose?.();
  };

  return (
    <Modal
      animationType="slide"
      visible={props?.isShow}
      transparent
      onRequestClose={onClose}>
      <AppStatusBar
        backgroundColor="rgba(0,0,0,0.3)"
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <Pressable style={styles.container} onPress={onClose}>
          <Pressable
            style={styles.alertBox}
            onPress={e => {
              e.stopPropagation();
            }}>
            <Text style={styles.headerTxt}>Report Comment</Text>

            <CustomInput
              placeholder="Please explain why you are reporting this comment (e.g., inappropriate comment, spam, harassment, etc.)"
              value={reason}
              setValue={(val: string) => {
                setReason(val);
                setReasonError('');
              }}
              errorMsg={reasonError}
              isMultiLine
            />

            <View style={styles.btnCont}>
              <View style={{width: normalized(80)}}>
                <SimpleButton
                  text="Cancel"
                  onPress={onClose}
                  style={styles.cancelBtn}
                  textStyle={styles.cancelTxt}
                />
              </View>

              <View style={{width: normalized(140)}}>
                <CustomButton
                  text="Report Comment"
                  onPress={() => {
                    if (!reason?.trim()) {
                      setReasonError('Reason is required');
                      return;
                    }

                    props?.onReport({
                      id: props?.id,
                      reason,
                    });

                    setReason('');
                    setReasonError('');
                  }}
                  loading={false}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReportModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    alertBox: {
      width: '90%',
      backgroundColor: colors.Background,
      borderRadius: normalized(15),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      padding: normalized(14),
    },

    headerTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
      marginBottom: normalized(12),
      textAlign: 'center',
    },

    btnCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: normalized(15),
      alignSelf: 'flex-end',
    },

    cancelBtn: {
      backgroundColor: colors.ScreenBackground,
      borderColor: colors.BorderColor,
    },

    cancelTxt: {
      color: colors.Heading_Txt,
    },
  });
