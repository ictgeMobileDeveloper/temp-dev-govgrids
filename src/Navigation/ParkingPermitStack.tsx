import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {Routes} from '../Utils/Routes';

import PPPersonalInfoScreen from '../UI/ParkingPermit/ParkingPermitFormStack/ParkingPersonalInfo';
import PermitDetailScreen from '../UI/ParkingPermit/ParkingPermitFormStack//PermitDetails';
import ParkingPermitFormScreen from '../UI/ParkingPermit/ParkingPermitFormStack//ParkingPermitFormScreen';
import ParkingPermitTermsNCondiScreen from '../UI/ParkingPermit/ParkingPermitFormStack//ParkingPermitTermsNCondiScreen';
import ParkingPermitGuestSubmission from '../UI/ParkingPermit/ParkingPermitFormStack/ParkingPermitSubmission';
import PPSubmitReqScreen from '../UI/ParkingPermit/ParkingPermitRequestSubmit';
import ParkingPermitCompanyForm from '../UI/ParkingPermit/ParkingCompanyFormStack/ParkingCompany';
import ParkingPermitCompanyVehiclesScreen from '../UI/ParkingPermit/ParkingCompanyFormStack/CompanyVehicleScreen';

const Stack = createStackNavigator();

const PPStack = ({
  site,
  zone,
  category,
  isCompany,
  companyId,
}: {
  site: any;
  zone: any;
  category: string;
  isCompany: boolean;
  companyId: string;
}) => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.ParkingPermit.PersonalInfo}
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen
        name={Routes.ParkingPermit.PersonalInfo}
        component={PPPersonalInfoScreen}
        initialParams={{isCompany}}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.PermitDetail}
        component={PermitDetailScreen}
        initialParams={{site, zone, category}}
      />

      <Stack.Screen
        name={Routes.ParkingPermit.FormSubmit}
        component={ParkingPermitFormScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.TermsNCondi}
        component={ParkingPermitTermsNCondiScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.GuestSubmission}
        component={ParkingPermitGuestSubmission}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.RequestSubmit}
        component={PPSubmitReqScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.CompanyForm}
        component={ParkingPermitCompanyForm}
        initialParams={{isCompany, companyId}}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.CompanyVehicle}
        component={ParkingPermitCompanyVehiclesScreen}
        initialParams={{isCompany, companyId}}
      />
    </Stack.Navigator>
  );
};

export default PPStack;

const styles = StyleSheet.create({});
