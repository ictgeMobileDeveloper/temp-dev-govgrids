import {createSlice} from '@reduxjs/toolkit';

interface IReduxState {
  currentTab: number;
  isNetConnected: boolean;
  isLoaderStart: boolean;
  isAlertShow: any;
  userData: any;
  pushObj: any;
  showNoti: boolean;
  showToast: any;
  isShowRegionRestModal: any;
  userToken: any;
  isTablet: any;
}

const initialState: IReduxState = {
  currentTab: 0,
  isNetConnected: false,
  isLoaderStart: false,
  isAlertShow: {},
  userData: null,
  pushObj: null,
  showNoti: false,
  showToast: {type: '', message: ''},
  isShowRegionRestModal: {value: false, isServiceAvaliable: false},
  userToken: '',
  isTablet: false,
};

export const Reducer = createSlice({
  name: 'Reducer',
  initialState,
  reducers: {
    setTab: (state, action) => {
      state.currentTab = action.payload;
    },
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
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    logOut: (state, action) => {
      state.userData = action.payload;
    },
    setPushNotifiObj: (state, action) => {
      state.pushObj = action.payload;
    },
    setIsShowNoti: (state, action) => {
      state.showNoti = action.payload;
    },

    setIsShowRegionRestModal: (state, action) => {
      state.isShowRegionRestModal = action.payload;
    },
    setUserToken: (state, action) => {
      state.userToken = action.payload;
    },

    setIsTablet: (state, action) => {
      state.isTablet = action.payload;
    },
  },
});

export const {
  setTab,
  setNetState,
  setIsLoader,
  setIsAlertShow,
  setUserData,
  logOut,
  setPushNotifiObj,
  setIsShowNoti,
  setShowToast,
  setIsShowRegionRestModal,
  setUserToken,
  setIsTablet,
} = Reducer.actions;

export default Reducer.reducer;
