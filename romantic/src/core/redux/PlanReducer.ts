import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {FriendInformationType} from "../apiResponseInterfaces/relationship.ts";
import type {Region} from "../model/LocationModels.ts";

interface PlannerStateType {
  name: string | null;
  members: FriendInformationType[];
  region: Region[];
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
    },
    setRegion: (state: PlannerStateType, action: PayloadAction<Region[]>) => {
      state.region = action.payload;
    }
  }
});

export const plannerAction = plannerSlice.actions;
export default plannerSlice.reducer;
export type {PlannerStateType};

