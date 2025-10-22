import {useEffect} from "react";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {verifyAll} from "../../core/validation.ts";

function GeneratePlan() {
  const members = useAppSelector(state => state.plannerReducer.members);
  const regions = useAppSelector(state => state.plannerReducer.region);
  const places = useAppSelector(state => state.plannerReducer.places);
  const themes = useAppSelector(state => state.plannerReducer.themes);
  const dateFrom = useAppSelector(state => state.plannerReducer.dateFrom);
  const dateTo = useAppSelector(state => state.plannerReducer.dateTo);

  useEffect(() => {
    const validation = verifyAll(

    );
  }, []);

  return (
    <>
      <p>계획을 만들고 있어요.</p>
    </>
  );
}

export default GeneratePlan;
