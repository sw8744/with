import store from "../redux/RootReducer.ts";
import {v4 as uuidv4} from "uuid";
import {notificationCenterAction} from "../redux/NotificationReducer.ts";

function issueNotification(
  title: string,
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) {
  const id = uuidv4();

  setTimeout(() => {
    store.dispatch(
      notificationCenterAction.removeNotification(id)
    );
  }, 5000);

  store.dispatch(
    notificationCenterAction.issueNotification({
      title: title,
      message: message,
      type: type,
      identifier: id
    })
  );
}

export default issueNotification;
