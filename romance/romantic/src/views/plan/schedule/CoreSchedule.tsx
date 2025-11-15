import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import CoreTimeline from "./timeline/CoreTimeline.tsx";
import DatePoll from "./polling/DatePoll.tsx";
import BeforePolling from "./polling/BeforePolling.tsx";
import {PageError} from "../../error/ErrorPage.tsx";
import PageState from "love/model/PageState.ts";

function CoreSchedule() {
  const polling = useAppSelector(state => state.planReducer.date.polling);
  const dateFrom = useAppSelector(state => state.planReducer.date.from);
  const dateTo = useAppSelector(state => state.planReducer.date.to);

  if (polling) {
    return <DatePoll/>;
  } else if (!polling && (!dateFrom || !dateTo)) {
    return <BeforePolling/>;
  } else if (dateFrom && dateTo) return <CoreTimeline/>;
  return <PageError pageState={PageState.UNKNOWN_FAULT}/>;
}

export default CoreSchedule;
