import {useAppDispatch, useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import {notificationCenterAction} from "../../../core/redux/NotificationReducer.ts";
import {AnimatePresence, motion} from "framer-motion";

const NotificationTypeClass = {
  "error": "bg-red-800 border-red-900 text-red-200",
  "info": "bg-blue-800 border-blue-900 text-blue-200",
  "success": "bg-green-800 border-green-900 text-green-200",
  "warning": "bg-amber-800 border-amber-900 text-amber-200",
}

function NotificationCenter() {
  const notifications = useAppSelector(state => state.notificationReducer.notifications);
  const dispatch = useAppDispatch();

  function closeNotification(id: string) {
    dispatch(notificationCenterAction.removeNotification(id));
  }

  const notificationStack = notifications.map((notification) => {
    return (
      <motion.button
        key={notification.identifier}
        className={
          "relative overflow-clip px-3 py-2 w-96 border rounded-lg text-left " + NotificationTypeClass[notification.type]
        }
        onClick={() => closeNotification(notification.identifier)}
        initial={{opacity: 0, x: "100%"}}
        animate={{opacity: 1, x: "0%"}}
        exit={{opacity: 0, x: "100%"}}
        transition={{
          ease: "easeInOut",
          duration: 0.35
        }}
      >
        <div className={"flex justify-between items-center"}>
          <p className={"text-lg font-medium mb-1"}>{notification.title}</p>
          <p>Ｘ</p>
        </div>
        {notification.message.split("\n").map((line, lineIndex) => (
          <p key={lineIndex} className={"whitespace-pre-wrap"}>{line}</p>
        ))}
        <motion.div
          className={"absolute left-0 bottom-0 h-0.5 bg-white/50"}
          initial={{width: "100%"}}
          animate={{width: "0%"}}
          transition={{duration: 5, ease: "linear"}}
        />
      </motion.button>
    );
  });

  return (
    <div className={"absolute right-3 bottom-3 flex flex-col gap-2"}>
      <AnimatePresence>
        {notificationStack}
      </AnimatePresence>
    </div>
  );
}

export default NotificationCenter;
