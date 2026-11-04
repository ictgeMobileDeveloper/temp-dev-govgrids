import {Dimensions, Linking, PixelRatio, Platform} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../Redux/AppStore';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CDRVector from '../UI/Svg/CDRVector';
import {Routes} from './Routes';
import SIRVector from '../UI/Svg/SIRVector';
import TimeVector from '../UI/Svg/TimeVector';
import EmployeeVector from '../UI/Svg/EmployeeVector';
import FOIAVector from '../UI/Svg/FOIAVector';
import PropertyVector from '../UI/Svg/PropertyVector';
import AutismVector from '../UI/Svg/AutismVector';
import ParkingVector from '../UI/Svg/ParkingVector';
import PoliceVector from '../UI/Svg/PoliceVector';
import ResidentVector from '../UI/Svg/ResidentVector';
import FlagVector from '../UI/Svg/FlagVector';
import {createNavigationContainerRef} from '@react-navigation/native';
import CityCartVector from '../UI/Svg/CityCartVector';
import DAMVector from '../UI/Svg/DAMVector';
import QuestionIcon from '../UI/Svg/QuestionIcon';
import QuestionVector from '../UI/Svg/QuestionVector';
import GeneralFormVector from '../UI/Svg/GeneralFormVector';
import VoterWardVector from '../UI/Svg/VoterVector';
import BillingVector from '../UI/Svg/BillingVector';
import CalendarIcon from '../UI/Svg/CalendarIcon';
import ClockIcon from '../UI/Svg/ClockIcon';
import LockIcon from '../UI/Svg/LockIcon';
import NotificationIcon from '../UI/Svg/NotificationIcon';
import PolicySVG from '../UI/Svg/PolicySVG';
import DocumentIcon from '../UI/Svg/DocumentIcon';
import ChatSVG from '../UI/Svg/ChatSVG';
import HelpIcon from '../UI/Svg/HelpIcon';
import DarkThemeIcon from '../UI/Svg/DarkThemeIcon';
import {openNotificationSettings} from './Helper';
import {ENDPOINTS, SOCKET_ENDPOINTS} from '../Network/Urls';
import {
  setCDRUserData,
  setDAMUserData,
  setHelpDeskUserData,
  setResidentUserData,
  setSIRUserData,
  setTimeKeepingUserData,
} from '../Redux/AppReducers';

export let IS_TABLET = false; // This will be set at runtime

export const handleTablet = (value: boolean) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  IS_TABLET = selector?.isTablet;
};
let primaryColor = '';
export const SESSION_DURATION_HOURS = 8;
export const handleColors = () => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  primaryColor = selector?.baseSettings?.cityTheme?.primaryColor;
};

export const ScreenSize = Dimensions.get('screen');
const templateWidth = 414;
const templateHeight = 896;
export const isLargeWidth = Dimensions.get('window').width > 390;

export type ScreenProps = NativeStackScreenProps<any, any>;
export const fullDate = 'MMM DD, YYYY, HH:mm:ss A';
export const dateFormat = 'DD-MMM-YYYY';

export const maxImageSizeInBytes = 10 * 1024 * 1024; // 10MB
export const isAndroid15Plus =
  Platform.OS === 'android' && Platform.Version >= 35;

// const widthRatio = ScreenSize.width / templateWidth;
// const heightRatio = ScreenSize.height / templateHeight;
// export const normalized = (value: number) =>
//   PixelRatio.roundToNearestPixel(value * widthRatio) /
//   (Platform?.constants?.systemName == 'iPadOS' ? 2 : 1);
// export const hv = (value: number) =>
//   PixelRatio.roundToNearestPixel(value * heightRatio) /
//   (Platform?.constants?.systemName == 'iPadOS' ? 2 : 1);

// this change is for tablet
const winDims = Dimensions.get('window');
const shortSide = Math.min(winDims.width, winDims.height);
const longSide = Math.max(winDims.width, winDims.height);

export const IS_TABLET_DEVICE = shortSide >= 600;

// Max scale on tablets. 1 = same size as the 414x896 design.
const TABLET_MAX_SCALE = 1;

const widthRatio = IS_TABLET_DEVICE
  ? Math.min(shortSide / templateWidth, TABLET_MAX_SCALE)
  : shortSide / templateWidth;
const heightRatio = IS_TABLET_DEVICE
  ? Math.min(longSide / templateHeight, TABLET_MAX_SCALE)
  : longSide / templateHeight;

export const normalized = (value: number) =>
  PixelRatio.roundToNearestPixel(value * widthRatio);
export const hv = (value: number) =>
  PixelRatio.roundToNearestPixel(value * heightRatio);
///////
export const AppHorizontalMargin = normalized(20);
export const bottomBarHeight = normalized(60);
export const isSmallDevice = ScreenSize.height < 700 ? true : false;

export const navigationRef = createNavigationContainerRef<any>();

// AppColors.ts

let _primaryColor = '';
let _secondaryColor = '';

export const setPrimaryColor = (color: string) => {
  _primaryColor = color;
};

export const setSecondaryColor = (color: string) => {
  _secondaryColor = color;
};

export const AppColors = {
  Dark_Blue: '#344966',
  Ice_Blue: '#98C1D9',
  White_Background: '#F9F9F9',
  Dark_Background: '#000000f1',
  Black: '#000',
  White: '#FFF',
  Grey_2: '#CCCCCC',
  Grey_3: '#EFEFEF',
  Grey_bg: '#F1F1F1',
  Error: '#C5292A',
  redLight: '#fbe3e3',
  ToastColors: {
    Error: '#C5292A',
    Alarm: '#FDA037',
    Success: '#38C172',
    Mint: '#D6F7E3',
    Cool_Gray: '#EDEDED',
    Tags_Gray: '#F1F3F5',
    Ratings_Start: '#FFB402',
  },
  green: {
    dark: '#00BE13',
    light: '#cbf5dd',
  },
  orange: {
    light: '#FDF1DB',
    dark: '#FE9311',
  },
  randomColor: {
    purpleDark: 'rgba(43, 42, 105, 1)',
    purple: '#6E397D',
    black: '#000000',
    blue: 'rgba(15, 69, 144, 1)',
    navy: '#135099',
  },
};

