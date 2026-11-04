import React, {useRef, useState, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppColors, normalized} from '../../Utils/AppConstants';

const SignatureScreen = ({onSignatureAdded, isError}: any) => {
  const [signature, setSignature] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [readyToAdd, setReadyToAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const ref = useRef<any>(null);

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const {width: winW, height: winH} = useWindowDimensions();
  const isTab = Math.min(winW, winH) >= 600;
  const canvasHeight = isTab ? 400 : normalized(280);

  const handleSignatureOK = useCallback(
    (dataUrl: any) => {
      setSignature(dataUrl);
      setIsSaving(false);
      setReadyToAdd(false);
      setModalVisible(false);
      if (typeof onSignatureAdded === 'function') {
        onSignatureAdded(dataUrl);
      }
    },
    [onSignatureAdded],
  );

  const handleEmpty = () => {
    setIsSaving(false);
    setReadyToAdd(false);
  };

  const handleClearInside = () => {
    setReadyToAdd(false);
    ref.current?.clearSignature();
  };

  const handleBegin = () => {
    setReadyToAdd(false);
  };

  const handleEnd = () => {
    setReadyToAdd(true);
  };

  const handleAddSignaturePress = () => {
    if (!ref.current) return;
    setIsSaving(true);
    ref.current.readSignature();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.preview,
          {
            backgroundColor: isError ? colors.redLight : colors.Background,
            borderColor: isError ? colors.ToastColors.Error : colors.Grey_2,
          },
        ]}>
        {signature ? (
          <Image
            resizeMode="contain"
            style={{width: 335, height: 114}}
            source={{uri: signature}}
          />
        ) : (
          <Text
            style={[
              styles.placeholder,
              {
                color: isError ? colors.ToastColors.Error : colors.Desc_Txt,
              },
            ]}>
            No signature yet
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.openBtn,
          {
            backgroundColor: colors.Primary,
          },
        ]}>
        <Text style={styles.openBtnText}>
          {signature ? 'Update Signature' : 'Capture Signature'}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sign below</Text>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={10}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.canvasWrap}>
              <SignatureCanvas
                ref={ref}
                key={`${modalVisible}-${winW}-${winH}`}
                onOK={handleSignatureOK}
                onEmpty={handleEmpty}
                onBegin={handleBegin}
                onEnd={handleEnd}
                descriptionText="Sign here"
                clearText="Clear"
                confirmText="Save"
                autoClear={false}
                penColor={colors.Grey_2}
                backgroundColor="rgba(255,255,255,0)"
                // Hide the built-in footer buttons so we control UX:
                webStyle={`
      .m-signature-pad--footer { display: none; }
      .m-signature-pad { box-shadow: none; border: 0; margin: 0; width: 100%; height: 100%; left: 0; top: 0; }
      .m-signature-pad--body { left: 0; right: 0; top: 0; bottom: 0; border: 0; }
      .m-signature-pad--body canvas { width: 100%; height: 100%; }
      body, html { width: 100%; height: 100%; margin: 0; }
    `}
              />
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleClearInside}
                style={[styles.actionBtn, styles.clearBtn]}>
                <Text style={styles.actionBtnText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!readyToAdd || isSaving}
                onPress={handleAddSignaturePress}
                style={[
                  styles.actionBtn,
                  styles.addBtn,
                  (!readyToAdd || isSaving) && styles.disabledBtn,
                ]}>
                <Text style={styles.actionBtnText}>
                  {isSaving ? 'Processing…' : 'Add Signature'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* -------------------------------------------------------------------- */}
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    },
    preview: {
      width: '100%',
      height: normalized(140),
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: normalized(12),
      overflow: 'hidden',
    },
    placeholder: {
      color: AppColors.Grey_2,
      fontSize: normalized(13),
    },
    openBtn: {
      marginTop: normalized(12),
      backgroundColor: colors.Primary,
      paddingVertical: normalized(12),
      paddingHorizontal: normalized(16),
      borderRadius: normalized(10),
      alignSelf: 'flex-end',
    },
    openBtnText: {
      color: 'white',
      fontWeight: '600',
    },

    // Modal styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: colors.Background,
      borderTopLeftRadius: normalized(16),
      borderTopRightRadius: normalized(16),
      paddingBottom: Platform.select({ios: 24, android: 16}),
      paddingHorizontal: normalized(16),
      paddingTop: normalized(12),
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: normalized(8),
    },
    modalTitle: {
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      fontWeight: '600',
    },
    closeText: {
      fontSize: normalized(14),
      color: colors.Primary,
      fontWeight: '600',
    },
    canvasWrap: {
      height: normalized(280),
      borderRadius: normalized(12),
      overflow: 'hidden',
      backgroundColor: 'white',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: AppColors.Grey_2,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
      justifyContent: 'flex-end',
    },
    actionBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    clearBtn: {
      backgroundColor: '#d00',
    },
    addBtn: {
      backgroundColor: colors.Primary,
    },
    disabledBtn: {
      opacity: 0.6,
    },
    actionBtnText: {
      color: AppColors.White,
      fontWeight: '700',
    },
  });

export default SignatureScreen;
