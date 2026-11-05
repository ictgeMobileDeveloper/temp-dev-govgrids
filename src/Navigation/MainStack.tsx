import React from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { Routes } from "../Utils/Routes";
import LoginScreen from "../UI/Auth/LoginScreen";
import SignupScreen from "../UI/Auth/SignupScreen";
import MainScreen from "../UI/Auth/MainScreen";
import StaffHomeScreen from "../UI/Staff/StaffHomeScreen";
import OtpScreen from "../UI/Auth/OtpScreen";
import ResidentHomeScreen from "../UI/Resident/ResidentHomeScreen";
import FOIARequestScreen from "../UI/FOIA/FOIARequestScreen";
import FOIANewReqScreen from "../UI/FOIA/FOIANewReqScreen";
import WalkInNewReqScreen from "../UI/FOIA/WalkInNewReqScreen";
import WalkInReqDetailScreen from "../UI/FOIA/WalkInReqDetailScreen";
import PropertyScreen from "../UI/ProperSalesLookup/PropertyScreen";
import PropertyDetailScreen from "../UI/ProperSalesLookup/PropertyDetailScreen";
import ParkingPermitFormScreen from "../UI/ParkingPermit/ParkingPermitFormStack/ParkingPermitFormScreen";
import ParkingPermitScreen from "../UI/ParkingPermit/ParkingPermitScreen";
import PoliceDutyScreen from "../UI/BillingInv/Screens/PoliceDutyScreen";
import FOIAReqDetailScreen from "../UI/FOIA/FOIAReqDetailScreen";
import InvoiceScreen from "../UI/BillingInv/Screens/InvoiceScreen";
import AutismSafetyScreen from "../UI/Sections/Autism/AutismSafetyScreen";
import MapScreen from "../UI/Map/MapScreen";
import RIPHomeScreen from "../UI/ResidentIssuePortal/RIPHomeScreen";
import RIPSubmitReqScreen from "../UI/ResidentIssuePortal/RIPSubmitReqScreen";
import RIPReqDetailScreen from "../UI/ResidentIssuePortal/RIPReqDetailScreen";
import EditProfileScreen from "../UI/Profile/EditProfileScreen";
import TimeKeepingScreen from "../UI/TimeKeeping/TimeKeepingScreen";
import TimeKeepingPortalScreen from "../UI/TimeKeeping/TimeKeepingPortalScreen";
import TimeKeepingNewReqScreen from "../UI/TimeKeeping/TimeKeepingNewReqScreen";
import TimeKeepingRequestsScreen from "../UI/TimeKeeping/TimeKeepingRequestsScreen";
import TimeKeepingHoursScreen from "../UI/TimeKeeping/TimeKeepingHoursScreen";
import SIRHomeScreen from "../UI/SIR/SIRHomeScreen";
import SIRNewReqScreen from "../UI/SIR/SIRNewReqScreen";
import CDRHomeScreen from "../UI/CDR/CDRHomeScreen";
import CDRNewReqScreen from "../UI/CDR/CDRNewReqScreen";
import CDRLoginScreen from "../UI/Auth/CDRLoginScreen";
import SIRLoginScreen from "../UI/Auth/SIRLoginScreen";
import TimeKeepingLoginScreen from "../UI/Auth/TimeKeepingLoginScreen";
import CDROtpScreen from "../UI/Auth/CDROptScreen";
import HelpDeskLoginScreen from "../UI/Auth/HelpDeskLoginScreen";
import HelpDeskOtpScreen from "../UI/Auth/HelpDeskOtpScreen";
import NotificationScreen from "../UI/Notification/NotificationScreen";
import FlagRaisingHomeScreen from "../UI/FalgRaising/FlagRaisingHomeScreen";
import ChangePasswordScreen from "../UI/Auth/ChangePasswordScreen";
import FlagRaisingNewReqScreen from "../UI/FalgRaising/FlagRaisingNewReqScreen";
import FlagRaisingReqDetailScreen from "../UI/FalgRaising/FlagRaisingReqDetailScreen";
import RISMapScreen from "../UI/ResidentIssuePortal/RISMapScreen";
import SIRReqDetailScreen from "../UI/SIR/SIRReqDetailScreen";
import SIRProfileScreen from "../UI/SIR/SIRProfileScreen";
import CDRReqDetailScreen from "../UI/CDR/CDRReqDetailScreen";
import InvoiceDetailScreen from "../UI/BillingInv/Screens/ InvoiceDetailScreen";
import ParkingPermitReqDetailScreen from "../UI/ParkingPermit/ParkingPermitReqDetailScreen";
import PaymentScreen from "../UI/Payment/AddCardScreen";
import StripePaymentScreen from "../UI/FOIA/StripePaymentScreen";
import CartRentalHomeScreen from "../UI/CartRental/CartRentalHomeScreen";
import CartRentalSubmitReq from "../UI/CartRental/CartRentalSubmitReq";
import CartRentalDetailScreen from "../UI/CartRental/CartRentalDetailScreen";
import DAMLoginScreen from "../UI/DAM/DAMLoginScreen";
import DAMHomeScreen from "../UI/DAM/DAMHomeScreen";
import DAMOtpScreen from "../UI/DAM/DAMOtpScreen";
import JobDetailScreen from "../UI/DAM/JobDetailScreen";
import TaskListScreen from "../UI/DAM/TaskListScreen";
import TaskDetailScreen from "../UI/DAM/TaskDetailScreen";
import VersionsScreen from "../UI/DAM/VersionsScreen";
import ParkingPermitTermsNCondiScreen from "../UI/ParkingPermit/ParkingPermitFormStack/ParkingPermitTermsNCondiScreen";
import ParkingPermitOfflineReqScreen from "../UI/ParkingPermit/ParkingPermitOfflineReqScreen";
import ForgotPasswordScreen from "../UI/Auth/ForgotPasswordScreen";
import TimeKeepingLedgerScreen from "../UI/TimeKeeping/TimeKeepingLedgerScreen";
import FOIAOfflineReqScreen from "../UI/FOIA/FOIAOfflineReqScreen";
import HelpDeskHomeScreen from "../UI/HelpDesk/Screens/HelpDeskHomeScreen";
import SIROfflineReqScreen from "../UI/SIR/SIROfflineReqScreen";
import CDROfflineReqScreen from "../UI/CDR/CDROfflineReqScreen";
import AutismOfflineReqScreen from "../UI/Sections/Autism/AutismOfflineReqScreen";
import TicketsScreen from "../UI/HelpDesk/Screens/TicketsScreen";
import ApprovalScreen from "../UI/HelpDesk/Screens/ApprovalScreen";
import ServiceScreen from "../UI/HelpDesk/Screens/ServiceScreen";
import KnowledgeScreen from "../UI/HelpDesk/Screens/KnowledgeScreen";
import KnowlegeArticleDetail from "../UI/HelpDesk/Screens/KnowlegeArticleDetail";
import TicketDetailScreen from "../UI/HelpDesk/Screens/TicketDetailScreen";
import CityHelpScreen from "../UI/HelpDesk/Screens/CityHelpScreen";
import { useSelector } from "react-redux";
import { AppRootStore } from "../Redux/AppStore";
import VoterWardScreen from "../UI/VoterWard/VoterWardScreen";
import GeneralFormSubmissionScreen from "../UI/GenralForms/GeneralFormSubmission";
import GenralFormScreen from "../UI/GenralForms/GenralFormScreen";
import VenderHomeScreen from "../UI/Vendor/VenderHomeScreen";
import BillingHomeScreen from "../UI/BillingInv/Screens/BillingHomeScreen";
import SubmitJobScreen from "../UI/BillingInv/Screens/PoliceDutyForm";
import BillingJobListing from "../UI/BillingInv/Screens/BillingJobListing";
import BillingJobDetails from "../UI/BillingInv/Screens/BillingJobDetail";
import BillingTypeScreen from "../UI/BillingInv/Screens/BillingType";
import CartRentalDashboard from "../UI/CartRental/CartRentalDashboard";
import CartRentalReportSubmission from "../UI/CartRental/CartRentalDRForm";
import CartRentalReportDetail from "../UI/CartRental/CartRentalReportDetails";
import DocumentsListScreen from "../UI/Components/DocumentListScreen";
import SIROtpScreen from "../UI/Auth/SIROtpScreen";
import SAMLCallbackScreen from "../UI/Auth/SAMLCallbackScreen";
import SSOWebViewScreen from "../UI/Auth/SSOWebViewScreen";
import EventHomeScreen from "../UI/Event/EventHomeScreen";
import EventDetailsScreen from "../UI/Event/EventDetailScreen";
import ParkingPermitDashboard from "../UI/ParkingPermit/ParkingPermitDashboard";
import ParkingSitesScreen from "../UI/ParkingPermit/ParkingPermitSite";
import PermitDetailScreen from "../UI/ParkingPermit/ParkingPermitFormStack/PermitDetails";
import PPPersonalInfoScreen from "../UI/ParkingPermit/ParkingPermitFormStack/ParkingPersonalInfo";
import PPSubmitReqScreen from "../UI/ParkingPermit/ParkingPermitRequestSubmit";
import FlagRaisingTermsNCondiScreen from "../UI/FalgRaising/FlagRaisingTermsCond";
import ParkingSessionDetailScreen from "../UI/ParkingPermit/ParkingSessionDetail";
import ParkingPermitTypeScreen from "../UI/ParkingPermit/ParkingType";
import ParkingPermitGuestSubmission from "../UI/ParkingPermit/ParkingPermitFormStack/ParkingPermitSubmission";
import SettingsScreen from "../UI/Settings/SettingsScreen";
import ContactUsScreen from "../UI/Settings/ContactUsScreen";
import ParkingCompanyDetails from "../UI/ParkingPermit/ParkingCompanyDetails";
import ParkingPermitCompanyVehiclesScreen from "../UI/ParkingPermit/ParkingCompanyFormStack/CompanyVehicleScreen";
const Stack = createStackNavigator();

