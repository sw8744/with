import {combineReducers} from "redux";
import userInfoReducer from "./UserInfoReducer.ts";
import plannerReducer from "./PlannerReducer.ts";
import {configureStore} from "@reduxjs/toolkit";
import planReducer from "./PlanReducer.ts";

const rootReducer = combineReducers({
  userInfoReducer, plannerReducer, planReducer
});

const store = configureStore({
  reducer: rootReducer,
  devTools: true
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
