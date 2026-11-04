import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';

const NetworkStatusComp = (props: any) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors],
  );
  const isOnline = selector?.isNetConnected;

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: isOnline
            ? AppColors.ToastColors.Success
            : AppColors.ToastColors.Error,
          paddingBottom: 0,
        },
      ]}>
      <StatusBar barStyle={'light-content'} />
      <Text style={styles.txt}>
        {isOnline ? 'Back to Online' : "You're Offline"}
      </Text>
    </View>
  );
};

export default NetworkStatusComp;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    txt: {
      fontSize: normalized(14),
      color: colors.White,
      fontFamily: AppFonts.UbuntuMedium,
      marginVertical: normalized(10),
      alignSelf: 'center',
    },
  });