export const AppFonts = {
  // ===== Ubuntu =====
  UbuntuBold: 'UbuntuSans-Bold',
  UbuntuBoldItalic: 'UbuntuSans-BoldItalic',
  UbuntuItalic: 'UbuntuSans-Italic',
  UbuntuLight: 'UbuntuSans-Light',
  UbuntuLightItalic: 'UbuntuSans-LightItalic',
  UbuntuMedium: 'UbuntuSans-Medium',
  UbuntuMediumItalic: 'UbuntuSans-MediumItalic',
  UbuntuRegular: 'UbuntuSans-Regular',
  UbuntuSemiBold: 'UbuntuSans-SemiBold',

  // ===== Inter =====
  InterBlack: 'Inter-Black',
  InterBlackItalic: 'Inter-BlackItalic',
  InterExtraBold: 'Inter-ExtraBold',
  InterExtraBoldItalic: 'Inter-ExtraBoldItalic',
  InterBold: 'Inter-Bold',
  InterBoldItalic: 'Inter-BoldItalic',
  InterSemiBold: 'Inter-SemiBold',
  InterSemiBoldItalic: 'Inter-SemiBoldItalic',
  InterMedium: 'Inter-Medium',
  InterMediumItalic: 'Inter-MediumItalic',
  InterRegular: 'Inter-Regular',
  InterItalic: 'Inter-Italic',
  InterLight: 'Inter-Light',
  InterLightItalic: 'Inter-LightItalic',
  InterExtraLight: 'Inter-ExtraLight',
  InterExtraLightItalic: 'Inter-ExtraLightItalic',
  InterThin: 'Inter-Thin',
  InterThinItalic: 'Inter-ThinItalic',

  // ===== Sono =====
  SonoExtraBold: 'Sono-ExtraBold',
  SonoExtraBoldItalic: 'Sono-ExtraBoldItalic',
  SonoBold: 'Sono-Bold',
  SonoBoldItalic: 'Sono-BoldItalic',
  SonoSemiBold: 'Sono-SemiBold',
  SonoSemiBoldItalic: 'Sono-SemiBoldItalic',
  SonoMedium: 'Sono-Medium',
  SonoMediumItalic: 'Sono-MediumItalic',
  SonoRegular: 'Sono-Regular',
  SonoItalic: 'Sono-Italic',
  SonoLight: 'Sono-Light',
  SonoLightItalic: 'Sono-LightItalic',
  SonoExtraLight: 'Sono-ExtraLight',
  SonoExtraLightItalic: 'Sono-ExtraLightItalic',
};

export const AppImages = {
  flags: {
    uk: require('../assets/images/uk.png'),
    espanol: require('../assets/images/espanol.png'),
    arabic: require('../assets/images/Arabic.png'),
    italy: require('../assets/images/italy.png'),
    polish: require('../assets/images/polish.png'),
  },
  Common: {
    camera: require('../assets/images/camera.png'),
    gallery: require('../assets/images/gallery.png'),
    pin: require('../assets/images/pin.png'),
    blur: require('../assets/images/blur.png'),
  },
};

export const Animations = {
  Tick: require('../assets/animations/TickAnim.json'),
  Close: require('../assets/animations/CloseAnim.json'),
  Warning: require('../assets/animations/warningAnim.json'),
  WifiLost: require('../assets/animations/WifiLost.json'),
  locationAccessed: require('../assets/animations/locationAccessed.json'),
  locationDenied: require('../assets/animations/locationDenied.json'),
  swipe: require('../assets/animations/swipe.json'),
};

export const ChangePasswordEndpoints = {
  CDR: {
    endpoint: ENDPOINTS.staffChangePassword,
    clear: setCDRUserData,
    sessionEndPoint: SOCKET_ENDPOINTS.SIRSession,
  },
  SIR: {
    endpoint: ENDPOINTS.staffChangePassword,
    clear: setSIRUserData,
    sessionEndPoint: SOCKET_ENDPOINTS.SIRSession,
  },
  DAM: {
    endpoint: ENDPOINTS.vendorChangePassword,
    clear: setDAMUserData,
    sessionEndPoint: SOCKET_ENDPOINTS.SIRSession,
  },
  HELPDESK: {
    endpoint: ENDPOINTS.helpDeskChangePassword,
    clear: setHelpDeskUserData,
    sessionEndPoint: SOCKET_ENDPOINTS.SIRSession,
  },
  TIMEKEEPING: {
    endpoint: ENDPOINTS.staffChangePassword,
    clear: setTimeKeepingUserData,
    sessionEndPoint: SOCKET_ENDPOINTS.TKSession,
  },
  RESIDENT: {
    endpoint: ENDPOINTS.changePassword,
    clear: setResidentUserData,
    sessionEndPoint: SOCKET_ENDPOINTS.publicSessionTimer,
  },
};
export const SettingContent = (
  navigation: any,
  onChangeTheme: () => void,
  selector: any,
  role: any,
  showChangePass = true,
) => [
  {
    heading: 'Account & preferences',
    items: [
      ...(role !== 'TIMEKEEPING' && showChangePass === true
        ? [
            {
              title: 'Change Password',
              subtitle: 'Keep your account secure',
              Icon: LockIcon,
              onPress: () =>
                navigation?.navigate(Routes.Auth.ChangePassword, {role}),
            },
          ]
        : []),
      {
        title: 'Change Theme',
        subtitle: 'Personalize your display',
        Icon: DarkThemeIcon,
        onPress: onChangeTheme,
      },
      {
        title: 'Notifications',
        subtitle: 'Choose the updates you receive',
        Icon: NotificationIcon,
        onPress: () => openNotificationSettings(),
      },
    ],
  },
  {
    heading: 'Help & support',
    items: [
      {
        title: 'Contact Us',
        subtitle: 'Get help from our support team',
        Icon: ChatSVG,
        onPress: () => navigation.navigate(Routes.ContactUsScreen),
      },

      ...(selector?.baseData?.enableResidentHelpdesk
        ? [
            {
              title: 'City Help Center',
              subtitle: 'Submit a Ticket or Request Assistance',
              Icon: HelpIcon,
              onPress: () => navigation.navigate(Routes.CityHelpScreen),
            },
          ]
        : []),
    ],
  },
  {
    heading: 'Privacy & legal',
    items: [
      {
        title: 'Privacy Policy',
        subtitle: 'How we handle your information',
        Icon: PolicySVG,
        onPress: () => Linking.openURL('https://yourapp.com/privacy-policy'),
      },
      {
        title: 'Terms & Conditions',
        subtitle: 'Review the terms of use',
        Icon: DocumentIcon,
        onPress: () => Linking.openURL('https://yourapp.com/terms'),
      },
    ],
  },
];

