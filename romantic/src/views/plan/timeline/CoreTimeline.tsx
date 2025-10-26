import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import Timeline from "./Timeline.tsx";
import DatePoll from "./DatePoll.tsx";

function CoreTimeline() {
  const dateFrom = useAppSelector(state => state.planReducer.date.from);
  const dateTo = useAppSelector(state => state.planReducer.date.to);

  if (!dateFrom || !dateTo) {
    return <DatePoll/>;
  } else return <Timeline/>;
}

export default CoreTimeline;