export const MainStack = () => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  return (
    <Stack.Navigator
      initialRouteName={Routes.MainScreen}
      screenOptions={{
        // ✅ screenOptions goes here, on Navigator
        headerShown: false,

        cardStyle: { backgroundColor: colors.Background },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen
        name={Routes.MainScreen}
        component={MainScreen}
        options={{
          detachPreviousScreen: false, // 👈 key line
        }}
      />
      <Stack.Screen
        name={Routes.Staff.HomeScreen}
        component={StaffHomeScreen}
      />
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
        name={Routes.Auth.SAMLCallback}
        component={SAMLCallbackScreen}
      />
      <Stack.Screen
        name={Routes.Auth.SSOWebViewScreen}
        component={SSOWebViewScreen}
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
      <Stack.Screen
        name={Routes.ParkingPermit.Dashboard}
        component={ParkingPermitDashboard}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.ParkingSite}
        component={ParkingSitesScreen}
      />

      <Stack.Screen
        name={Routes.ParkingPermit.PermitDetail}
        component={PermitDetailScreen}
      />

      <Stack.Screen
        name={Routes.ParkingPermit.SessionDetail}
        component={ParkingSessionDetailScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.ParkingTypes}
        component={ParkingPermitTypeScreen}
      />
      {/* <Stack.Screen
        name={Routes.ParkingPermit.GuestSubmission}
        component={ParkingPermitGuestSubmission}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.PersonalInfo}
        component={PPPersonalInfoScreen}
      />  */}

      {/* <Stack.Screen
        name={Routes.ParkingPermit.FormSubmit}
        component={ParkingPermitFormScreen}
      /> */}
      <Stack.Screen
        name={Routes.ParkingPermit.RequestSubmit}
        component={PPSubmitReqScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.CompanyVehicle}
        component={ParkingPermitCompanyVehiclesScreen}
      />
      <Stack.Screen
        name={Routes.PoliceDuty.BillingAccountScreen}
        component={PoliceDutyScreen}
      />
      <Stack.Screen
        name={Routes.PoliceDuty.BillingTypeScreen}
        component={BillingTypeScreen}
      />
      <Stack.Screen
        name={Routes.PoliceDuty.InvoiceScreen}
        component={InvoiceScreen}
      />
      <Stack.Screen
        name={Routes.PoliceDuty.SubmitJobScreen}
        component={SubmitJobScreen}
      />
      <Stack.Screen
        name={Routes.PoliceDuty.BillingJobListing}
        component={BillingJobListing}
      />
      <Stack.Screen
        name={Routes.PoliceDuty.BillingJobDetails}
        component={BillingJobDetails}
      />
      <Stack.Screen
        name={Routes.FOIA.ReqDetailScreen}
        component={FOIAReqDetailScreen}
      />
      <Stack.Screen
        name={Routes.AutismSafety.HomeScreen}
        component={AutismSafetyScreen}
      />
      <Stack.Screen name={Routes.MapScreen} component={MapScreen} />
      <Stack.Screen name={Routes.RIP.HomeScreen} component={RIPHomeScreen} />
      <Stack.Screen
        name={Routes.RIP.SubmitReqScreen}
        component={RIPSubmitReqScreen}
      />
      <Stack.Screen
        name={Routes.RIP.ReqDetail}
        component={RIPReqDetailScreen}
      />
      <Stack.Screen
        name={Routes.EditProfileScreen}
        component={EditProfileScreen}
      />
      <Stack.Screen name={Routes.SettingsScreen} component={SettingsScreen} />
      <Stack.Screen name={Routes.ContactUsScreen} component={ContactUsScreen} />
      <Stack.Screen
        name={Routes.NotificationScreen}
        component={NotificationScreen}
      />
      <Stack.Screen
        name={Routes.FlagRaising.HomeScreen}
        component={FlagRaisingHomeScreen}
      />
      <Stack.Screen
        name={Routes.FlagRaising.TermsNCondition}
        component={FlagRaisingTermsNCondiScreen}
      />
      <Stack.Screen
        name={Routes.FlagRaising.NewReqScreen}
        component={FlagRaisingNewReqScreen}
      />
      <Stack.Screen
        name={Routes.FlagRaising.ReqDetailScreen}
        component={FlagRaisingReqDetailScreen}
      />
      <Stack.Screen name={Routes.RIP.MapScreen} component={RISMapScreen} />
      <Stack.Screen name={Routes.Auth.Login} component={LoginScreen} />
      <Stack.Screen name={Routes.Auth.Signup} component={SignupScreen} />
      <Stack.Screen name={Routes.Auth.Otp} component={OtpScreen} />
      <Stack.Screen
        name={Routes.TimeKeeping.ClockIn}
        component={TimeKeepingScreen}
      />
      <Stack.Screen
        name={Routes.TimeKeeping.Portal}
        component={TimeKeepingPortalScreen}
      />
      <Stack.Screen
        name={Routes.TimeKeeping.NewReqScreen}
        component={TimeKeepingNewReqScreen}
      />
      <Stack.Screen
        name={Routes.TimeKeeping.RequestsScreen}
        component={TimeKeepingRequestsScreen}
      />
      <Stack.Screen
        name={Routes.TimeKeeping.HoursScreen}
        component={TimeKeepingHoursScreen}
      />
      <Stack.Screen name={Routes.SIR.HomeScreen} component={SIRHomeScreen} />
      <Stack.Screen
        name={Routes.SIR.NewReqScreen}
        component={SIRNewReqScreen}
      />
      <Stack.Screen name={Routes.CDR.HomeScreen} component={CDRHomeScreen} />
      <Stack.Screen
        name={Routes.CDR.NewReqScreen}
        component={CDRNewReqScreen}
      />
      <Stack.Screen
        name={Routes.Auth.CDRLoginScreen}
        component={CDRLoginScreen}
      />
      <Stack.Screen
        name={Routes.Auth.SIRLoginScreen}
        component={SIRLoginScreen}
      />
      <Stack.Screen
        name={Routes.Auth.TimeKeepingLoginScreen}
        component={TimeKeepingLoginScreen}
      />
      <Stack.Screen
        name={Routes.Auth.HelpDeskLoginScreen}
        component={HelpDeskLoginScreen}
      />
      <Stack.Screen
        name={Routes.Auth.HelpDeskOtpScreen}
        component={HelpDeskOtpScreen}
      />
      <Stack.Screen name={Routes.Auth.CDROtpScreen} component={CDROtpScreen} />
      <Stack.Screen
        name={Routes.SIR.ReqDetailScreen}
        component={SIRReqDetailScreen}
      />
      <Stack.Screen
        name={Routes.SIR.ProfileScreen}
        component={SIRProfileScreen}
      />
      <Stack.Screen
        name={Routes.Auth.ChangePassword}
        component={ChangePasswordScreen}
      />
      <Stack.Screen
        name={Routes.DocumentListScreen}
        component={DocumentsListScreen}
      />
      <Stack.Screen
        name={Routes.CDR.ReqDetailScreen}
        component={CDRReqDetailScreen}
      />
      <Stack.Screen name={Routes.Auth.SIROtpScreen} component={SIROtpScreen} />
      <Stack.Screen
        name={Routes.PoliceDuty.InvoiceDetailScreen}
        component={InvoiceDetailScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.ReqDetail}
        component={ParkingPermitReqDetailScreen}
      />
      <Stack.Screen
        name={Routes.ParkingPermit.ParkingCompany}
        component={ParkingCompanyDetails}
      />

      <Stack.Screen
        name={Routes.Payment.AddCardScreen}
        component={PaymentScreen}
      />
      <Stack.Screen
        name={Routes.Payment.paymentScreen}
        component={StripePaymentScreen}
      />
      <Stack.Screen
        name={Routes.CartRental.Dashboard}
        component={CartRentalDashboard}
      />
      <Stack.Screen
        name={Routes.CartRental.ReportSubmission}
        component={CartRentalReportSubmission}
      />
      <Stack.Screen
        name={Routes.CartRental.HomeScreen}
        component={CartRentalHomeScreen}
      />
      <Stack.Screen
        name={Routes.CartRental.SubmitReq}
        component={CartRentalSubmitReq}
      />
      <Stack.Screen
        name={Routes.CartRental.DetailScreen}
        component={CartRentalDetailScreen}
      />
      <Stack.Screen
        name={Routes.CartRental.ReportDetails}
        component={CartRentalReportDetail}
      />
      {/* // for deeplink only */}
      <Stack.Screen
        name={Routes.CartRental.DamageReportDetails}
        component={CartRentalReportDetail}
      />
      <Stack.Screen
        name={Routes.CartRental.ReturnReportDetails}
        component={CartRentalReportDetail}
      />
      {/* // */}
      <Stack.Screen name={Routes.DAM.LoginScreen} component={DAMLoginScreen} />
      <Stack.Screen name={Routes.DAM.HomeScreen} component={DAMHomeScreen} />
      <Stack.Screen name={Routes.DAM.OptScreen} component={DAMOtpScreen} />
      <Stack.Screen name={Routes.DAM.jobDetail} component={JobDetailScreen} />
      <Stack.Screen name={Routes.DAM.taskList} component={TaskListScreen} />
      <Stack.Screen
        name={Routes.DAM.TaskDetailScreen}
        component={TaskDetailScreen}
      />
      <Stack.Screen
        name={Routes.DAM.VersionsScreen}
        component={VersionsScreen}
      />
      <Stack.Screen
        name={Routes.Billing.HomeScreen}
        component={BillingHomeScreen}
      />
      {/* <Stack.Screen
        name={Routes.ParkingPermit.TermsNCondi}
        component={ParkingPermitTermsNCondiScreen}
      /> */}
      <Stack.Screen
        name={Routes.ParkingPermit.OfflineReqScreen}
        component={ParkingPermitOfflineReqScreen}
      />
      <Stack.Screen
        name={Routes.Auth.Forgot}
        component={ForgotPasswordScreen}
      />
      <Stack.Screen
        name={Routes.TimeKeeping.LedgerScreen}
        component={TimeKeepingLedgerScreen}
      />
      <Stack.Screen
        name={Routes.FOIA.OfflineReqScreen}
        component={FOIAOfflineReqScreen}
      />
      <Stack.Screen name={Routes.CityHelpScreen} component={CityHelpScreen} />
      <Stack.Screen
        name={Routes.SIR.OfflineReqScreen}
        component={SIROfflineReqScreen}
      />
      <Stack.Screen
        name={Routes.VWL.VoterWardScreen}
        component={VoterWardScreen}
      />
      <Stack.Screen
        name={Routes.GPF.GenralFormScreen}
        component={GenralFormScreen}
      />
      <Stack.Screen
        name={Routes.Event.EventHomeScreen}
        component={EventHomeScreen}
      />
      <Stack.Screen
        name={Routes.Event.EventDetailScreen}
        component={EventDetailsScreen}
      />
      <Stack.Screen
        name={Routes.GPF.GeneralFormSubmissionScreen}
        component={GeneralFormSubmissionScreen}
      />
      <Stack.Screen
        name={Routes.CDR.OfflineReqScreen}
        component={CDROfflineReqScreen}
      />
      <Stack.Screen
        name={Routes.AutismSafety.OfflineReqScreen}
        component={AutismOfflineReqScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.TicketScreen}
        component={TicketsScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.ApprovalScreen}
        component={ApprovalScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.ServiceScreen}
        component={ServiceScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.KnowledgeScreen}
        component={KnowledgeScreen}
      />
      <Stack.Screen
        name={Routes.Vender.HomeScreen}
        component={VenderHomeScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.KnowledgeDetailScreen}
        component={KnowlegeArticleDetail}
      />
      <Stack.Screen
        name={Routes.HelpDesk.TicketDetailScreen}
        component={TicketDetailScreen}
      />
      <Stack.Screen
        name={Routes.HelpDesk.HomeScreen}
        component={HelpDeskHomeScreen}
      />
    </Stack.Navigator>
  );
};
