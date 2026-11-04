import {StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {normalized} from '../../Utils/AppConstants';
import {AppRootStore} from '../../Redux/AppStore';
import {useSelector} from 'react-redux';
import {AppStyles} from '../../Utils/AppStyles';
import SignatureCanvas from 'react-native-signature-canvas';

const SignatureComp = ({onSignatureAdded}: any) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const ref = useRef<any>(null);
  const [signature, setSignature] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [readyToAdd, setReadyToAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    <View style={styles.cont}>
      <SignatureCanvas
        ref={ref}
        onOK={handleSignatureOK}
        onEmpty={handleEmpty}
        onBegin={handleBegin}
        onEnd={handleEnd}
        descriptionText="Sign here"
        clearText="Clear"
        confirmText="Save"
        autoClear={false}
        penColor="#000000"
        backgroundColor="rgba(255,255,255,0)"
        // Hide the built-in footer buttons so we control UX:
        webStyle={`
                  .m-signature-pad--footer { display: none; }
                  .m-signature-pad { box-shadow: none; border: 0; }
                `}
      />
    </View>
  );
};

export default SignatureComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      width: '100%',
      height: normalized(106),
      borderWidth: 1,
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
      borderColor: colors.BorderColor,
    },
  });
