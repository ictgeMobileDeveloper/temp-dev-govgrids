import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import Modal from 'react-native-modal';
import {normalized, ScreenSize, THEME_LIST} from '../../Utils/AppConstants';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CloseIcon from '../Svg/CloseIcon';
import {setDarkTheme, setSystemDefault} from '../../Redux/AppReducers';
import {setDataInAsync} from '../../Utils/AsyncStorage';
import {AsyncKeyStrings} from '../../Utils/AppStrings';

const ThemeModal = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const systemScheme = useColorScheme();

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
        width: '100%',
      }}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.box}>
        <View style={styles.headingCont}>
          <Text style={styles.Modal_Heading_Txt}>Select Theme</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={props?.onClose}
            style={styles.closeCont}>
            <CloseIcon primary={colors.Desc_Txt} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={{gap: normalized(10)}}>
          {THEME_LIST.map((item: any, index: any) => {
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.btnCont}
                onPress={() => {
                  if (item?.id == 1) {
                    dispatch(setSystemDefault(false));
                    dispatch(setDarkTheme(false));
                    setDataInAsync(AsyncKeyStrings.theme, {theme: 'light'});
                  } else if (item?.id == 2) {
                    dispatch(setSystemDefault(false));
                    dispatch(setDarkTheme(true));
                    setDataInAsync(AsyncKeyStrings.theme, {theme: 'dark'});
                  } else {
                    dispatch(setSystemDefault(true));
                    setDataInAsync(AsyncKeyStrings.theme, {
                      theme: 'systemDefault',
                    });
                    // dispatch(
                    //   setDarkTheme(systemScheme == 'dark' ? true : false),
                    // );
                  }
                  props?.onClose();
                }}>
                <Text style={styles.Input_Heading}>{item?.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
};

export default ThemeModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    box: {
      width: '90%',
      paddingVertical: normalized(20),
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
      borderColor: colors.BorderColor,
      borderWidth: 1.5,
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
  });
