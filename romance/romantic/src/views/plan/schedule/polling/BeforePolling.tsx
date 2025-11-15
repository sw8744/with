import {useAppSelector} from "../../../../core/hook/ReduxHooks.ts";
import HostDateFix from "./HostDateFix.tsx";
import HostPollBegin from "./HostPollBegin.tsx";
import {PlanRole} from "love/model/Plan.ts";

function BeforePolling() {
  const role = useAppSelector(state => state.planReducer.role);

  if (role === PlanRole.HOST || role === PlanRole.COHOST) {
    return (
      <>
        <HostDateFix/>
        <hr className={'border-neutral-400'}/>
        <HostPollBegin/>
      </>
    );
  } else return (
    <>
      <p className={'text-lg font-medium text-center'}>아직 날짜가 확정되지 않았어요.</p>
      <p className={'text-center'}>날짜를 확정하면 일정을 정할 수 있어요.</p>
    </>
  );
}

export default BeforePolling;
