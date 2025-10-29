import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import Timeline from "./Timeline.tsx";
import DatePoll from "./polling/DatePoll.tsx";
import BeforePolling from "./polling/BeforePolling.tsx";
import {PageError} from "../../error/ErrorPage.tsx";
import {PageState} from "../../../core/apiResponseInterfaces/apiInterface.ts";

function CoreTimeline() {
  const polling = useAppSelector(state => state.planReducer.date.polling);
  const dateFrom = useAppSelector(state => state.planReducer.date.from);
  const dateTo = useAppSelector(state => state.planReducer.date.to);

  if (polling) {
    return <DatePoll/>;
  } else if (!polling && (!dateFrom || !dateTo)) {
    return <BeforePolling/>;
  } else if (dateFrom && dateTo) return <Timeline/>;
  return <PageError pageState={PageState.UNKNOWN_FAULT}/>;
}

export default CoreTimeline;
