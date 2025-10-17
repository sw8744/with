import {useEffect, useState} from "react";
import PartySelector from "./PartySelector.tsx";
import {AnimatePresence, motion} from "framer-motion";
import TimeSelector from "./TimeSelector.tsx";
import RegionSelector from "./RegionSelector.tsx";
import ThemeSelector from "./ThemeSelector.tsx";
import PlaceSelector from "./PlaceSelector.tsx";
import {useDispatch} from "react-redux";
import {plannerAction} from "../../core/redux/PlanReducer.ts";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";


function CorePlan() {
  const [step, setStep] = useState<number>(0);
  const [isForward, setIsForward] = useState<number>(1);

  const [theme, setTheme] = useState<string[]>([]);
  const [placesToGo, setPlacesToGo] = useState<string[]>([]);
  const [whenToGo, setWhenToGo] = useState<string>('');

  const myUuid = useAppSelector(state => state.userInfoReducer.uid);
  const myName = useAppSelector(state => state.userInfoReducer.name);

  function prev() {
    setIsForward(-1);
    setStep(step - 1);
  }
  function next() {
    setIsForward(1);
    setStep(step + 1);
  }

  const motionVariants = {
    initial: (direction: number) => ({
      x: 10 * direction,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: (direction: number) => ({
      x: -10 * direction,
      opacity: 0
    })
  }
  const stepHeaders = [
    '누구랑 같이 놀아볼까요?',
    '어디로 놀러갈까요?',
    '언제 놀러가는게 좋을까요?',
    '어떤 분위기로 놀아볼까요?',
    '이런 곳은 어떤가요?'
  ]

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(plannerAction.clear());

    dispatch(plannerAction.setMember([{
      name: myName ?? '나',
      uid: myUuid ?? ''
    }]));
  }, [dispatch, myName, myUuid]);

  return (
    <>
      <div className={'flex gap-2'}>
        <motion.div
          key={'progress'}
          className={'absolute left-0 top-0 w-screen rounded-r-full h-[4px] bg-neutral-700'}
          animate={{
            width: (step * 25.25) + '%',
          }}
        />
      </div>
      <div className={'flex flex-col gap-4 mt-[4px] p-5 h-[calc(100vh-68.74px)]'}>
        {/* 여기에 initial false 걸면 아래 skeletion animation 고장남 */}
        <AnimatePresence mode={'wait'} custom={isForward}>
          <motion.div
            key={step}
            custom={isForward}
            variants={motionVariants}
            initial={"initial"}
            animate={"animate"}
            exit={"exit"}
            className={'h-full flex flex-col gap-4'}
          >
            <p className={'text-2xl font-bold'}>{stepHeaders[step]}</p>
            {step === 0 &&
              <PartySelector next={next}/>
            }
            {step === 1 &&
              <RegionSelector
                prev={prev}
                next={next}
              />
            }
            {step === 2 &&
              <TimeSelector
                selectedTime={whenToGo}
                setSelectedTime={setWhenToGo}
                prev={prev}
                next={next}
              />
            }
            {step === 3 &&
              <ThemeSelector
                themeUUID={theme}
                setThemeUUID={setTheme}
                prev={prev}
                next={next}
              />
            }
            {step === 4 &&
              <PlaceSelector
                placeUUID={placesToGo}
                setPlaceUUID={setPlacesToGo}
                prev={prev}
                next={next}
              />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default CorePlan;
