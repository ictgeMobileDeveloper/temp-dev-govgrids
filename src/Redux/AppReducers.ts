import {createSlice} from '@reduxjs/toolkit';
import {CurrentStates} from '../Utils/AppStrings';

interface IReduxState {
  isNetConnected: boolean;
  isLoaderStart: boolean;
  isAlertShow: any;
  pushObj: any;
  showNoti: boolean;
  showToast: any;
  themeColors: any;
  residentUserData: any;
  language: string;
  baseData: any;
  CDRUserData: any;
  SIRUserData: any;
  TimeKeepingUserData: any;
  isCDRPopped: boolean;
  isRIPPopped: boolean;
  isAutismPopped: boolean;
  isHelpDeskPopped: boolean;
  residentTime: any;
  sirTime: any;
  cdrTime: any;
  tkTime: any;
  moduleList: any;
  staffModuleList: any;
  venderModuleList: any;
  isDarkTheme: boolean;
  isSystemDefault: boolean;
  damUserData: any;
  helpDeskUserData: any;
  residentState: any;
  currentState: string;
  offlineFoiaRequests: [];
  offlineSIRRequests: [];
  offlineCDRRequests: [];
  offlineAutismRequests: [];
  offlineParkingPermitRequests: [];
  offlineCityCartRequests: [];
  parkingSites: any[];
  cityCartCategories: any[];
  networkStatus: false;
  autismDraft: any;
  ripDraft: any;
  cdrDraft: any;
  parkingPermitDraft: any;
  activeParkingSessions: any;
  guestParkingSessions: any;
}

const initialState: IReduxState = {
  isNetConnected: false,
  staffModuleList: [],
  venderModuleList: [],
  isLoaderStart: false,
  isAlertShow: {},
  pushObj: null,
  showNoti: false,
  showToast: {type: '', message: ''},
  themeColors: {},
  residentUserData: null,
  language: 'en',
  baseData: {},
  CDRUserData: null,
  SIRUserData: null,
  TimeKeepingUserData: null,
  isCDRPopped: false,
  isAutismPopped: false,
  isHelpDeskPopped: false,
  residentTime: {},
  sirTime: {},
  cdrTime: {},
  tkTime: {},
  isRIPPopped: false,
  moduleList: [],
  isDarkTheme: false,
  isSystemDefault: false,
  damUserData: null,
  helpDeskUserData: null,
  residentState: '',
  currentState: CurrentStates.Resident_No_Login,
  offlineFoiaRequests: [],
  offlineSIRRequests: [],
  offlineCDRRequests: [],
  offlineAutismRequests: [],
  offlineParkingPermitRequests: [],
  offlineCityCartRequests: [],
  parkingSites: [],
  cityCartCategories: [],
  networkStatus: false,
  autismDraft: {},
  ripDraft: {},
  cdrDraft: {},
  parkingPermitDraft: {},
  activeParkingSessions: [],
  guestParkingSessions: [],
};

