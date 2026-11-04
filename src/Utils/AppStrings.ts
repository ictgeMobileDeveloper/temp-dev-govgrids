import {ENDPOINTS} from '../Network/Urls';

export const AppStrings = {
  Network: {
    internetError: 'Please check your internet connection and try again',
    emailAlreadyUse: 'That email address is already in use!',
    invalidEmail: 'That email address is invalid!',
    invalidPassword: 'The password is invalid!',
    userNotFound: 'User not found against this Email.',
    tryAgainLater: 'Too many request, try again later.',
    locationPermission:
      'To show you the most accurate store locations and best deals from QuickZip Customer app nearby, please enable location services.',
    someThingError: 'Something went wrong!',
    ageVerificationTxt: 'Are you 21 years or older?',
  },
  Permissions: {
    contactPermission:
      'The app wants to access contacts. Go to Settings and enable it!',
    cameraPermission:
      'The app wants to access your camera. Go to Settings and enable it!',
    contactsUnavailable: 'Contacts not accessible',
    cancelled: 'Cancelled',
    success: 'Success',
  },
  ToastType: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
  },
};

export const AsyncKeyStrings = {
  ResidentUserData: 'ResidentUserData',
  ResidentUserTimer: 'ResidentUserTimer',
  SIRUserData: 'SIRUserData',
  CDRUserData: 'CDRUserData',
  TimeKeepingUserData: 'TimeKeepingData',
  DAMUserData: 'DAMUserData',
  HelpDeskUserData: 'HelpDeskUserData',
  theme: 'theme',
  NotificationPrompt: 'NotificationPrompt',
  BaseData: 'BaseData',
  FoiaRequests: 'FoiaRequests',
  SirRequests: 'SIRRequests',
  CdrRequests: 'CDRRequests',
  AutismRequests: 'AutismRequests',
  ParkingPermitRequests: 'ParkingPermitRequests',
  ParkingSites: 'ParkingSites',
  CityCartRequests: 'CityCartRequests',
  CityCartCategories: 'CityCartCategories',
  Modules: 'Modules',
  GuestParkingSessions: 'GuestParkingSessions',
  MaintenanceSeenId: 'MaintenanceSeenId',
  LoginTime: {
    Resient: 'ResidentLoginTime',
    SIR: 'SIRLoginTime',
    CDR: 'CDRLoginTime',
    TK: 'TimeKeepingLoginTime',
  },
};

export type AuthContext =
  | 'RESIDENT'
  | 'CDR'
  | 'SIR'
  | 'DAM'
  | 'TIMEKEEPING'
  | 'HELPDESK';

export const AUTH_CONTEXT_CONFIG: Record<
  AuthContext,
  {
    profileEndpoint: string;
    asyncKey: string;
    reduxSetter: (payload: any) => any;
  }
> = {
  RESIDENT: {
    profileEndpoint: ENDPOINTS.getProfile,
    asyncKey: 'ResidentUserData',
    reduxSetter: payload => ({
      type: 'Reducer/setResidentUserData',
      payload,
    }),
  },
  CDR: {
    profileEndpoint: ENDPOINTS.cdrGetProfile,
    asyncKey: 'CDRUserData',
    reduxSetter: payload => ({
      type: 'Reducer/setCDRUserData',
      payload,
    }),
  },
  SIR: {
    profileEndpoint: ENDPOINTS.sirGetProfile,
    asyncKey: 'SIRUserData',
    reduxSetter: payload => ({
      type: 'Reducer/setSIRUserData',
      payload,
    }),
  },
  DAM: {
    profileEndpoint: ENDPOINTS.vendorProfile,
    asyncKey: 'DAMUserData',
    reduxSetter: payload => ({
      type: 'Reducer/setDAMUserData',
      payload,
    }),
  },
  TIMEKEEPING: {
    profileEndpoint: ENDPOINTS.getSeasonalEmpProfile,
    asyncKey: AsyncKeyStrings.TimeKeepingUserData,
    reduxSetter: payload => ({
      type: 'Reducer/setTimeKeepingUserData',
      payload,
    }),
  },
  HELPDESK: {
    profileEndpoint: ENDPOINTS.helpDeskGetProfile,
    asyncKey: AsyncKeyStrings.HelpDeskUserData,
    reduxSetter: payload => ({
      type: 'Reducer/setHelpDeskUserData',
      payload,
    }),
  },
};

export const CurrentStates = {
  Resident_No_Login: 'Resident_No_Login',
  Resident_Logged_In: 'Resident_Logged_In',
};

export const Empty_Screen_Type = {
  Notification: 'Notification',
  List: 'List',
  Report: 'Report',
  Offline_Message: 'Offline_Message',
  Property: 'Property',
} as const;

export type EmptyScreenType =
  (typeof Empty_Screen_Type)[keyof typeof Empty_Screen_Type];

export const Cart_Rental_Card_Type = {
  My_Cart_Requests: 'My Cart Requests',
  Report_Cart_Damage: 'Report Cart Damage',
  Return_a_Cart: 'Return a Cart',
};

export const Parking_Permit_Card_Type = {
  ParkingSites: 'ParkingSites',
  ParkingPermits: 'ParkingPermits',
  ParkingSession: 'ParkingSession',
  ParkingAssosiation: 'ParkingCompany',
};

export const Help_Desk_Card_Type = {
  My_Tickets: 'MyTickets',
  Changes: 'Changes',
  Problems: 'Problems',
  Service_Catalog: 'ServiceCataglog',
  Knowledge_Base: 'KnowledgeBase',
  Property: 'Property',
};

export const Billing_Card_Type = {
  Graphic_Designer: 'Graphic Designer',
  // code: 'GDI',

  Police_Duty: 'Police Duty',
  //  code: 'PDI'},
  Marijuana_Billing: 'Marijuana',
  // code: 'MJB'
  Medical_Billing: 'Medical Billing',
  // code: 'MDB'
  Police_Academy_Billing: 'Police Academy Billing',
  // code: 'PAB',
};

export const Billing_Types_Type = {
  Invoices: 'Invoices',
  Jobs: 'Jobs',
};