export const imagePickerConstants = [
  {
    id: 0,
    image: AppImages.Common.gallery,
    text: 'Upload from Gallery',
  },
  {
    id: 1,
    image: AppImages.Common.camera,
    text: 'Take a photo from Camera',
  },
];

export const STAFF_MODULES_LIST = [
  {
    title: 'Court Discovery Request',
    description:
      'Submit and track discovery requests related to court cases directly through the staff portal.',
    route: Routes.CDR.HomeScreen,
    vector: CDRVector,
    code: 'SCD1',
  },
  {
    title: 'Security Incident Report',
    description:
      'Report security or workplace incidents quickly and securely for official review and follow-up.',
    vector: SIRVector,
    code: 'SSI1',
    route: Routes.SIR.HomeScreen,
  },
  {
    title: 'Parking Permit',
    description: 'Parking Permit',
    vector: SIRVector,
    code: 'SSI1',
    route: Routes.SIR.HomeScreen,
  },
  {
    title: 'Timekeeping Portal',
    description:
      'Access work schedules, manage timesheets, and review attendance records online',
    code: 'STK1',
    vector: TimeVector,
    route: Routes.TimeKeeping.Portal,
  },
  {
    title: 'Employee Clock-In/Out',
    description:
      'Record your work hours by clocking in and out directly from the app.',
    code: 'SPC1',
    vector: EmployeeVector,
    route: Routes.TimeKeeping.ClockIn,
  },

  {
    title: 'Help Desk',
    description:
      'View and manage all Task Management data, summaries, and reports at a glance.',
    code: 'SHD1',
    vector: QuestionVector,
    route: Routes.HelpDesk.HomeScreen,
  },
];

export const RESIDENT_MODULES_LIST = [
  {
    title: 'Online FOIA Request',
    description: 'Submit a Freedom of Information Act (FOIA) request online.',
    code: 'PFO1',
    vector: FOIAVector,
    route: Routes.FOIA.RequestScreen,
    isPublic: true,
  },
  {
    title: 'Property Sales Lookup',
    description: 'Search for property sales record in your area.',
    code: 'PPS1',
    vector: PropertyVector,
    route: Routes.Property.SalesLookupScreen,
    isPublic: true,
  },
  {
    title: 'Autism Safety Form',
    description: 'Provide Safety information for individuals with autism.',
    code: 'PAF1',
    vector: AutismVector,
    route: Routes.AutismSafety.HomeScreen,
    isPublic: true,
  },
  {
    title: 'Parking Permits',
    description: 'Apply for a parking permit online.',
    code: 'PPP1',
    vector: ParkingVector,
    route: Routes.ParkingPermit.Dashboard,
    isPublic: true,
  },

  {
    title: 'Resident Issue Portal',
    description: 'Provide Billing Account Details and Time Slips.',
    code: 'PRI1',
    vector: ResidentVector,
    route: Routes.RIP.HomeScreen,
    isPublic: true,
  },
  {
    title: 'Flag Raising Request',
    description:
      'Submit and monitor or requests for raising flags for special events or Observances',
    code: 'PFR1',
    vector: FlagVector,
    route: Routes.FlagRaising.HomeScreen,
    isPublic: false,
  },
  {
    title: 'City Cart Rental',
    description: 'City Cart Rental',
    code: 'PCR1',
    vector: CityCartVector,
    route: Routes.CartRental.Dashboard,
    isPublic: false,
  },
  {
    title: 'Voter Ward Lookup',
    description: 'Voter Ward Lookup.',
    code: 'PVW1',
    vector: VoterWardVector,
    route: Routes.VWL.VoterWardScreen,
    isPublic: true,
  },
  {
    title: 'General Public Forms',
    description: 'General Public Forms.',
    code: 'PGF1',
    vector: GeneralFormVector,
    route: Routes.GPF.GenralFormScreen,
    isPublic: true,
  },
  {
    title: 'Event Management',
    description: 'Event Management.',
    code: 'PEM1',
    vector: GeneralFormVector,
    route: Routes.Event.EventHomeScreen,
    isPublic: true,
  },
];

export const VENDER_MODULES_LIST = [
  {
    title: 'Digital Asset Management',
    description: 'Digital Asset Management.',
    code: 'SDAM1',
    vector: DAMVector,
    route: Routes.DAM.HomeScreen,
  },
  {
    title: 'Billing and Invoicing',
    description: 'Integrated Billing.',
    code: 'PIB1',
    vector: BillingVector,
    route: Routes.Billing.HomeScreen,
  },
];

