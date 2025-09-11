import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface UserInfoStateType {
  name: string | null;
  uid: string | null
  accessToken: string | null;
  role: string[];
}

interface UserSignInType {
  name: string;
  uid: string;
  accessToken: string;
  role: string[];
}

const initialState: UserInfoStateType = {
  name: null,
  uid: null,
  accessToken: null,
  role: []
}

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    signIn: (state: UserInfoStateType, action: PayloadAction<UserSignInType>) => {
      state.name = action.payload.name;
      state.uid = action.payload.uid;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
    },

    changeName: (state: UserInfoStateType, action: PayloadAction<string>) => {
      state.name = action.payload;
    },

    signOut: (state: UserInfoStateType) => {
      state.uid = initialState.uid;
      state.name = initialState.name;
      state.accessToken = initialState.accessToken;
      state.role = [];
    }
  }
});

export const userInfoAction = userInfoSlice.actions;
export default userInfoSlice.reducer;
export type {UserInfoStateType, UserSignInType};
