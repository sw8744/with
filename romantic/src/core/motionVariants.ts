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
    ease: 'easeInOut',
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
    ease: 'easeInOut'
  }
}


export {
  BlockListMotion, PageStepperMotion
}
