import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface PlanStateType {
  uid: string
  name: string;
  host_id: string;
  date: {
    from: string;
    to: string;
  };
  members: Array<{
    uid: string;
    name: string;
    role: number;
  }>;
}

const initialState: PlanStateType = {
  uid: "",
  name: "",
  host_id: "",
  date: {
    from: "",
    to: ""
  },
  members: []
}

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    clear: (state: PlanStateType) => {
      state.uid = initialState.uid;
      state.name = initialState.name;
      state.host_id = initialState.host_id;
      state.date = initialState.date;
      state.members = initialState.members;
    },
    init: (state: PlanStateType, action: PayloadAction<PlanStateType>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.host_id = action.payload.host_id;
      state.date = action.payload.date;
      state.members = action.payload.members;
    }
  }
});

export const planActions = planSlice.actions;
export default planSlice.reducer;
export type {PlanStateType};

