import {DateRangePicker} from "../elements/Inputs.tsx";
import {useState} from "react";
import {Button} from "../elements/Buttons.tsx";
import {AnimatePresence, motion} from "framer-motion";
import Dialog from "../elements/Dialog.tsx";

function HostFixDate() {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  function deleteDateSelection() {
    setFromDate(null);
    setToDate(null);
  }

  function closeConfirmDialog() {
    setShowConfirmDialog(false);
  }

  return (
    <div>
      <p className={'text-xl font-medium'}>날짜를 확정지어주세요</p>

      <DateRangePicker
        fromValue={fromDate}
        toValue={toDate}
        fromSetter={setFromDate}
        toSetter={setToDate}
        className={'my-2'}
      />
      <AnimatePresence>
        {(fromDate !== null && toDate !== null) && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{
              duration: 0.2,
              ease: 'easeInOut'
            }}
            className={'flex gap-3'}
          >
            <Button
              className={'!py-1'}
              onClick={() => setShowConfirmDialog(true)}
            >날짜 확정</Button>
            <Button
              theme={'white'}
              className={'!py-1'}
              onClick={deleteDateSelection}
            >일정 삭제</Button>
          </motion.div>
        )}
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
        <div className={'flex flex-col gap-2'}>
          <Button className={'w-full'}>확정</Button>
          <Button
            className={'w-full'}
            theme={'white'}
            onClick={closeConfirmDialog}
          >취소</Button>
        </div>
      </Dialog>
    </div>
  )
}

export default HostFixDate;
