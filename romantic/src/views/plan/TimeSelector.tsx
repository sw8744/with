import {DateRangePicker} from "../elements/Inputs.tsx";
import {Button} from "../elements/Buttons.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {useDispatch} from "react-redux";
import {plannerAction} from "../../core/redux/PlanReducer.ts";

function TimeSelector(
  {prev, next}: {
    prev: () => void;
    next: () => void;
  }
) {
  const dateFrom = useAppSelector(state => state.plannerReducer.dateFrom);
  const dateTo = useAppSelector(state => state.plannerReducer.dateTo);

  const dispatch = useDispatch();

  function setDateFrom(date: Date | null) {
    if (date === null) dispatch(plannerAction.setDateFrom(''));
    else dispatch(plannerAction.setDateFrom(date.toISOString()));
  }

  function setDateTo(date: Date | null) {
    if (date === null) dispatch(plannerAction.setDateTo(''));
    else dispatch(plannerAction.setDateTo(date.toISOString()));
  }

  function clearDate() {
    setDateFrom(null);
    setDateTo(null);
  }

  function ISOToDate(dateString: string): (Date | null) {
    if (dateString === '') return null;
    return new Date(dateString);
  }

  return (
    <>
      <div className={'h-full'}>
        <DateRangePicker
          fromValue={ISOToDate(dateFrom)}
          toValue={ISOToDate(dateTo)}
          fromSetter={setDateFrom}
          toSetter={setDateTo}
        />
        <AnimatePresence>
          {dateTo !== '' &&
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.2,
                ease: 'easeInOut'
              }}
              className={'flex justify-end'}
            >
              <Button
                className={'!px-4 !py-1 text-base my-2'}
                onClick={clearDate}
                theme={'white'}
              >일정 삭제</Button>
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <div>
        <AnimatePresence>
          {dateTo === '' &&
            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.2,
                ease: 'easeInOut'
              }}
              className={'text-center text-sm text-neutral-500 my-2'}
            >아직 결정을 못했다면 나중에 투표로 결정할 수 있어요</motion.p>
          }
        </AnimatePresence>
        <div className={'flex justify-between'}>
          <Button onClick={prev}>이전</Button>
          {dateTo === '' ? (
            <Button onClick={next}>나중에 결정</Button>
          ) : (
            <Button onClick={next}>다음</Button>
          )}
        </div>
      </div>
    </>
  );
}

export default TimeSelector;
