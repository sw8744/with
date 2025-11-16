import {ChevronLeftIcon} from "../../../assets/svgs/svgs.ts";
import {useNavigate} from "react-router-dom";
import {type ReactNode} from "react";
import {PageTransitionMotion} from "../../../core/motionVariants.ts";
import {motion} from "framer-motion";

function BackHeader(
  {title, className}: { title: string, className?: string }
) {
  const navigate = useNavigate();

  function back() {
    navigate(-1);
  }

  return (
    <div
      className={
        'flex justify-between items-center px-5 py-4 border-b border-neutral-300' +
        (className ? ` ${className}` : '')
      }
    >
      <button onClick={back}>
        <ChevronLeftIcon height={24}/>
      </button>
      <p className={'text-lg font-medium'}>{title}</p>
      <p/>
    </div>
  );
}

function PageTransitionLayer(
  {children, className}: { children: ReactNode, className?: string }
) {
  return (
    <motion.div
      variants={PageTransitionMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
      className={
        "bg-light w-full" +
        (className ? " " + className : "")
      }
    >
      {children}
    </motion.div>
  )
}

export {
  BackHeader,
  PageTransitionLayer,
}
