import { configureStore } from '@reduxjs/toolkit';
import AppReducer from './AppReducers';

export const store = configureStore({
  reducer: { SliceReducer: AppReducer },
});

export type AppRootStore = ReturnType<typeof store.getState>;
export default store;
