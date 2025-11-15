import {combineReducers} from "redux";
import userInfoReducer from "./UserInfoReducer.ts";
import {configureStore} from "@reduxjs/toolkit";
import notificationReducer from "./NotificationReducer.ts";

const rootReducer = combineReducers({
  userInfoReducer, notificationReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
