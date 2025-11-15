import {type ReactElement, type ReactNode, useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../core/hook/ReduxHooks.ts";
import {PageError} from "../../../error/ErrorPage.tsx";
import PageState from "love/model/PageState.ts";
import {getLocalizedDayString} from "love/datetime.ts";
import AddSegment from "./AddSegment.tsx";
import {apiAuth, handleAxiosError} from "../../../../core/axios/withAxios.ts";
import type {GetPlanActivitiesRequest, PlanActivity} from "love/api/PlanAPI.ts";

function CoreTimeline() {
  const planUuid = useAppSelector(state => state.planReducer.uid);
  const dateFrom = useAppSelector(state => state.planReducer.date.from);
  const dateTo = useAppSelector(state => state.planReducer.date.to);
  const dispatch = useAppDispatch();

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [activities, setActivities] = useState<PlanActivity[]>([]);

  useEffect(() => {
    apiAuth.get<GetPlanActivitiesRequest>(
      `/plan/${planUuid}/activities`
    ).then(res => {
      setActivities(res.data.activities);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (!dateFrom || !dateTo) {
    return <PageError pageState={PageState.UNKNOWN_FAULT}/>
  }

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  if (from > to) {
    return <PageError pageState={PageState.SERVER_FAULT}/>;
  }

  const dateElements: ReactElement[] = [];

  for (let d = from; d <= to; d.setDate(d.getDate() + 1)) {
    dateElements.push(
      <>
        <div className={"flex gap-2 item-center my-1"}>
          <p
            className={"text-xl font-medium"}>{d.getFullYear()}.{String(d.getMonth() + 1).padStart(2, '0')}.{String(d.getDate()).padStart(2, '0')} {getLocalizedDayString(d)}요일</p>
          <p>TODO: WEATHER GOES HERE</p>
        </div>
        <PlanPlaceSegment/>
        <AddSegment/>
      </>
    );
  }

  return (
    <div className={"flex flex-col"}>
      {dateElements}
    </div>
  );
}

function PlanPlaceSegment() {
  return (
    <PlanProgressionSegment
      time={"18:00"}
    >
      <p className={"text-lg font-medium mb-1"}>4233 마음센터</p>
      <div className={"px-2"}>
        <p className={"my-0.5"}>서울특별시 연남동</p>
        <p className={"my-0.5"}>예약 필수</p>
      </div>
    </PlanProgressionSegment>
  )
}

function PlanMovementTimeSegment() {
  return (
    <PlanProgressionSegment
      time={"19:00"}
      className={"bg-green-200"}
      nodeClearClassName={"fill-green-100"}
    >
      <p className={"text-lg font-medium mb-1"}>4233 마음센터 → 남산타워</p>
      <div className={"px-2"}>
        <p className={"my-0.5"}>서울특별시 연남동</p>
        <p className={"my-0.5"}>예약 필수</p>
      </div>
    </PlanProgressionSegment>
  );
}

function PlanProgressionSegment(
  {children, time, className, nodeClearClassName = "fill-white"}: {
    time: string;
    children: ReactNode;
    className?: string;
    nodeClearClassName?: string;
  }
) {
  return (
    <div className={"flex relative overflow-y-hidden px-2" + (className ? " " + className : "")}>
      <p className={"text-neutral-500 mt-2 pt-[1px] w-[40px]"}>{time}</p>
      <svg className={"fill-neutral-300 absolute left-[calc(45px+var(--spacing)*2)]"} width={16} height={200}
           viewBox={"0 0 16 200"}>
        <rect x={6.5} y={0} width={3} height={200}/>
        <circle cx={8} cy={22.5} r={7} className={nodeClearClassName}/>
        <circle cx={8} cy={22.5} r={5} className={"fill-current"}/>
        <circle cx={8} cy={22.5} r={3} className={nodeClearClassName}/>
      </svg>

      <div className={"mt-2 mb-4 ml-[26px]"}>{children}</div>
    </div>
  );
}

function PlanProgressionTail() {
  return (
    <div className={"relative px-2 h-10"}>
      <svg className={"absolute left-[calc(45px+var(--spacing)*2)]"} width={16} height={40} viewBox={"0 0 16 40"}>
        <defs>
          <linearGradient id={"grad"} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor={"var(--color-neutral-300)"}></stop>
            <stop offset={0.8} stopColor={"var(--color-neutral-300)"} stopOpacity={0}></stop>
          </linearGradient>
        </defs>
        <rect x={6.5} y={0} width={3} height={40} fill="url(#grad)"/>
      </svg>
    </div>
  )
}

export default CoreTimeline;
export {
  PlanProgressionSegment
}