export const Reducer = createSlice({
  name: 'Reducer',
  initialState,
  reducers: {
    setNetState: (state, action) => {
      state.isNetConnected = action.payload;
    },
    setIsLoader: (state, action) => {
      state.isLoaderStart = action.payload;
    },

    setIsAlertShow: (state, action) => {
      state.isAlertShow = action.payload;
    },
    setShowToast: (state, action) => {
      state.showToast = action.payload;
    },
    setPushNotifiObj: (state, action) => {
      state.pushObj = action.payload;
    },
    setIsShowNoti: (state, action) => {
      state.showNoti = action.payload;
    },
    setThemeColors: (state, action) => {
      state.themeColors = action.payload;
    },
    setResidentUserData: (state, action) => {
      state.residentUserData = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setBaseData: (state, action) => {
      state.baseData = action.payload;
    },
    setCDRUserData: (state, action) => {
      state.CDRUserData = action.payload;
    },
    setSIRUserData: (state, action) => {
      state.SIRUserData = action.payload;
    },
    setTimeKeepingUserData: (state, action) => {
      state.TimeKeepingUserData = action.payload;
    },
    setIsCDRPopped: (state, action) => {
      state.isCDRPopped = action.payload;
    },
    setIsAutismPopped: (state, action) => {
      state.isAutismPopped = action.payload;
    },
    setIsHelpDeskPopped: (state, action) => {
      state.isHelpDeskPopped = action.payload;
    },
    setResidentTime: (state, action) => {
      state.residentTime = action.payload;
    },
    setSIRTime: (state, action) => {
      state.sirTime = action.payload;
    },
    setCDRTime: (state, action) => {
      state.cdrTime = action.payload;
    },
    setTKTime: (state, action) => {
      state.tkTime = action.payload;
    },
    setisRIPPopped: (state, action) => {
      state.isRIPPopped = action.payload;
    },
    setModuleList: (state, action) => {
      state.moduleList = action.payload;
    },
    setStaffModuleList: (state, action) => {
      state.staffModuleList = action.payload;
    },
    setVenderModuleList: (state, action) => {
      state.venderModuleList = action.payload;
    },
    setDarkTheme: (state, action) => {
      state.isDarkTheme = action.payload;
    },
    setSystemDefault: (state, action) => {
      state.isSystemDefault = action.payload;
    },
    setDAMUserData: (state, action) => {
      state.damUserData = action.payload;
    },
    setHelpDeskUserData: (state, action) => {
      state.helpDeskUserData = action.payload;
    },
    setResidentState: (state, action) => {
      state.residentState = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setOfflineFoiaReq: (state, action) => {
      state.offlineFoiaRequests = action.payload;
    },
    setofflineSIRReq: (state, action) => {
      state.offlineSIRRequests = action.payload;
    },
    setofflineCDRReq: (state, action) => {
      state.offlineCDRRequests = action.payload;
    },
    setofflineAutismReq: (state, action) => {
      state.offlineAutismRequests = action.payload;
    },
    setofflineParkingPermitReq: (state, action) => {
      state.offlineParkingPermitRequests = action.payload;
    },
    setofflineCityCartReq: (state, action) => {
      state.offlineCityCartRequests = action.payload;
    },
    setParkingSites: (state, action) => {
      state.parkingSites = action.payload;
    },
    setCityCartCategories: (state, action) => {
      state.cityCartCategories = action.payload;
    },
    updateAutismDraft: (state, action) => {
      state.autismDraft = {
        ...(state.autismDraft ?? {}),
        ...(action.payload ?? {}),
      };
    },

    clearAutismDraft: state => {
      state.autismDraft = {};
    },
    updateRipDraft: (state, action) => {
      state.ripDraft = {
        ...(state.ripDraft ?? {}),
        ...(action.payload ?? {}),
      };
    },

    clearRipDraft: state => {
      state.ripDraft = {};
    },
    updateCdrDraft: (state, action) => {
      state.cdrDraft = {
        ...(state.cdrDraft ?? {}),
        ...(action.payload ?? {}),
      };
    },

    clearCdrDraft: state => {
      state.cdrDraft = {};
    },

    updateParkingPermitDraft: (state, action) => {
      state.parkingPermitDraft = {
        ...(state.parkingPermitDraft ?? {}),
        ...(action.payload ?? {}),
      };
    },

    clearParkingPermitDraft: state => {
      state.parkingPermitDraft = {};
    },
    setActiveParkingSessions: (state, action) => {
      state.activeParkingSessions = action.payload;
    },
    setGuestParkingSessions: (state, action) => {
      state.guestParkingSessions = action.payload;
    },
  },
});

export const {
  setNetState,
  setIsLoader,
  setIsAlertShow,
  setPushNotifiObj,
  setIsShowNoti,
  setShowToast,
  setThemeColors,
  setResidentUserData,
  setLanguage,
  setBaseData,
  setCDRUserData,
  setSIRUserData,
  setTimeKeepingUserData,
  setIsCDRPopped,
  setResidentTime,
  setSIRTime,
  setCDRTime,
  setTKTime,
  setisRIPPopped,
  setModuleList,
  setVenderModuleList,
  setDarkTheme,
  setSystemDefault,
  setDAMUserData,
  setHelpDeskUserData,
  setResidentState,
  setCurrentState,
  setStaffModuleList,
  setIsAutismPopped,
  setIsHelpDeskPopped,
  setOfflineFoiaReq,
  setofflineSIRReq,
  setofflineCDRReq,
  setofflineAutismReq,
  setofflineParkingPermitReq,
  setofflineCityCartReq,
  setParkingSites,
  setCityCartCategories,
  updateAutismDraft,
  clearAutismDraft,
  updateRipDraft,
  clearRipDraft,
  updateCdrDraft,
  clearCdrDraft,
  updateParkingPermitDraft,
  clearParkingPermitDraft,
  setActiveParkingSessions,
  setGuestParkingSessions,
} = Reducer.actions;

export default Reducer.reducer;