export const PUSH_DETAIL_ROUTES: any = {
  PFO1: {
    route: Routes.FOIA.ReqDetailScreen,
    buildParams: (data: any) => ({
      data: {id: data?.id},
    }),
  },
  PPP1: {
    route: Routes.ParkingPermit.ReqDetail,
    buildParams: (data: any) => ({
      id: data?.id,
      formId: data?.requestId,
    }),
  },

  PRI1: {
    route: Routes.RIP.ReqDetail,
    buildParams: (data: any) => ({
      item: {requestId: data?.requestId || data?.id},
    }),
  },

  PFR1: {
    route: Routes.FlagRaising.ReqDetailScreen,
    buildParams: (data: any) => ({
      requestId: data?.requestId,
    }),
  },
  PCR1: {
    route: (data: any) =>
      data?.routeType === 'CartRequest'
        ? Routes.CartRental.DetailScreen
        : Routes.CartRental.ReportDetails,
    buildParams: (data: any) => ({
      // requestId: data?.
      id: data?.id,
      navigation: data?.routeType,
    }),
  },

  SCD1: {
    route: Routes.CDR.ReqDetailScreen,
    buildParams: (data: any) => ({
      item: {id: data?.id},
    }),
  },

  SHD1: {
    route: Routes.HelpDesk.TicketDetailScreen,
    buildParams: (data: any) => ({
      // id: data?.id || data?.requestId,
      item: {id: data?.id},
      // actionKey: data?.actionKey || 'viewTickets',
      // type: data?.resourceType || 'ticket',
    }),
  },
};

export const THEME_LIST = [
  {
    id: 1,
    name: 'Light',
  },
  {
    id: 2,
    name: 'Dark',
  },
  {
    id: 3,
    name: 'System Default',
  },
];
export const EventSwitcherList = [
  {id: 1, name: 'Calender'},
  {id: 2, name: 'List'},
];

export const calendarViewSwitcherList = [
  {id: 2, name: 'Week'},
  {id: 3, name: 'Month'},
];

export const Parking_Site_SwitcherList = [
  {id: 1, name: 'List'},
  {id: 2, name: 'Map'},
];
export const Parking_Site_Type_List = [
  {id: 1, name: 'Contract'},
  {id: 2, name: 'Pay-As-You-Go'},
];

export const FOIA_FORM_TYPES = [
  {
    id: 1,
    name: 'City Hall FOIA',
  },
  {
    id: 2,
    name: 'Public Safety FOIA',
  },
];

export const SIGNUP_FORM_TYPES = [
  {
    id: 1,
    name: 'Citizen',
  },
  {
    id: 2,
    name: 'Organization',
  },
];

export const APPROVED_PP_SWITCHER_TYPES = [
  {
    id: 1,
    name: 'Comments',
  },
  {
    id: 2,
    name: 'Vehicle',
  },
  {
    id: 3,
    name: 'Invoices',
  },
];

export const PP_SWITCHER_TYPES = [
  {
    id: 1,
    name: 'Comments',
  },
  {
    id: 2,
    name: 'Vehicle',
  },
];

export const MAP_CUSTOMIZATION = [
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{visibility: 'off'}],
  },
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{visibility: 'off'}],
  },
];

export const COMMENT_SWITCH_LIST = [
  {
    id: 1,
    name: 'Comments',
  },
  {
    id: 2,
    name: 'Request Actions',
  },
];

export const FOIA_PAYMENT_LIST = [
  {
    id: 1,
    name: 'Cash',
  },
  {
    id: 2,
    name: 'Check',
  },
  {
    id: 3,
    name: 'Online',
  },
];

export const HelpDesk_Switcher_list = [
  {
    id: 1,
    name: 'Approvals',
  },
  {
    id: 2,
    name: 'Comments',
  },
];

export const getApprovalCircleColor = (
  isDisapproved: boolean,
  isApproved: boolean,
): string => {
  if (isDisapproved) return AppColors.Error;
  if (isApproved) return AppColors.green.light;
  return AppColors.ToastColors.Alarm;
};
export const HAIR_COLOR_LIST = [
  'Black',
  'Dark Brown',
  'Brown',
  'Light Brown',
  'Chestnut',
  'Auburn',
  'Red',
  'Strawberry Blonde',
  'Blonde',
  'Honey Blonde',
  'Gray',
  'White',
];

export const EYE_COLOR_LIST = [
  'Black',
  'Dark Brown',
  'Brown',
  'Light Brown',
  'Hazel',
  'Amber',
  'Green',
  'Blue',
  'Gray',
];

export const AUTISM_STEPPER_LIST = [
  'Personal Info',
  'Required Data',
  'Select Features',
  'Medical',
  'Information',
  'Additional Information',
];

export const CDR_STEPPER_LIST = [
  'Personal Info',
  'Docket',
  'Record Division',
  'Forensics Division',
  'Other Evidence',
];

export const PP_STEPPER_LIST = [
  'Personal Info',
  'Permit Details',
  'Vehicle Details',
  'Submit as',
  'Terms & Conditions',
];
export const P_Company_STEPPER_LIST = [
  'Personal Info',
  'Company',
  'Vehicle Details',
  'Terms & Conditions',
];
export const parkingTypes = [
  {
    id: 0,
    type: 'CONTRACT' as const,
    title: 'Contract Parking',
    description:
      'Reserve a dedicated parking spot with a monthly or annual contract. Best value for daily commuters and residents.',
    Icon: CalendarIcon,
  },
  {
    id: 1,
    type: 'PAYG' as const,
    title: 'Pay-As-You-Go',
    description:
      'Park whenever you need with flexible hourly or daily rates. Perfect for occasional visitors, errands, and short stays.',
    Icon: ClockIcon,
  },
];
export const PPGuestoptionList = [
  {
    id: 1,
    type: 'guest',
    title: 'Submit as a guest',
    description:
      'You can book this parking slot without creating an account. However, you won’t be able to track it once it is expired , it will be show until it is active.',
    OnPress: 'SubmitReq',
  },
  {
    id: 2,
    type: 'yourself',
    title: 'Login to Submit',
    description: `Submit with your account to save your reservations securely.`,
  },
];

