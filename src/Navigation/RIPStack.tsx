import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { Routes } from "../Utils/Routes";
import RIPChooseCatScreen from "../UI/ResidentIssuePortal/RIPChooseCatScreen";
import RIPChooseLocScreen from "../UI/ResidentIssuePortal/RIPChooseLocScreen";
import RIPSubmiReqDetailScreen from "../UI/ResidentIssuePortal/RIPSubmiReqDetailScreen";
import RIPUploadPicScreen from "../UI/ResidentIssuePortal/RIPUploadPicScreen";
import RIPSubmitScreen from "../UI/ResidentIssuePortal/RIPSubmitScreen";

const Stack = createStackNavigator();


export const RIPStack = (props: any) => {

    return (
        <Stack.Navigator
            initialRouteName={Routes.RIP.ChooseCategory}
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}>
            <Stack.Screen name={Routes.RIP.ChooseCategory} component={RIPChooseCatScreen} />
            <Stack.Screen name={Routes.RIP.ChooseLocation} component={RIPChooseLocScreen} />
            <Stack.Screen name={Routes.RIP.submitReqDetail} component={RIPSubmiReqDetailScreen} />
            <Stack.Screen name={Routes.RIP.UploadPic} component={RIPUploadPicScreen} />
            <Stack.Screen name={Routes.RIP.SubmitScreen} component={RIPSubmitScreen} />
        </Stack.Navigator>
    )
}