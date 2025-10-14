import {Button} from "../elements/Buttons.tsx";
import {TextInput} from "../elements/Inputs.tsx";
import {useEffect, useState} from "react";
import {api, apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {locationRegionAPI} from "../../core/apiResponseInterfaces/location.ts";
import {PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {recommendationRegion} from "../../core/apiResponseInterfaces/recommendation.ts";
import type {Region} from "../../core/model/LocationModels.ts";
import {useAppSelector} from "../../core/hook/ReduxHooks.ts";

function RegionSelector(
  {prev, next}: {
    prev: () => void;
    next: () => void;
  }
) {
  const [regionSelected, setRegionSelected] = useState<string[]>([]);
  const [regionSearch, setRegionSearch] = useState<string>('');
  const [pageState, setPageState] = useState(PageState.LOADING);
  const [workState, setWorkState] = useState(PageState.NORMAL);

  const [regionsInList, setRegionsInList] = useState<Region[]>([]);
  const members = useAppSelector(state => state.plannerReducer.members);

  useEffect(() => {
    (async () => {
      const initialRecommendation = await apiAuth.get<recommendationRegion>(
        '/recommendation/region',
        {
          params: {
            users: members.map((u) => u.uid).join('.'),
          }
        }
      );

      const recs = initialRecommendation.data.recommendation;
      const recRegions = []
      recs.forEach((rec) => {
        api.get<locationRegionAPI>(
          '/location/region',
          {
            params: {
              uid: rec.region
            }
          }
        ).then(res => {
          recRegions.push(res.data.content[0]);
        }).catch(err => {
          handleAxiosError(err, setPageState);
        });
      });
    })().catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [members]);

  useEffect(() => {
    if (regionSearch == '') return;

    api.get<locationRegionAPI>(
      '/location/region',
      {
        params: {
          name: regionSearch
        }
      }
    ).then(res => {

    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }, [regionSearch]);

  return (
    <>
      <div className={'h-full'}>
        <TextInput
          value={regionSearch}
          setter={setRegionSearch}
        />
        <div>
          {regionsInList.map((region, index) => (
            <div key={index}>
              {region.name}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={'flex justify-between'}>
          <Button onClick={prev}>이전</Button>
          <Button onClick={next}>다음</Button>
        </div>
      </div>
    </>
  );
}

export default RegionSelector;