export const ALL_MINUTE_CHOICES = ['15', '30', '45'];
export const FALLBACK_MAX_HOURS = 12;

export const DOCUMENT_TYPE_OPTIONS = [
  {name: 'Utility Bill', value: 'utilityBill'},
  {name: 'Lease Agreement', value: 'lease'},
];

export const BillingAccStatus = {
  pending: 'applied',
  notApply: 'notAppliedYet',
  approve: 'approved',
};

export const RIP_STEPPER_LIST = [
  'Issue Details',
  'Additional Information',
  'Choose Location',
  'Submit Request',
];

export const RIP_QUES_TYPE = {
  shortText: 'text',
  longText: 'textarea',
  pulldownSelect: 'pulldownSelect',
  checkbox: 'checkbox',
  messageOrNote: 'messageOrNote',
  dateTime: 'dateTime',
  number: 'integer',
  location: 'location',
};

export const Restrictions = {
  disableReopens: 'disableReopens',
  disableStatusChanges: 'disableStatusChanges',
  disableAllActionsOnClosedRequests: 'disableAllActionsOnClosedRequests',
  disableAllActionsOnAllRequests: 'disableAllActionsOnAllRequests',
};

export const Service_Stepper_List = [
  'Service Categories',
  'Service Catalog',
  'Form Submission',
];
export const Vehicle_Color = [
  'Black',
  'White',
  'Gray',
  'Silver',
  'Blue',
  'Red',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'MultiColor',
];

export const CDR_Status_List = [
  {id: 1, name: 'All', key: ''},
  {id: 2, name: 'Under Review', key: 'underReview'},
  {id: 3, name: 'Accepted', key: 'accepted'},
  {id: 4, name: 'Assigned', key: 'assigned'},
  {id: 5, name: 'Ready to Publish', key: 'readyToPublish'},
  {id: 6, name: 'Published', key: 'published'},
  {id: 7, name: 'Closed', key: 'closed'},
  {id: 8, name: 'Withdrawn', key: 'withdrawn'},
  {id: 9, name: 'Declined', key: 'declined'},
  {id: 10, name: 'Archived', key: 'archived'},
];

export const Status_List = [
  {
    id: 1,
    name: 'All',
    key: '',
  },
  {
    id: 2,
    name: 'Under Review',
    key: 'under review',
  },
  {
    id: 3,
    name: 'Accepted',
    key: 'accepted',
  },
  {
    id: 4,
    name: 'Assigned',
    key: 'assigned',
  },
  {
    id: 5,
    name: 'Ready to Publish',
    key: 'ready to publish',
  },
  {
    id: 5,
    name: 'Ready to Publish Partially',
    key: 'ready to publish partially',
  },
  {
    id: 6,
    name: 'Partially Published',
    key: 'partiallyPublish',
  },
  {
    id: 7,
    name: 'Closed',
    key: 'closed',
  },
  {
    id: 8,
    name: 'Withdrawn',
    key: 'withdrawn',
  },
  {
    id: 9,
    name: 'Published',
    key: 'published',
  },
  {
    id: 10,
    name: 'Declined',
    key: 'declined',
  },
];

export const Payment_Status = [
  {
    name: 'All',
    key: '',
  },
  {
    name: 'Pending',
    key: 'Pending',
  },
  {
    name: 'Partially Paid',
    key: 'PartiallyPaid',
  },
  {
    name: 'Fulfilled',
    key: 'Fulfilled',
  },
];

export const City_Cart_Rental_Payment_List = [
  {
    name: 'All',
    key: '',
  },
  {
    name: 'Paid',
    key: 'paid',
  },
  {
    name: 'UnPaid',
    key: 'unpaid',
  },
];

export const HOURS_LIST = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
];

export const MINUTES_LIST = [
  '00',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
];

export const SIR_INCIDENT_TYPE_LIST = [
  {
    id: 1,
    name: 'Vandalism',
    key: 'vandalism',
  },
  {
    id: 2,
    name: 'Trash',
    key: 'trash',
  },
  {
    id: 3,
    name: 'Vehicle Left Overnight',
    key: 'vehicleLeftOverNight',
  },
  {
    id: 4,
    name: 'Other',
    key: 'otherTypeOfIncident',
  },
];

export const sortingList = [
  {
    label: 'Date Ascending',
    key: 'dateAsc',
  },
  {
    label: 'Date Descending',
    key: 'dateDesc',
  },
  {
    label: 'Name Ascending',
    key: 'nameAsc',
  },
  {
    label: 'Name Descending',
    key: 'nameDesc',
  },
];

export const FOIALIST = [
  {
    id: 1,
    name: 'Comments',
  },
  {
    id: 2,
    name: 'Update Details',
  },
];

export const FOIADeclineLIST = [
  {
    id: 1,
    name: 'Comments',
  },
];
export const HelpDesk_Status_List = [
  {
    id: 1,
    name: 'All',
    key: '',
  },
  // {
  //   id: 2,
  //   name: 'Open',
  //   key: 'open',
  // },
  {
    id: 3,
    name: 'New',
    key: 'new',
  },
  {
    id: 4,
    name: 'Assigned',
    key: 'assigned',
  },
  {
    id: 5,
    name: 'Closed',
    key: 'closed',
  },
  {
    id: 6,
    name: 'Reopen',
    key: 'reopen',
  },
];
export const CartRentalStatusList = [
  {
    name: 'All',
    key: 'all',
  },
  {
    name: 'Pending',
    key: 'pending',
  },
  {
    name: 'Approved',
    key: 'approved',
  },
  {
    name: 'Delinquent',
    key: 'delinquent',
  },
  {
    name: 'Default',
    key: 'default',
  },
  {
    name: 'Declined',
    key: 'declined',
  },
];

