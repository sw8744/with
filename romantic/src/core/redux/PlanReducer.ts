import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {FriendInformationType} from "../apiResponseInterfaces/relationship.ts";
import type {Place, Region} from "../model/LocationModels.ts";
import type {ThemeMapping} from "../model/Theme.ts";

interface PlannerStateType {
  name: string | null;
  members: FriendInformationType[];
  region: Region[];
  places: Place[];
  dateFrom: string;
  dateTo: string;
  themes: ThemeMapping;
}

const initialState: PlannerStateType = {
  name: "",
  members: [],
  region: [],
  places: [],
  dateFrom: "",
  dateTo: "",
  themes: {}
}

const plannerSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    clear: (state: PlannerStateType) => {
      state.name = initialState.name;
      state.members = initialState.members;
      state.region = initialState.region;
      state.places = initialState.places;
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
    setTheme: (state: PlannerStateType, action: PayloadAction<ThemeMapping>) => {
      state.themes = action.payload;
    },
    setPlaces: (state: PlannerStateType, action: PayloadAction<Place[]>) => {
      state.places = action.payload;
    }
  }
});

export const plannerAction = plannerSlice.actions;
export default plannerSlice.reducer;
export type {PlannerStateType};

