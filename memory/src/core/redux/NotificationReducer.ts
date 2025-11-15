import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface NotificationStateType {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  identifier: string
}

interface NotificationStackType {
  notifications: NotificationStateType[];
}

const initialState: NotificationStackType = {
  notifications: []
}

const notificationCenterSlice = createSlice({
  name: "notificationCenter",
  initialState,
  reducers: {
    issueNotification: (state: NotificationStackType, action: PayloadAction<NotificationStateType>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state: NotificationStackType, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.identifier !== action.payload);
    }
  }
});

export const notificationCenterAction = notificationCenterSlice.actions;
export default notificationCenterSlice.reducer;
export type {NotificationStateType};