export const FlagRaisingStatusList = [
  {
    name: 'All',
    key: 'all',
  },
  {
    name: 'Pending',
    key: 'pending',
  },
  {
    name: 'Approved',
    key: 'approved',
  },

  {
    name: 'Declined',
    key: 'declined',
  },
];

export const ResidentIssuePortal_StatusList = [
  {
    name: 'All',
    key: 'all',
  },
  {
    name: 'Open',
    key: 'open',
  },
  {
    name: 'Acknowledged',
    key: 'acknowledged',
  },

  {
    name: 'Closed',
    key: 'closed',
  },
  {
    name: 'Archived',
    key: 'archived',
  },
];

export const ParkingPermitStatusList = [
  {
    name: 'All',
    key: 'all',
  },
  {
    name: 'Pending',
    key: 'pending',
  },
  {
    name: 'Approved',
    key: 'approved',
  },

  {
    name: 'Declined',
    key: 'declined',
  },
  {
    name: 'Expire',
    key: 'expire',
  },
];

export const jobStatusList = [
  {
    label: 'All',
    key: 'all',
  },
  {
    label: 'Creation',
    key: 'creation',
  },
  {
    label: 'In Progress',
    key: 'inProgress',
  },
  {
    label: 'Completed',
    key: 'completed',
  },
];

export const taskStatusList = [
  {
    label: 'All',
    key: 'all',
  },
  {
    label: 'Creation',
    key: 'creation',
  },
  {
    label: 'In Review',
    key: 'inReview',
  },
  {
    label: 'Pending Approval',
    key: 'pendingApproval',
  },
  {
    label: 'Changes Requested',
    key: 'changesRequested',
  },
  {
    label: 'Approved',
    key: 'approved',
  },
];

export const getFOIASortedReqList = (
  reqDetails: any,
  icons: {
    SecurityIcon: any;
    PhoneIcon: any;
    CarIcon: any;
    PoliceReportIcon: any;
    CameraIcon: any;
    EyeIcon: any;
    GalleryIcon: any;
  },
) => {
  const reqList = [
    {
      label: 'CAD Report',
      value: reqDetails?.cadReport,
      icon: icons.SecurityIcon,
    },
    {
      label: '911Calls',
      value: reqDetails?.calls911,
      icon: icons.PhoneIcon,
    },
    {
      label: 'Dash Cam Video',
      value: reqDetails?.dashCamVideo,
      icon: icons.CarIcon,
    },
    {
      label: 'Police Report',
      value: reqDetails?.policeReport,
      icon: icons.PoliceReportIcon,
    },
    {
      label: 'Body Worn Camera',
      value: reqDetails?.bodyWornCamera,
      icon: icons.CameraIcon,
    },
    {
      label: 'Surveillance Video',
      value: reqDetails?.surveillanceVideo,
      icon: icons.EyeIcon,
    },
    {
      label: 'Photographs',
      value: reqDetails?.photographs,
      icon: icons.GalleryIcon,
    },
  ];

  return [
    ...reqList.filter(item => item.value === true),
    ...reqList.filter(item => item.value === false),
  ];
};

export const getHelpDeskExtraDetailFields = (
  resourceType: 'change' | 'problem' | string,
  details: any,
) => {
  if (resourceType === 'change') {
    return [
      {
        label: 'Reason For Change',
        value: details?.reason,
      },
      {
        label: 'Risks',
        value: details?.risks,
      },
      {
        label: 'Roll Out Strategy',
        value: details?.rollOutStrategy,
      },
      {
        label: 'Back Out Strategy',
        value: details?.backOutStrategy,
      },
    ];
  }

  if (resourceType === 'problem') {
    return [
      {
        label: 'Affected Areas',
        value: details?.affectedAreas,
      },
      {
        label: 'Root Cause',
        value: details?.rootCause,
      },
      {
        label: 'Solution',
        value: details?.solution,
      },
    ];
  }

  return [];
};

