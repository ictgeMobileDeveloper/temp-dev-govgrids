import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {Routes} from '../Utils/Routes';
import AutismPersonalInfoScreen from '../UI/Sections/Autism/AutismPersonalInfoScreen';
import AutismRequiredDataScreen from '../UI/Sections/Autism/AutismRequiredDataScreen';
import AutismFeaturesScreen from '../UI/Sections/Autism/AutismFeaturesScreen';
import AutismMedicalScreen from '../UI/Sections/Autism/AutismMedicalScreen';
import AutismInformationScreen from '../UI/Sections/Autism/AutismInformationScreen';
import AutismAdditinalInfoScreen from '../UI/Sections/Autism/AutismAdditinalInfoScreen';

const Stack = createStackNavigator();

export const AutismStack = (props: any) => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.AutismSafety.PersonalInfoScreen}
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen
        name={Routes.AutismSafety.PersonalInfoScreen}
        component={AutismPersonalInfoScreen}
        initialParams={{props}}
      />
      <Stack.Screen
        name={Routes.AutismSafety.RequiredDataScreen}
        component={AutismRequiredDataScreen}
      />
      <Stack.Screen
        name={Routes.AutismSafety.FeaturesScreen}
        component={AutismFeaturesScreen}
      />
      <Stack.Screen
        name={Routes.AutismSafety.MedicalScreen}
        component={AutismMedicalScreen}
      />
      <Stack.Screen
        name={Routes.AutismSafety.InformationScreen}
        component={AutismInformationScreen}
      />
      <Stack.Screen
        name={Routes.AutismSafety.AdditionalInfoScreen}
        component={AutismAdditinalInfoScreen}
      />
    </Stack.Navigator>
  );
};
