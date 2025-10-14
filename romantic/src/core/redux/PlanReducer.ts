import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {FriendInformationType} from "../apiResponseInterfaces/relationship.ts";

interface PlannerStateType {
  name: string | null;
  members: FriendInformationType[];
  region: string[];
}

const initialState: PlannerStateType = {
  name: "",
  members: [],
  region: [],
}

const plannerSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    clear: (state: PlannerStateType) => {
      state.name = initialState.name;
      state.members = initialState.members;
      state.region = initialState.region;
    },
    setMember: (state: PlannerStateType, action: PayloadAction<FriendInformationType[]>) => {
      state.members = action.payload;
    }
  }
});

export const plannerAction = plannerSlice.actions;
export default plannerSlice.reducer;
export type {PlannerStateType};

