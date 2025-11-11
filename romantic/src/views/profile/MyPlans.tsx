import {type ReactElement, useEffect, useState} from "react";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {ListMyPlansRequest, Plan} from "../../core/apiResponseInterfaces/plan.ts";
import {Link} from "react-router-dom";
import {getDayDelta, isoToDisplayDateString} from "../../core/datetime.ts";
import {SkeletonElement, SkeletonFrame} from "../elements/Skeleton.tsx";

function MyPlans() {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    apiAuth.get<ListMyPlansRequest>(
      "/plan"
    ).then(res => {
      setPlans(res.data.plans);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (pageState === PageState.LOADING) return <MyPlansSkeleton/>
  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  const planElements: ReactElement[] = [];

  plans.forEach((plan) => {
    let dateString = '';
    if (plan.polling_date) {
      const endDelta = Math.floor((new Date(plan.polling_date).getTime() - Date.now()) / 86400000);
      if (endDelta > 0) dateString = "일정 투표중(" + (endDelta + 1) + "일 남음)";
      else if (endDelta === 0) dateString = "일정 투표중(오늘까지)";
      else dateString = "일정 투표 종료";
    } else {
      if (plan.date_to && plan.date_from) {
        if (plan.date_to === plan.date_from)
          dateString = isoToDisplayDateString(plan.date_from) + ' (' + getDayDelta(new Date(), new Date(plan.date_from)) + ')';
        else
          dateString =
            isoToDisplayDateString(plan.date_from) +
            ' - ' +
            isoToDisplayDateString(plan.date_to) +
            ' (' + getDayDelta(new Date(), new Date(plan.date_from)) + ')';
      } else dateString = '';
    }

    planElements.push(
      <Link
        key={plan.uid}
        to={'/plan/' + plan.uid}
        className={
          'p-4 flex flex-col gap-1 ' +
          'border border-neutral-400 rounded-xl transition-all hover:bg-neutral-100 ' +
          'shadow hover:shadow-md'
        }
      >
        <p className={'text-lg font-medium'}>{plan.name}</p>
        <p>{dateString}</p>
      </Link>
    );
  });

  return (
    <div className={'flex flex-col gap-3'}>
      {planElements}
    </div>
  );
}

function MyPlansSkeleton() {
  return (
    <SkeletonFrame className={'flex flex-col gap-3'}>
      <div
        className={
          'p-4 flex flex-col gap-1 ' +
          'border border-neutral-300 rounded-xl ' +
          'shadow'
        }
      >
        <SkeletonElement unit expW={110} expH={28}/>
        <SkeletonElement unit expW={300} expH={24}/>
      </div>

      <div
        className={
          'p-4 flex flex-col gap-1 ' +
          'border border-neutral-300 rounded-xl ' +
          'shadow'
        }
      >
        <SkeletonElement unit expW={130} expH={28}/>
        <SkeletonElement unit expW={260} expH={24}/>
      </div>
    </SkeletonFrame>
  );
}

export default MyPlans;
