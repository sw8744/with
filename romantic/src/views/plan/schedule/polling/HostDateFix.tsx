import {DateRangePicker} from "../../../elements/Inputs.tsx";
import {useState} from "react";
import {Button} from "../../../elements/Buttons.tsx";
import {AnimatePresence, motion} from "framer-motion";
import Dialog from "../../../elements/Dialog.tsx";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import {useAppDispatch, useAppSelector} from "../../../../core/hook/ReduxHooks.ts";
import {PageState} from "../../../../core/apiResponseInterfaces/apiInterface.ts";
import {InlineError} from "../../../error/ErrorPage.tsx";
import {planActions} from "../../../../core/redux/PlanReducer.ts";
import {toAPIDateString} from "../../../../core/datetime.ts";

function HostDateFix(
  {weightFunction}: { weightFunction?: (date: string) => number }
) {
  const planUuid = useAppSelector(state => state.planReducer.uid);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);

  const dispatch = useAppDispatch();

  function deleteDateSelection() {
    setFromDate(null);
    setToDate(null);
  }

  function closeConfirmDialog() {
    setShowConfirmDialog(false);
  }

  function fixDateSelection() {
    setWorkState(PageState.WORKING);

    apiAuth.patch(
      `/plan/${planUuid}/date`,
      {
        dateFrom: toAPIDateString(fromDate),
        dateTo: toAPIDateString(toDate)
      }
    ).then(() => {
      setWorkState(PageState.NORMAL);
      dispatch(planActions.refresh());
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    }).finally(() => {
      setShowConfirmDialog(false);
    });
  }

  return (
    <div>
      <p className={"text-lg font-medium"}>날짜를 확정해주세요</p>

      <DateRangePicker
        fromValue={fromDate}
        toValue={toDate}
        fromSetter={setFromDate}
        toSetter={setToDate}
        className={"my-2"}
        weight={weightFunction}
      />
      <AnimatePresence>

        <div className={"flex gap-3"}>
          <Button
            className={"!py-1"}
            onClick={() => setShowConfirmDialog(true)}
            disabled={fromDate === null || toDate === null}
          >날짜 확정</Button>
          {(fromDate !== null && toDate !== null) && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}>
              <Button
                theme={"white"}
                className={"!py-1"}
                onClick={deleteDateSelection}
              >일정 삭제</Button>
            </motion.div>
          )}
        </div>
        <InlineError pageState={workState}/>
      </AnimatePresence>
      <Dialog
        show={showConfirmDialog}
        onClose={closeConfirmDialog}
        closeWhenBackgroundTouch
      >
        {fromDate?.getDate() === toDate?.getDate() && (
          <p>{fromDate?.getFullYear()}년 {1 + (fromDate?.getMonth() ?? 0)}월 {fromDate?.getDate()}일로 일정을 확정할까요?</p>
        )}
        {fromDate?.getDate() !== toDate?.getDate() && (
          <p>{fromDate?.getFullYear()}년 {1 + (fromDate?.getMonth() ?? 0)}월 {fromDate?.getDate()}일
            - {toDate?.getFullYear()}년 {1 + (toDate?.getMonth() ?? 0)}월 {toDate?.getDate()}일로 일정을 확정할까요?</p>
        )}
        <div className={"flex flex-col gap-2"}>
          <Button
            className={"w-full"}
            onClick={fixDateSelection}
            disabled={workState === PageState.WORKING}
          >확정</Button>
          <Button
            className={"w-full"}
            theme={"white"}
            onClick={closeConfirmDialog}
          >취소</Button>
        </div>
      </Dialog>
    </div>
  )
}

export default HostDateFix;
