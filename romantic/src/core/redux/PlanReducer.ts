import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface PlanStateType {
  uid: string
  name: string;
  host_id: string;
  date: {
    polling: string | null;
    from: string | null;
    to: string | null;
  };
  members: Array<{
    uid: string;
    name: string;
    role: number;
  }>;
  role: PlanRole;
  refreshInterrupt: number;
}

interface PlanInitializeType {
  uid: string
  name: string;
  host_id: string;
  date: {
    polling: string | null;
    from: string | null;
    to: string | null;
  };
  members: Array<{
    uid: string;
    name: string;
    role: number;
  }>;
}

// @ts-expect-error enum이 뭐 어때서
enum PlanRole {
  HOST = 0,
  COHOST = 1,
  MEMBER = 2,
  OBSERVER = 3
}


const initialState: PlanStateType = {
  uid: "",
  name: "",
  host_id: "",
  date: {
    polling: null,
    from: null,
    to: null
  },
  members: [],
  role: PlanRole.OBSERVER,
  refreshInterrupt: 0
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
      state.refreshInterrupt = initialState.refreshInterrupt;
      state.role = initialState.role;
    },
    init: (state: PlanStateType, action: PayloadAction<PlanInitializeType>) => {
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.host_id = action.payload.host_id;
      state.date = action.payload.date;
      state.members = action.payload.members;
    },
    setRole: (state: PlanStateType, action: PayloadAction<string>) => {
      for (const member of state.members) {
        if (member.uid === action.payload) {
          switch (member.role) {
            case 0:
              state.role = PlanRole.HOST;
              break;
            case 1:
              state.role = PlanRole.COHOST;
              break;
            case 2:
              state.role = PlanRole.MEMBER;
              break;
            default:
              state.role = PlanRole.OBSERVER;
          }
        }
      }
    },
    refresh: (state: PlanStateType) => {
      state.refreshInterrupt += 1;
    }
  }
});

export const planActions = planSlice.actions;
export default planSlice.reducer;
export {PlanRole};
export type {PlanStateType};

