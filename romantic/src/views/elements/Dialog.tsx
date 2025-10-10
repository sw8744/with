import type {ReactNode} from "react";
import {AnimatePresence, motion} from "framer-motion";

interface DialogPropsType {
  children: ReactNode;
  show: boolean;
  onClose?: () => void;
  closeWhenBackgroundTouch: boolean
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
            'w-screen h-screen absolute left-0 top-0 z-50 ' +
            'bg-[#0008] flex justify-center items-center'
          }
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.15
            }
          }}
          exit={{
            opacity: 0
          }}
          onClick={whenBackgroundClicked}
        >
          <div
            className={'px-3 py-2 min-w-1/2 rounded-2xl flex flex-col gap-3 bg-light'}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </div>
        </motion.div>
      }
    </AnimatePresence>
  );
}

export default Dialog;
