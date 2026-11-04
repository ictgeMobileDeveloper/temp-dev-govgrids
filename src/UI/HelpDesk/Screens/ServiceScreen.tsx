import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import React, {useEffect, useMemo} from 'react';
import {normalized, ScreenProps} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {HelpDeskServiceStack} from '../../../Navigation/HelpDeskServiceStack';
import {setIsHelpDeskPopped} from '../../../Redux/AppReducers';

const ServiceScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  useEffect(() => {
    if (selector?.isHelpDeskPopped) {
      props?.navigation?.goBack();
      dispatch(setIsHelpDeskPopped(false));
    }
  }, [dispatch, props?.navigation, selector?.isHelpDeskPopped]);

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
        text={'Service Catalog'}
      />
      <HelpDeskServiceStack />
    </View>
  );
};

export default ServiceScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
