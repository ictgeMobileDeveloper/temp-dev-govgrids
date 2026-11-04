import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {Routes} from '../Utils/Routes';
import LoginScreen from '../UI/Auth/LoginScreen';
import SignupScreen from '../UI/Auth/SignupScreen';
import MainScreen from '../UI/Auth/MainScreen';
import StaffHomeScreen from '../UI/Staff/StaffHomeScreen';
import OtpScreen from '../UI/Auth/OtpScreen';
import HelpDeskLoginScreen from '../UI/Auth/HelpDeskLoginScreen';
import HelpDeskOtpScreen from '../UI/Auth/HelpDeskOtpScreen';
import ResidentHomeScreen from '../UI/Resident/ResidentHomeScreen';
import FOIARequestScreen from '../UI/FOIA/FOIARequestScreen';
import FOIANewReqScreen from '../UI/FOIA/FOIANewReqScreen';
import WalkInNewReqScreen from '../UI/FOIA/WalkInNewReqScreen';
import WalkInReqDetailScreen from '../UI/FOIA/WalkInReqDetailScreen';
import PropertyScreen from '../UI/ProperSalesLookup/PropertyScreen';
import PropertyDetailScreen from '../UI/ProperSalesLookup/PropertyDetailScreen';

import ParkingPermitScreen from '../UI/ParkingPermit/ParkingPermitScreen';
import ParkingPermitTermsNCondiScreen from '../UI/ParkingPermit/ParkingPermitFormStack/ParkingPermitTermsNCondiScreen';

const Stack = createStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.MainScreen}
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen name={Routes.MainScreen} component={MainScreen} />
      <Stack.Screen name={Routes.Auth.Login} component={LoginScreen} />
      <Stack.Screen name={Routes.Auth.Signup} component={SignupScreen} />
      <Stack.Screen
        name={Routes.Staff.HomeScreen}
        component={StaffHomeScreen}
      />
      <Stack.Screen
        name={Routes.Auth.HelpDeskLoginScreen}
        component={HelpDeskLoginScreen}
      />
      <Stack.Screen
        name={Routes.Auth.HelpDeskOtpScreen}
        component={HelpDeskOtpScreen}
      />
      <Stack.Screen name={Routes.Auth.Otp} component={OtpScreen} />
      <Stack.Screen
        name={Routes.Resident.HomeScreen}
        component={ResidentHomeScreen}
      />
      <Stack.Screen
        name={Routes.FOIA.RequestScreen}
        component={FOIARequestScreen}
      />
      <Stack.Screen
        name={Routes.FOIA.NewReqScreen}
        component={FOIANewReqScreen}
      />
      <Stack.Screen
        name={Routes.FOIA.WalkInReqScreen}
        component={WalkInNewReqScreen}
      />
      <Stack.Screen
        name={Routes.FOIA.WalkInReqDetailScreen}
        component={WalkInReqDetailScreen}
      />
      <Stack.Screen
        name={Routes.Property.SalesLookupScreen}
        component={PropertyScreen}
      />
      <Stack.Screen
        name={Routes.Property.DetailScreen}
        component={PropertyDetailScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.HomeScreen}
        component={ParkingPermitScreen}
      />
    </Stack.Navigator>
  );
};
