import {useEffect, useState} from "react";
import PartySelector from "./PartySelector.tsx";
import {AnimatePresence, motion} from "framer-motion";
import TimeSelector from "./TimeSelector.tsx";
import RegionSelector from "./RegionSelector.tsx";
import ThemeSelector from "./ThemeSelector.tsx";
import PlaceSelector from "./PlaceSelector.tsx";
import {useDispatch} from "react-redux";
import {plannerAction} from "../../core/redux/PlannerReducer.ts";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {PageStepperMotion} from "../../core/motionVariants.ts";
import GeneratePlan from "./GeneratePlan.tsx";


function CorePlanner() {
  const [step, setStep] = useState<number>(0);
  const [isForward, setIsForward] = useState<number>(1);

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

  const stepHeaders = [
    "누구랑 같이 놀아볼까요?",
    "어디로 놀러갈까요?",
    "언제 놀러가는게 좋을까요?",
    "어떤 분위기로 놀아볼까요?",
    "이런 곳은 어떤가요?"
  ]

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(plannerAction.clear());

    dispatch(plannerAction.setMember([{
      name: myName ?? "나",
      uid: myUuid ?? ""
    }]));
  }, [dispatch, myName, myUuid]);

  return (
    <>
      <div className={"w-screen absolute left-0 top-0 overflow-clip"}>
        <motion.div
          className={
            "w-screen rounded-r-full h-[4px] bg-neutral-700"
          }
          initial={{width: 0}}
          animate={{
            width: (step * 25.25) + "%",
          }}
        />
      </div>
      <div className={"flex flex-col gap-4 mt-[4px] p-5 h-[calc(100vh-68.74px)]"}>
        {/* 여기에 initial false 걸면 아래 skeletion animation 고장남 */}
        <AnimatePresence mode={"wait"} custom={isForward}>
          <motion.div
            key={step}
            custom={isForward}
            variants={PageStepperMotion}
            initial={"initial"}
            animate={"animate"}
            exit={"exit"}
            className={"h-full flex flex-col gap-4"}
          >
            <p className={"text-2xl font-bold"}>{stepHeaders[step]}</p>
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
                prev={prev}
                next={next}
              />
            }
            {step === 3 &&
              <ThemeSelector
                prev={prev}
                next={next}
              />
            }
            {step === 4 &&
              <PlaceSelector
                prev={prev}
                next={next}
              />
            }
            {step === 5 &&
              <GeneratePlan/>
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default CorePlanner;