export const US_STATES = [
  {short: 'AL', long: 'Alabama'},
  {short: 'AK', long: 'Alaska'},
  {short: 'AZ', long: 'Arizona'},
  {short: 'AR', long: 'Arkansas'},
  {short: 'CA', long: 'California'},
  {short: 'CO', long: 'Colorado'},
  {short: 'CT', long: 'Connecticut'},
  {short: 'DE', long: 'Delaware'},
  {short: 'FL', long: 'Florida'},
  {short: 'GA', long: 'Georgia'},
  {short: 'HI', long: 'Hawaii'},
  {short: 'ID', long: 'Idaho'},
  {short: 'IL', long: 'Illinois'},
  {short: 'IN', long: 'Indiana'},
  {short: 'IA', long: 'Iowa'},
  {short: 'KS', long: 'Kansas'},
  {short: 'KY', long: 'Kentucky'},
  {short: 'LA', long: 'Louisiana'},
  {short: 'ME', long: 'Maine'},
  {short: 'MD', long: 'Maryland'},
  {short: 'MA', long: 'Massachusetts'},
  {short: 'MI', long: 'Michigan'},
  {short: 'MN', long: 'Minnesota'},
  {short: 'MS', long: 'Mississippi'},
  {short: 'MO', long: 'Missouri'},
  {short: 'MT', long: 'Montana'},
  {short: 'NE', long: 'Nebraska'},
  {short: 'NV', long: 'Nevada'},
  {short: 'NH', long: 'New Hampshire'},
  {short: 'NJ', long: 'New Jersey'},
  {short: 'NM', long: 'New Mexico'},
  {short: 'NY', long: 'New York'},
  {short: 'NC', long: 'North Carolina'},
  {short: 'ND', long: 'North Dakota'},
  {short: 'OH', long: 'Ohio'},
  {short: 'OK', long: 'Oklahoma'},
  {short: 'OR', long: 'Oregon'},
  {short: 'PA', long: 'Pennsylvania'},
  {short: 'RI', long: 'Rhode Island'},
  {short: 'SC', long: 'South Carolina'},
  {short: 'SD', long: 'South Dakota'},
  {short: 'TN', long: 'Tennessee'},
  {short: 'TX', long: 'Texas'},
  {short: 'UT', long: 'Utah'},
  {short: 'VT', long: 'Vermont'},
  {short: 'VA', long: 'Virginia'},
  {short: 'WA', long: 'Washington'},
  {short: 'WV', long: 'West Virginia'},
  {short: 'WI', long: 'Wisconsin'},
  {short: 'WY', long: 'Wyoming'},
];
export type CDRRecordDivisionKey =
  | 'rdAllReports'
  | 'rdArrestWarrants'
  | 'rdCADNotes'
  | 'rdConditionsOfRelease'
  | 'rdConsentForm'
  | 'rdForceReport'
  | 'rdInstructionForm'
  | 'rdLabReports'
  | 'rdMedicalRecords'
  | 'rdSearchWarrant'
  | 'rdWrittenStatements';

export const CDR_RECORD_DIVISION_LIST: {
  label: string;
  key: CDRRecordDivisionKey;
}[] = [
  {
    label: 'Miranda Waiver/Search Consent Form',
    key: 'rdConsentForm',
  },
  {
    label: 'All reports (Primary and Supplements)',
    key: 'rdAllReports',
  },
  {
    label: 'CAD Notes',
    key: 'rdCADNotes',
  },
  {
    label: 'Arrest Warrants',
    key: 'rdArrestWarrants',
  },
  {
    label: 'Use of Force Reports',
    key: 'rdForceReport',
  },
  {
    label: 'Search Warrants',
    key: 'rdSearchWarrant',
  },
  {
    label: 'Condition of Release',
    key: 'rdConditionsOfRelease',
  },
  {
    label: 'Written Statements',
    key: 'rdWrittenStatements',
  },
  {
    label: 'Lab Reports',
    key: 'rdLabReports',
  },
  {
    label: 'Photo Array(s) w/Witness Identification Instruction Form',
    key: 'rdInstructionForm',
  },
  {
    label: 'Medical Records obtained by Search warrant',
    key: 'rdMedicalRecords',
  },
];

export const CDR_RECORD_DIVISION_BASE_OBJ: Record<
  CDRRecordDivisionKey,
  boolean
> = {
  rdAllReports: false,
  rdArrestWarrants: false,
  rdCADNotes: false,
  rdConditionsOfRelease: false,
  rdConsentForm: false,
  rdForceReport: false,
  rdInstructionForm: false,
  rdLabReports: false,
  rdMedicalRecords: false,
  rdSearchWarrant: false,
  rdWrittenStatements: false,
};

export const getCDRRecordDivisionPayload = (
  selected: CDRRecordDivisionKey[],
) => {
  return selected.reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {...CDR_RECORD_DIVISION_BASE_OBJ},
  );
};

export type CDREvidenceKey =
  | 'dfd911Calls'
  | 'dfdBWC'
  | 'dfdBookingPhoto'
  | 'dfdBookingVideo'
  | 'dfdInterviewRoomVideo'
  | 'dfdMDRS'
  | 'dfdPhotographs'
  | 'dfdSeizedVideo';

export const CDR_FORENSICS_DIVISION_LIST: {
  label: string;
  key: CDREvidenceKey;
}[] = [
  {
    label: 'Body Worn Camera (BWC) Video',
    key: 'dfdBWC',
  },
  {
    label: '911 call',
    key: 'dfd911Calls',
  },
  {
    label: 'Any Seized Video',
    key: 'dfdSeizedVideo',
  },
  {
    label: 'Photographs',
    key: 'dfdPhotographs',
  },
  {
    label: 'Interview Room Video',
    key: 'dfdInterviewRoomVideo',
  },
  {
    label: 'Booking Photos',
    key: 'dfdBookingPhoto',
  },
  {
    label: 'Dash Camera Video (MDRS)',
    key: 'dfdMDRS',
  },
  {
    label: 'Booking Videos',
    key: 'dfdBookingVideo',
  },
];

export const CDR_FORENSICS_DIVISION_BASE_OBJ: Record<CDREvidenceKey, boolean> =
  {
    dfd911Calls: false,
    dfdBWC: false,
    dfdBookingPhoto: false,
    dfdBookingVideo: false,
    dfdInterviewRoomVideo: false,
    dfdMDRS: false,
    dfdPhotographs: false,
    dfdSeizedVideo: false,
  };

export const getCDRForensicsDivisionPayload = (selected: CDREvidenceKey[]) => {
  return selected.reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {...CDR_FORENSICS_DIVISION_BASE_OBJ},
  );
};

