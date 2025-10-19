import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {FriendInformationType} from "../apiResponseInterfaces/relationship.ts";
import type {Region} from "../model/LocationModels.ts";
import type {Theme} from "../model/Theme.ts";

interface PlannerStateType {
  name: string | null;
  members: FriendInformationType[];
  region: Region[];
  dateFrom: string;
  dateTo: string;
  themes: Theme[];
}

const initialState: PlannerStateType = {
  name: "",
  members: [],
  region: [],
  dateFrom: "",
  dateTo: "",
  themes: []
}

const plannerSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    clear: (state: PlannerStateType) => {
      state.name = initialState.name;
      state.members = initialState.members;
      state.region = initialState.region;
      state.dateFrom = initialState.dateFrom;
      state.dateTo = initialState.dateTo;
      state.themes = initialState.themes;
    },
    setMember: (state: PlannerStateType, action: PayloadAction<FriendInformationType[]>) => {
      state.members = action.payload;
    },
    setRegion: (state: PlannerStateType, action: PayloadAction<Region[]>) => {
      state.region = action.payload;
    },
    setDateFrom: (state: PlannerStateType, action: PayloadAction<string>) => {
      state.dateFrom = action.payload;
    },
    setDateTo: (state: PlannerStateType, action: PayloadAction<string>) => {
      state.dateTo = action.payload;
    },
    setTheme: (state: PlannerStateType, action: PayloadAction<Theme[]>) => {
      state.themes = action.payload;
    }
  }
});

export const plannerAction = plannerSlice.actions;
export default plannerSlice.reducer;
export type {PlannerStateType};

