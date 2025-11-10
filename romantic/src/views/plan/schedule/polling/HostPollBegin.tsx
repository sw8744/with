import {DateRangePicker} from "../../../elements/Inputs.tsx";
import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "../../../elements/Buttons.tsx";
import Dialog from "../../../elements/Dialog.tsx";
import {verifyAll} from "../../../../core/validation.ts";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import {useAppSelector} from "../../../../core/hook/ReduxHooks.ts";
import {toAPIDatetimeString} from "../../../../core/datetime.ts";
import {PageState} from "../../../../core/apiResponseInterfaces/apiInterface.ts";
import {useDispatch} from "react-redux";
import {planActions} from "../../../../core/redux/PlanReducer.ts";

function HostPollBegin() {
  const planUuid = useAppSelector(state => state.planReducer.uid);
  const [voteFromDate, setVoteFromDate] = useState<Date | null>(null);
  const [voteToDate, setVoteToDate] = useState<Date | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL); //TODO: 에러 핸들링
  const [showingPollBeginComponents, setShowingPollBeginComponents] = useState<boolean>(false);

  const dispatch = useDispatch();

  function deleteDateSelection() {
    setVoteFromDate(null);
    setVoteToDate(null);
  }

  function closeConfirmDialog() {
    setShowConfirmDialog(false);
  }

  function beginVote() {
    const validation = verifyAll(
      voteFromDate !== null,
      voteToDate !== null
    );

    if (validation === 0) patchVote();
  }

  function patchVote() {
    setWorkState(PageState.WORKING);

    apiAuth.patch(
      `/plan/${planUuid}/poll/open`,
      {
        dateFrom: toAPIDatetimeString(voteFromDate),
        dateTo: toAPIDatetimeString(voteToDate),
        endIn: toAPIDatetimeString(new Date(Date.now() + (86400000 * 7))) // 7 days later
      }
    ).then(() => {
      dispatch(planActions.refresh());
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  return (
    <div>
      <AnimatePresence mode={'wait'}>
        {!showingPollBeginComponents &&
          <>
            <motion.p
              key={'begin-poll-pre-instruction'}
              layout
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.1,
                ease: "easeInOut"
              }}
              className={'font-medium text-lg'}
            >놀러갈 날짜를 투표할 수 있어요
            </motion.p>
            <motion.div
              layout
              key={'poll-begin-btn'}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <Button
                className={'my-2 !py-1'}
                onClick={() => setShowingPollBeginComponents(true)}
              >투표 시작하기</Button>
            </motion.div>
          </>
        }
        {showingPollBeginComponents && (
          <>
            <motion.p
              key={'begin-poll-instruction'}
              layout
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.1,
                ease: "easeInOut"
              }}
              className={'font-medium text-lg'}
            >투표할 기간을 선택해주세요.
            </motion.p>
            <motion.div
              layout
              key={'poll-begin-components'}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <DateRangePicker
                fromValue={voteFromDate}
                toValue={voteToDate}
                fromSetter={setVoteFromDate}
                toSetter={setVoteToDate}
                className={'my-2'}
              />
              <AnimatePresence>
                <div className={"flex justify-between items-center"}>
                  <div className={'flex gap-3 items-center'}>
                    <Button
                      className={"!py-1"}
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={voteFromDate === null || voteToDate === null}
                    >투표 시작</Button>
                    <motion.div
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{
                        duration: 0.2,
                        ease: "easeInOut"
                      }}
                    >
                      {(voteFromDate !== null || voteToDate !== null) && (
                        <Button
                          theme={"white"}
                          className={"!py-1"}
                          onClick={deleteDateSelection}
                        >날짜 선택 취소</Button>
                      )}
                    </motion.div>
                  </div>
                  <Button
                    className={"!py-1"}
                    onClick={() => setShowingPollBeginComponents(false)}
                    theme={'white'}
                  >투표 닫기</Button>
                </div>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Dialog
        show={showConfirmDialog}
        onClose={closeConfirmDialog}
        closeWhenBackgroundTouch
      >
        {voteFromDate?.getDate() === voteToDate?.getDate() && (
          <p>{voteFromDate?.getFullYear()}년 {1 + (voteFromDate?.getMonth() ?? 0)}월 {voteFromDate?.getDate()}일로 투표를
            진행할까요?</p>
        )}
        {voteFromDate?.getDate() !== voteToDate?.getDate() && (
          <p>{voteFromDate?.getFullYear()}년 {1 + (voteFromDate?.getMonth() ?? 0)}월 {voteFromDate?.getDate()}일
            - {voteToDate?.getFullYear()}년 {1 + (voteToDate?.getMonth() ?? 0)}월 {voteToDate?.getDate()}일 중에서 날짜를
            투표할까요?</p>
        )}
        <div className={"flex flex-col gap-2"}>
          <Button
            className={"w-full"}
            onClick={beginVote}
            disabled={workState === PageState.WORKING}
          >투표 시작</Button>
          <Button
            className={"w-full"}
            theme={"white"}
            onClick={closeConfirmDialog}
          >취소</Button>
        </div>
      </Dialog>
    </div>
  );
}

export default HostPollBegin;