export const polygonCoordinates = [
  {longitude: -72.7619703, latitude: 41.7158029},
  {longitude: -72.7633165, latitude: 41.7156108},
  {longitude: -72.764705, latitude: 41.7153687},
  {longitude: -72.7672296, latitude: 41.7150288},
  {longitude: -72.7716691, latitude: 41.714616},
  {longitude: -72.7752292, latitude: 41.7140903},
  {longitude: -72.7804136, latitude: 41.7133018},
  {longitude: -72.780443, latitude: 41.7132967},
  {longitude: -72.7835692, latitude: 41.7128563},
  {longitude: -72.7934919, latitude: 41.7050062},
  {longitude: -72.7934958, latitude: 41.7050031},
  {longitude: -72.7959135, latitude: 41.703432},
  {longitude: -72.7962103, latitude: 41.7031634},
  {longitude: -72.7971733, latitude: 41.7022474},
  {longitude: -72.7973941, latitude: 41.7020186},
  {longitude: -72.797753, latitude: 41.701643},
  {longitude: -72.798323, latitude: 41.7012007},
  {longitude: -72.7989735, latitude: 41.700696},
  {longitude: -72.8009718, latitude: 41.6991455},
  {longitude: -72.8030098, latitude: 41.6973794},
  {longitude: -72.805445, latitude: 41.6954882},
  {longitude: -72.8101029, latitude: 41.691835},
  {longitude: -72.8111091, latitude: 41.6922565},
  {longitude: -72.812007, latitude: 41.6902414},
  {longitude: -72.814311, latitude: 41.6883014},
  {longitude: -72.8153796, latitude: 41.6879692},
  {longitude: -72.8157839, latitude: 41.6871255},
  {longitude: -72.8163326, latitude: 41.6865457},
  {longitude: -72.8183501, latitude: 41.6845438},
  {longitude: -72.8189665, latitude: 41.683923},
  {longitude: -72.8197755, latitude: 41.6831376},
  {longitude: -72.8206384, latitude: 41.6805539},
  {longitude: -72.8215163, latitude: 41.677903},
  {longitude: -72.8223736, latitude: 41.6754741},
  {longitude: -72.8230485, latitude: 41.6736036},
  {longitude: -72.8234053, latitude: 41.6725732},
  {longitude: -72.8247723, latitude: 41.6702389},
  {longitude: -72.8252381, latitude: 41.6694588},
  {longitude: -72.8256258, latitude: 41.6684893},
  {longitude: -72.8254312, latitude: 41.6680662},
  {longitude: -72.8253745, latitude: 41.6673339},
  {longitude: -72.8251934, latitude: 41.6664202},
  {longitude: -72.8243332, latitude: 41.6620024},
  {longitude: -72.8229219, latitude: 41.6569375},
  {longitude: -72.8224021, latitude: 41.6551353},
  {longitude: -72.8206793, latitude: 41.6552787},
  {longitude: -72.8205917, latitude: 41.6545711},
  {longitude: -72.8200499, latitude: 41.6507747},
  {longitude: -72.8195685, latitude: 41.647173},
  {longitude: -72.8194288, latitude: 41.6461126},
  {longitude: -72.8194428, latitude: 41.6455821},
  {longitude: -72.8191766, latitude: 41.6450168},
  {longitude: -72.8180652, latitude: 41.6450377},
  {longitude: -72.8150507, latitude: 41.6456243},
  {longitude: -72.8141871, latitude: 41.6457195},
  {longitude: -72.8120026, latitude: 41.6459304},
  {longitude: -72.8082032, latitude: 41.646144},
  {longitude: -72.8059566, latitude: 41.6462863},
  {longitude: -72.8044046, latitude: 41.6463995},
  {longitude: -72.7985998, latitude: 41.6468229},
  {longitude: -72.7985374, latitude: 41.6468274},
  {longitude: -72.7954338, latitude: 41.6470538},
  {longitude: -72.7948487, latitude: 41.6471141},
  {longitude: -72.7926208, latitude: 41.6472433},
  {longitude: -72.7913578, latitude: 41.6473166},
  {longitude: -72.787787, latitude: 41.6475576},
  {longitude: -72.7823277, latitude: 41.6478745},
  {longitude: -72.7815996, latitude: 41.6479131},
  {longitude: -72.7807841, latitude: 41.6479563},
  {longitude: -72.779582, latitude: 41.6480344},
  {longitude: -72.7778705, latitude: 41.6481457},
  {longitude: -72.7770007, latitude: 41.6482023},
  {longitude: -72.7753545, latitude: 41.6483282},
  {longitude: -72.774132, latitude: 41.6483935},
  {longitude: -72.7723635, latitude: 41.6485302},
  {longitude: -72.7713733, latitude: 41.6486067},
  {longitude: -72.7672824, latitude: 41.648897},
  {longitude: -72.7619215, latitude: 41.6492774},
  {longitude: -72.753544, latitude: 41.6498843},
  {longitude: -72.7503613, latitude: 41.6501149},
  {longitude: -72.750518, latitude: 41.6512064},
  {longitude: -72.7505791, latitude: 41.6539989},
  {longitude: -72.7512721, latitude: 41.6564354},
  {longitude: -72.7516504, latitude: 41.6582904},
  {longitude: -72.7538674, latitude: 41.669815},
  {longitude: -72.755584, latitude: 41.6787373},
  {longitude: -72.7574422, latitude: 41.68864},
  {longitude: -72.7578423, latitude: 41.6911537},
  {longitude: -72.7580688, latitude: 41.6923341},
  {longitude: -72.7583452, latitude: 41.6940412},
  {longitude: -72.7588839, latitude: 41.6975378},
  {longitude: -72.7589836, latitude: 41.6981034},
  {longitude: -72.7590279, latitude: 41.6983548},
  {longitude: -72.7590513, latitude: 41.6984873},
  {longitude: -72.7598895, latitude: 41.7036797},
  {longitude: -72.7606222, latitude: 41.7075825},
  {longitude: -72.7611339, latitude: 41.710308},
  {longitude: -72.7611771, latitude: 41.7105564},
  {longitude: -72.7619415, latitude: 41.7158149},
  {longitude: -72.7619703, latitude: 41.7158029},
];
