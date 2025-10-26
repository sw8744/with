import {useEffect, useState} from "react";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import {PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {useNavigate} from "react-router-dom";
import {PageError} from "../error/ErrorPage.tsx";

function GeneratePlan() {
  const members = useAppSelector(state => state.plannerReducer.members);
  const regions = useAppSelector(state => state.plannerReducer.region);
  const places = useAppSelector(state => state.plannerReducer.places);
  const themes = useAppSelector(state => state.plannerReducer.themes);
  const dateFrom = useAppSelector(state => state.plannerReducer.dateFrom);
  const dateTo = useAppSelector(state => state.plannerReducer.dateTo);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  const navigate = useNavigate();

  useEffect(() => {
    apiAuth.post(
      '/plan',
      {
        name: members.map(m => m.name).join(', ') + '와 놀기',
        members: members.slice(1).map(m => m.uid),
        regions: regions.map(r => r.uid),
        places: places.map(p => p.uid),
        themes: Object.keys(themes),
        dateFrom: dateFrom == "" ? null : dateFrom,
        dateTo: dateTo == "" ? null : dateTo,
      }
    ).then(res => {
      const planUUID = res.data.plan.uid;
      navigate(`/plan/${planUUID}`);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (pageState === PageState.LOADING) {
    return (
      <div className={'flex-1 flex justify-center items-center'}>
        <p className={'text-2xl font-bold'}>계획을 만들고 있어요.</p>
      </div>
    );
  } else {
    return (
      <div className={'flex-1'}>
        <PageError pageState={pageState}/>
      </div>
    );
  }
}

export default GeneratePlan;
