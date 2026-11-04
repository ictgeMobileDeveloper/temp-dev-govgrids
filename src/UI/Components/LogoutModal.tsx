import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import Modal from 'react-native-modal';
import {normalized, ScreenSize} from '../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CloseIcon from '../Svg/CloseIcon';
import SimpleButton from './SimpleButton';
import CustomButton from './CustomButton';

const LogoutModal = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const title = props?.title ?? 'Logout';
  const message = props?.message ?? 'Are you sure you want to log out?';
  const confirmText = props?.confirmText ?? 'Logout';
  const onConfirm = props?.onConfirm ?? props?.onLogout;
  const confirmButtonStyle = props?.confirmButtonStyle;

  return (
    <Modal
      isVisible={props?.isVisible}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}
      animationInTiming={400}
      animationOutTiming={400}
      style={{
        // backgroundColor: 'red',
        height: ScreenSize.height,
        width: ScreenSize.width,
      }}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.box}>
        <View style={styles.headingCont}>
          <Text style={styles.Modal_Heading_Txt}>{title}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={props?.onClose}
            style={styles.closeCont}>
            <CloseIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={{gap: normalized(10)}}>
          <View style={{marginHorizontal: normalized(20)}}>
            <Text style={styles.Input_Heading}>{message}</Text>
          </View>
          <View style={styles.buttons}>
            <View style={styles.nextBtnCont}>
              <SimpleButton
                text={'Cancel'}
                onPress={() => props?.onClose()}
                loading={false}
              />
            </View>
            <View style={styles.nextBtnCont}>
              <CustomButton
                text={confirmText}
                onPress={onConfirm}
                loading={false}
                style={confirmButtonStyle}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    box: {
      width: '90%',
      paddingVertical: normalized(20),
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
    },
    headingCont: {
      alignItems: 'center',
      marginHorizontal: normalized(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    closeCont: {
      width: normalized(30),
      height: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      backgroundColor: colors.Grey_2,
      width: '100%',
      height: normalized(1),
      marginVertical: normalized(12),
      alignSelf: 'center',
    },
    btnCont: {
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.Grey_2,
      justifyContent: 'center',
      marginHorizontal: normalized(20),
      paddingHorizontal: normalized(16),
    },
    buttons: {
      width: normalized(200),
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      alignSelf: 'flex-end',
    },
    nextBtnCont: {
      width: normalized(90),
    },
  });
