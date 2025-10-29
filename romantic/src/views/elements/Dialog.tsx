import type {ReactNode} from "react";
import {AnimatePresence, motion} from "framer-motion";

interface DialogPropsType {
  children: ReactNode;
  show: boolean;
  onClose?: () => void;
  closeWhenBackgroundTouch?: boolean
}

function Dialog(
  {
    children, show, onClose,
    closeWhenBackgroundTouch = false
  }: DialogPropsType
) {
  function whenBackgroundClicked() {
    if (closeWhenBackgroundTouch) onClose?.();
  }

  return (
    <AnimatePresence>
      {show &&
        <motion.div
          className={
            "w-full h-screen absolute left-0 top-0 z-50 " +
            "bg-[#0008] flex flex-col justify-end"
          }
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeInOut"
          }}
          onClick={whenBackgroundClicked}
        >
          <motion.div
            initial={{
              translateY: "100%"
            }}
            animate={{
              translateY: 0
            }}
            exit={{
              translateY: 0
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut"
            }}
            className={"px-5 py-3 pt-5 max-w-[500px] w-full mx-auto rounded-t-2xl flex flex-col gap-3 bg-light"}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>
  );
}

export default Dialog;
