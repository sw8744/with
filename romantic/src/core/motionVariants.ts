const BlockListMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
  transition: {
    duration: 0.3,
    ease: "easeInOut",
    layout: {
      type: "spring", stiffness: 400, damping: 30
    }
  }
}

const PageStepperMotion = {
  initial: (direction: number) => ({
    x: 10 * direction,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: -10 * direction,
    opacity: 0
  }),
  transition: {
    duration: 0.2,
    ease: "easeInOut"
  }
}

const CarouselStepperMotion = {
  initial: (direction: number) => ({
    x: direction > 0 ? "102%" : "-102%"
  }),
  animate: {
    x: 0
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-102%" : "102%"
  })
}

const PageTransitionMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
  transition: {
    duration: 0.2,
    ease: "easeInOut"
  }
}

const HorizontalListMotionVariants = {
  initial: {
    opacity: 0,
    y: 3
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: 3
  },
  transition: {
    duration: 0.2,
    ease: "easeInOut",
    layout: {
      type: "spring", stiffness: 400, damping: 30
    }
  }
}


export {
  BlockListMotion, PageStepperMotion, CarouselStepperMotion, HorizontalListMotionVariants, PageTransitionMotion
}
