import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  AppState,
} from 'react-native';
import {DeviceEventEmitter} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../../Utils/AppConstants';
import {useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {Billing_Card_Type, Billing_Types_Type} from '../../../Utils/AppStrings';
import {Routes} from '../../../Utils/Routes';
import BillingCard from '../Component/BillingDeskCard';
import CustomHeader from '../../Components/CustomHeader';

const BillingTypeScreen = (props: ScreenProps) => {
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

  const {code} = props.route?.params || {};

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
        text={'Billing Type'}
        desc={'View sub-modules for this billing type.'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: AppHorizontalMargin,
          paddingBottom: normalized(30),
        }}>
        {code === 'PDI' && (
          <BillingCard
            type={Billing_Types_Type.Jobs}
            isBillingType
            onPress={() =>
              props?.navigation?.navigate(Routes.PoliceDuty.BillingJobListing)
            }
          />
        )}

        <BillingCard
          type={Billing_Types_Type.Invoices}
          isBillingType
          onPress={() =>
            props?.navigation?.navigate(Routes.PoliceDuty.InvoiceScreen, {
              code: code,
            })
          }
        />
      </ScrollView>
    </View>
  );
};

export default BillingTypeScreen;

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
    createTicketBtn: {
      height: normalized(40),
      borderRadius: normalized(10),
      backgroundColor: colors.Primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: normalized(22),
      marginTop: normalized(16),
    },

    createTicketTxt: {
      fontSize: normalized(15),
      color: colors.White,
      fontFamily: AppFonts.UbuntuBold,
    },

    createTicketArrow: {
      fontSize: normalized(42),
      color: colors.White,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(-4),
    },
  });
