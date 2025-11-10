import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import type {recommendationRegion} from "../../../core/apiResponseInterfaces/recommendation.ts";
import {isPageError, PageState} from "../../../core/apiResponseInterfaces/apiInterface.ts";
import type {Region} from "../../../core/model/LocationModels.ts";
import {PageError} from "../../error/ErrorPage.tsx";
import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import type {locationRegionAPI} from "../../../core/apiResponseInterfaces/location.ts";
import {Link} from "react-router-dom";
import {thumbnailUrl} from "../../../core/model/ImageUrlProcessor.ts";

function RegionalSearch() {
  const userUuid = useAppSelector(state => state.userInfoReducer.uid);

  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [regionRecommendation, setRegionRecommendation] = useState<Array<{
    region: string,
    score: number
  }>>([]);
  const [regions, setRegions] = useState<Record<string, Region>>({});

  useEffect(() => {
    if (!userUuid) return;

    (async () => {
      const recommendationResult = await apiAuth.get<recommendationRegion>(
        "/recommendation/region",
        {
          params: {
            users: userUuid
          }
        }
      );

      const regionsRecommended = (
        recommendationResult.data.recommendation.sort((a, b) => {
          return a.score - b.score;
        })
      );
      setRegionRecommendation(regionsRecommended);

      for (let i = 0; i < regionsRecommended.length; i++) {
        apiAuth.get<locationRegionAPI>(
          "/location/region",
          {
            params: {
              uid: regionsRecommended[i].region
            }
          }
        ).then(res => {
          setRegions(current => (
            {...current, [regionsRecommended[i].region]: res.data.content[0]}
          ));
        }).catch(err => {
          throw err;
        });
      }

      setPageState(PageState.NORMAL);
    })()
      .catch(err => {
        handleAxiosError(err, setPageState);
      });
  }, [userUuid]);

  if (pageState === PageState.LOADING) return <RegionalSearchSkeleton/>;
  else if (isPageError(pageState)) return <PageError pageState={pageState}/>;

  return (
    <div className={'grid grid-cols-3 gap-3 mx-[14px]'}>
      {regionRecommendation.map((regionRec, index) => (
        <Link
          key={index}
          to={'/location/region/' + regions[regionRec.region]?.uid}
          className={'rounded-2xl overflow-clip relative shadow hover:shadow-lg transition-all'}
        >
          <img
            src={thumbnailUrl(regions[regionRec.region]?.thumbnail)}
            className={
              'aspect-square object-cover shadow ' +
              'hover:scale-105 transition-all duration-300 ' +
              'brightness-50'
            }
          />
          <p
            className={
              'absolute left-0 bottom-0 w-full ' +
              'text-center py-4 text-neutral-50 text-xl font-bold'
            }
          >{regions[regionRec.region]?.name}</p>
        </Link>
      ))}
    </div>
  )
}

function RegionalSearchSkeleton() {
  return (
    <div className={'grid grid-cols-3'}>
    </div>
  );
}

export default RegionalSearch;
