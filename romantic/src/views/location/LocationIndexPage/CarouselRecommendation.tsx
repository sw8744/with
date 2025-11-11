import {AnimatePresence, motion} from "framer-motion";
import {CarouselStepperMotion} from "../../../core/motionVariants.ts";
import {useEffect, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "../../../assets/svgs/svgs.ts";

function CarouselRecommendation() {
  const CAROUSEL_COUNT = 2;
  const [carouselPosition, setCarouselPosition] = useState<number>(0);
  const [isForward, setIsForward] = useState<number>(1);
  const [lockControl, setLockControl] = useState<boolean>(false);

  function prev() {
    if (lockControl) return;

    setIsForward(-1);
    setLockControl(true);
    if (carouselPosition === 0) setCarouselPosition(CAROUSEL_COUNT - 1);
    else setCarouselPosition(carouselPosition - 1);

    setTimeout(() => {
      setLockControl(false);
    }, 1000);
  }

  function next() {
    if (lockControl) return;

    setLockControl(true);
    setIsForward(1);
    if (carouselPosition === CAROUSEL_COUNT - 1) setCarouselPosition(0);
    else setCarouselPosition(carouselPosition + 1);

    setTimeout(() => {
      setLockControl(false);
    }, 1000);
  }

  useEffect(() => {
    const int = setInterval(() => {
      next();
    }, 4000);

    return () => clearInterval(int);
  });

  return (
    <div className={'relative'}>
      <div className={'absolute left-0 top-0 h-full flex items-center z-10'}>
        <button
          className={'bg-neutral-50 rounded-full p-[10px] transition-all duration-200 shadow-lg hover:bg-neutral-200'}
          onClick={prev}
        >
          <ChevronLeftIcon width={18} height={18}/>
        </button>
      </div>

      <div className={'relative mx-[14px] aspect-video overflow-clip'}>
        <AnimatePresence initial={false} custom={isForward}>
          <motion.div
            key={carouselPosition}
            custom={isForward}
            variants={CarouselStepperMotion}
            initial={"initial"}
            animate={"animate"}
            exit={"exit"}
            transition={{
              duration: 1,
              ease: "easeInOut"
            }}
            className={"absolute"}
          >
            <RecommendationCarousel
              url={"https://common-media.interparkcdn.net/exhibition/251002003/554fbbbb-761d-4f1d-aa76-a34c5d081580.png"}
              code={0} position={carouselPosition}
            />
            <RecommendationCarousel
              url={"https://common-media.interparkcdn.net/exhibition/250908001/e0c97366-40d7-4f1e-a91c-701498e51e20.png"}
              code={1} position={carouselPosition}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={'absolute right-0 top-0 h-full flex items-center z-10'}>
        <button
          className={'bg-neutral-50 rounded-full p-[10px] transition-all duration-200 shadow-lg hover:bg-neutral-200'}
          onClick={next}
        >
          <ChevronRightIcon width={18} height={18}/>
        </button>
      </div>
    </div>
  );
}

function RecommendationCarousel(
  {url, title, description, code, position}: {
    url: string,
    title?: string,
    description?: string,
    code: number,
    position: number
  }
) {
  if (code !== position) return null;

  return (
    <motion.div
      className={'w-full rounded-2xl overflow-clip relative'}
    >
      <img
        src={url}
        className={'aspect-video'}
      />
      <div className={'absolute left-0 top-0 w-full h-full px-5 flex flex-col justify-center'}>
        <p className={'text-3xl font-medium max-w-1/2 break-keep'}>{title}</p>
        <p className={'mt-4 text-xl'}>{description}</p>
      </div>
    </motion.div>
  );
}

export default CarouselRecommendation;
