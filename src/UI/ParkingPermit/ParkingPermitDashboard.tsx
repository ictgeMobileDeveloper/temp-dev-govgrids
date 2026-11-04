import {Platform, ScrollView, StatusBar, StyleSheet, View} from 'react-native';

import React, {useEffect, useMemo, useState} from 'react';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {ENDPOINTS} from '../../Network/Urls';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  Cart_Rental_Card_Type,
  Parking_Permit_Card_Type,
} from '../../Utils/AppStrings';

import {Routes} from '../../Utils/Routes';

import CustomHeader from '../Components/CustomHeader';
import ParkingPermitCard from './Components/ParkingPermitCard';
import CartRentalDashboard from '../CartRental/CartRentalDashboard';
import {apiHandler} from '../../Network/Services/ApiHandler';

const ParkingPermitDashboard = (props: ScreenProps) => {
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
  const UserData = selector?.residentUserData;

  const [loading, setLoading] = useState(false);
  const [assosiationEnabled, setAssosiationEnabled] = useState(false);

  useEffect(() => {
    getAssosiationEnabled();
    console.log(assosiationEnabled, 'assosiationEnabled');
  }, []);

  const getAssosiationEnabled = () => {
    if (!UserData) return;
    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.parkingCheckAssosiationEnabled,
      method: 'GET',
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setLoading(false);
        if (resp?.status) {
          if (resp?.data?.data?.hasAssociation === true)
            setAssosiationEnabled(true);
        }
      },
    });
  };
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
        text={'Parking Permit Dashboard'}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: AppHorizontalMargin,
          paddingBottom: normalized(30),
        }}>
        <ParkingPermitCard
          type={Parking_Permit_Card_Type.ParkingSites}
          onPress={() =>
            props?.navigation?.navigate(Routes.ParkingPermit.ParkingTypes)
          }
        />
        <ParkingPermitCard
          type={Parking_Permit_Card_Type.ParkingPermits}
          onPress={() => {
            if (UserData) {
              props?.navigation?.navigate(Routes.ParkingPermit.HomeScreen, {
                type: 'Permits',
              });
            } else {
              props?.navigation?.navigate(Routes.Auth.Login, {
                route: Routes.ParkingPermit.HomeScreen,
                type: 'Permits',
              });
            }
          }}
        />
        <ParkingPermitCard
          type={Parking_Permit_Card_Type.ParkingSession}
          onPress={() => {
            if (UserData) {
              props?.navigation?.navigate(Routes.ParkingPermit.HomeScreen, {
                type: 'Sessions',
              });
            } else {
              props?.navigation?.navigate(Routes.Auth.Login, {
                route: Routes.ParkingPermit.HomeScreen,
                type: 'Sessions',
              });
            }
          }}
        />
        {assosiationEnabled && UserData && (
          <ParkingPermitCard
            type={Parking_Permit_Card_Type.ParkingAssosiation}
            onPress={() => {
              if (UserData) {
                props?.navigation?.navigate(Routes.ParkingPermit.HomeScreen, {
                  isCompany: true,
                });
              } else {
                props?.navigation?.navigate(Routes.Auth.Login, {
                  route: Routes.ParkingPermit.HomeScreen,
                  isCompany: true,
                });
              }
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ParkingPermitDashboard;

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
