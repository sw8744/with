import {DatePicker} from "../../../elements/common/Inputs.tsx";
import {useEffect, useState} from "react";
import {useAppSelector} from "../../../../core/hook/ReduxHooks.ts";
import {Button} from "../../../elements/common/Buttons.tsx";
import {InlineError, PageError} from "../../../error/ErrorPage.tsx";
import {isPageError, PageState} from "../../../../core/apiResponseInterfaces/apiInterface.ts";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import type {GetMyVoteRequest, GetVoteStatusRequest} from "../../../../core/apiResponseInterfaces/plan.ts";
import {PlanRole} from "../../../../core/redux/PlanReducer.ts";
import Dialog from "../../../elements/common/Dialog.tsx";
import Spinner from "../../../elements/loading/Spinner.tsx";
import HostDateFix from "./HostDateFix.tsx";

function DatePoll() {
  const planUuid = useAppSelector(state => state.planReducer.uid);
  const planRole = useAppSelector(state => state.planReducer.role);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [workState, setWorkState] = useState<PageState>(PageState.NORMAL);
  const [showClosePollConfirmDialog, setShowClosePollConfirmDialog] = useState<boolean>(false);
  const [wasIVoted, setWasIVoted] = useState<boolean>(false);
  const [aggregativeStatus, setAggregativeStatus] = useState<GetVoteStatusRequest | null>(null);

  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  async function loadVoteStatus() {
    const aggregativeStatusResponse = await apiAuth.get<GetVoteStatusRequest>(
      `/plan/${planUuid}/poll/status`
    );
    setAggregativeStatus(aggregativeStatusResponse.data);

    const myVoteStatusResponse = await apiAuth.get<GetMyVoteRequest>(
      `/plan/${planUuid}/poll/vote`
    );
    setSelectedDates(myVoteStatusResponse.data.vote);
    if (myVoteStatusResponse.data.vote.length > 0) setWasIVoted(true);
    else setWasIVoted(false);

    setPageState(PageState.NORMAL);
  }

  function vote() {
    setWorkState(PageState.WORKING);
    apiAuth.post(
      `/plan/${planUuid}/poll/vote`,
      {
        dates: selectedDates
      }
    ).then(() => {
      loadVoteStatus()
        .catch(err => {
          handleAxiosError(err, setPageState);
        });
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }

  function weightFunction(date: string): number {
    if (!aggregativeStatus) return 0;

    if (date in aggregativeStatus.poll.votes) {
      const wt = Math.round((aggregativeStatus.poll.votes[date] / aggregativeStatus.poll.voted) * 6);
      if (wt >= 6) return 5;
      else return wt;
    } else return 0;
  }

  function closePoll() {
    setWorkState(PageState.WORKING);

    apiAuth.patch(
      `/plan/${planUuid}/poll/close`
    ).then(() => {
      loadVoteStatus();
      setWorkState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    }).finally(() => {
      setShowClosePollConfirmDialog(false);
    });
  }

  useEffect(() => {
    loadVoteStatus()
      .catch(err => {
        handleAxiosError(err, setPageState);
      });
  }, []);

  if (!aggregativeStatus?.poll.pollingOpen || !aggregativeStatus.poll.dateFrom || !aggregativeStatus.poll.dateTo) {
    if (pageState === PageState.LOADING) return <DatePollSkeleton/>
    else return <PageError pageState={pageState}/>;
  }

  const amihost = planRole === PlanRole.HOST || planRole === PlanRole.COHOST;

  const voteEndDate = new Date(aggregativeStatus.poll.pollingOpen);
  const endDelta = Math.floor((voteEndDate.getTime() - Date.now()) / 86400000);
  const voteDateFrom = new Date(aggregativeStatus.poll.dateFrom);
  const voteDateTo = new Date(aggregativeStatus.poll.dateTo);

  if (pageState === PageState.LOADING) return <DatePollSkeleton/>;
  if (isPageError(pageState)) return <PageError pageState={pageState}/>;

  return (
    <>
      <p className={"text-xl font-medium"}>놀러갈 날짜를 투표해주세요</p>
      <DatePicker
        value={selectedDates}
        setter={setSelectedDates}
        className={"my-2"}
        multiple
        fromDate={voteDateFrom}
        toDate={voteDateTo}
        weight={weightFunction}
      />

      <div className={'flex justify-between items-center'}>
        {endDelta >= 0 && (
          <Button
            className={"!py-1"}
            onClick={vote}
            disabled={workState === PageState.WORKING}
          >
            {wasIVoted ? '다시 투표하기' : '투표하기'}
          </Button>
        )}
        {endDelta > 0 && <p>투표 마감 {endDelta + 1}일 전입니다.</p>}
        {endDelta == 0 && <p>오늘 투표가 마감됩니다.</p>}
        {endDelta < 0 && <p>투표가 종료되었습니다.</p>}
      </div>
      {endDelta >= 0 && (
        <div className={'flex justify-between items-center'}>
          {amihost && (
            <Button
              className={'!py-1'}
              theme={'white'}
              onClick={() => setShowClosePollConfirmDialog(true)}
            >투표 종료</Button>
          )}
        </div>
      )}
      <InlineError pageState={workState}/>
      <hr className={'border-neutral-400'}/>
      <HostDateFix weightFunction={weightFunction}/>
      <Dialog
        show={showClosePollConfirmDialog}
        closeWhenBackgroundTouch
        onClose={() => setShowClosePollConfirmDialog(false)}
      >
        <div>
          <p className={'my-0.5'}>총 {aggregativeStatus?.poll.voted}명이 투표했습니다.</p>
          <p className={'my-0.5'}>정말로 투표를 종료할까요?</p>
        </div>
        <Button onClick={closePoll} disabled={workState === PageState.WORKING}>투표 종료</Button>
        <Button theme={'white'} onClick={() => setShowClosePollConfirmDialog(false)}>취소</Button>
      </Dialog>
    </>
  );
}

function DatePollSkeleton() {
  return (
    <>
      <Spinner className={'mx-auto'}/>
    </>
  )
}

export default DatePoll;
