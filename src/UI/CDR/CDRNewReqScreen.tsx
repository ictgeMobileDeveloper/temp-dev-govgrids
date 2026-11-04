import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import CDRStack from '../../Navigation/CDRStack';
import {setIsCDRPopped} from '../../Redux/AppReducers';
import {Routes} from '../../Utils/Routes';

const CDRNewReqScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const isOnline = selector?.isNetConnected;
  useEffect(() => {
    if (selector?.isCDRPopped) {
      props?.navigation?.goBack();
      dispatch(setIsCDRPopped(false));
    }
  }, [selector?.isCDRPopped]);
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Submit New Request'}
        onOfflinePress={
          !isOnline
            ? () => props?.navigation?.navigate(Routes.CDR.OfflineReqScreen)
            : undefined
        }
      />

      {<CDRStack />}
    </View>
  );
};

export default CDRNewReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
