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
import ServiceCategoryScreen from '../UI/HelpDesk/Screens/ServiceCategoryScreen';
import ServiceCatalogScreen from '../UI/HelpDesk/Screens/ServiceCatalogScreen';
import FormSubmissionScreen from '../UI/HelpDesk/Screens/FormSubmissionScreen';

const Stack = createStackNavigator();

export const HelpDeskServiceStack = (props: any) => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.HelpDesk.ServiceCategoryScreen}
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}>
      <Stack.Screen
        name={Routes.HelpDesk.ServiceCategoryScreen}
        component={ServiceCategoryScreen}
        initialParams={{props}}
      />
      <Stack.Screen
        name={Routes.HelpDesk.ServiceCatalogScreen}
        component={ServiceCatalogScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.FormSubmissionScreen}
        component={FormSubmissionScreen}
      />
    </Stack.Navigator>
  );
};
