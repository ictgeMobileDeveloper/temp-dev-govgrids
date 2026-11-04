import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import {normalized, ScreenSize} from '../../Utils/AppConstants';
import CloseIcon from '../Svg/CloseIcon';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import Modal from 'react-native-modal';

const ViewInvoiceModal = ({isVisible, onClose}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}
      animationInTiming={400}
      animationOutTiming={400}
      style={{
        height: ScreenSize.height,
        width: ScreenSize.width,
      }}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.box}>
        <View style={styles.headingCont}>
          <Text style={styles.Modal_Heading_Txt}>{'Bill Receipt'}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeCont}>
            <CloseIcon
              primary={selector?.isDarkTheme ? colors.White : colors.Black}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ViewInvoiceModal;

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
      marginTop: normalized(12),
      alignSelf: 'center',
    },
  });
