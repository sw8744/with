import {DatePicker} from "../elements/Inputs.tsx";
import {Button} from "../elements/Buttons.tsx";
import {AnimatePresence, motion} from "framer-motion";

function TimeSelector(
  {selectedTime, setSelectedTime, prev, next}: {
    selectedTime: string,
    setSelectedTime: (time: string) => void,
    prev: () => void;
    next: () => void;
  }
) {
  return (
    <>
      <div className={'h-full'}>
        <DatePicker
          value={selectedTime}
          setter={setSelectedTime}
        />
        {selectedTime}
      </div>
      <div>
        <AnimatePresence>
          {selectedTime === '' &&
            <motion.p
              className={'text-center text-sm text-neutral-500 my-2'}
              initial={{opacity: 0}}
              animate={{
                opacity: 1,
                transition: {
                  duration: 0.2,
                  ease: "easeInOut"
                }
              }}
              exit={{opacity: 0}}
            >아직 결정을 못했다면 나중에 투표로 결정할 수 있어요</motion.p>
          }
        </AnimatePresence>
        <div className={'flex justify-between'}>
          <Button onClick={prev}>이전</Button>
          <AnimatePresence mode={'popLayout'}>
            {selectedTime === '' ? (
              <Button onClick={next}>나중에 결정</Button>
            ) : (
              <Button onClick={next}>다음</Button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default TimeSelector;
