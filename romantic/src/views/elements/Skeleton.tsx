import {type ReactNode} from "react";
import {motion, stagger} from "framer-motion";

const frameMotionVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delayChildren: stagger(0.1),
      when: 'beforeChildren'
    }
  }
}

const unitMotionVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: [1, 0.4],
    transition: {
      duration: 0.7,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut'
    }
  }
}

function SkeletonFrame(
  {children, noCaption, className}: { children: ReactNode, noCaption?: boolean, className?: string }
) {
  return (
    <motion.div
      role="status"
      className={className ?? ''}
      variants={frameMotionVariants}
      initial={'hidden'}
      animate={'visible'}
    >
      {children}
      {!noCaption && <span className="sr-only">로딩중</span>}
    </motion.div>
  );
}

function SkeletonUnit(
  {children, className}: {
    children: ReactNode,
    className?: string
  }
) {
  return (
    <motion.div
      className={className ? ' ' + className : ''}
      variants={unitMotionVariants}
    >
      {children}
    </motion.div>
  );
}

function SkeletonElement(
  {expW, expH, className}: {
    expW?: number | string,
    expH?: number | string,
    className?: string,
  }
) {
  return (
    <div
      className={'bg-neutral-300' + (className ? ' ' + className : '')}
      style={{
        width: expW,
        height: expH
      }}
    />
  )
}

export {
  SkeletonElement,
  SkeletonFrame,
  SkeletonUnit
}
