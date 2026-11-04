import {Platform, ScrollView, StatusBar, StyleSheet, View} from 'react-native';

import React, {useMemo} from 'react';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {Cart_Rental_Card_Type} from '../../Utils/AppStrings';

import {Routes} from '../../Utils/Routes';
import CartRentalCard from './Components/CartRentalCard';
import CustomHeader from '../Components/CustomHeader';

const CartRentalDashboard = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();

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
        text={'City Cart Dashboard'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: AppHorizontalMargin,
          paddingBottom: normalized(30),
        }}>
        <CartRentalCard
          type={Cart_Rental_Card_Type.My_Cart_Requests}
          onFirstPress={() =>
            props?.navigation?.navigate(Routes.CartRental.SubmitReq)
          }
          onPress={() =>
            props?.navigation?.navigate(Routes.CartRental.HomeScreen, {
              navigation: 'CartRequest',
            })
          }
        />

        <CartRentalCard
          type={Cart_Rental_Card_Type.Report_Cart_Damage}
          onFirstPress={() =>
            props?.navigation?.navigate(Routes.CartRental.ReportSubmission, {
              navigation: 'CartDamage',
            })
          }
          onPress={() =>
            props?.navigation?.navigate(Routes.CartRental.HomeScreen, {
              navigation: 'CartDamage',
            })
          }
        />

        <CartRentalCard
          type={Cart_Rental_Card_Type.Return_a_Cart}
          onFirstPress={() =>
            props?.navigation?.navigate(Routes.CartRental.ReportSubmission, {
              navigation: 'CartReturn',
            })
          }
          onPress={() =>
            props?.navigation?.navigate(Routes.CartRental.HomeScreen, {
              navigation: 'CartReturn',
            })
          }
        />
      </ScrollView>
    </View>
  );
};

export default CartRentalDashboard;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
