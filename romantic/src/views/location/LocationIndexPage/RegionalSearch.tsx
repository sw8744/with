import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../../core/axios/withAxios.ts";
import type {recommendationRegion} from "../../../core/apiResponseInterfaces/recommendation.ts";
import {isPageError, PageState} from "../../../core/apiResponseInterfaces/apiInterface.ts";
import type {Region} from "../../../core/model/LocationModels.ts";
import {PageError} from "../../error/ErrorPage.tsx";
import {useAppSelector} from "../../../core/hook/ReduxHooks.ts";
import type {locationRegionAPI} from "../../../core/apiResponseInterfaces/location.ts";
import {Link} from "react-router-dom";
import {ImageUrlProcessor} from "../../../core/model/ImageUrlProcessor.ts";
import {SkeletonElement, SkeletonFrame} from "../../elements/Skeleton.tsx";

function RegionalSearch() {
  const userName = useAppSelector(state => state.userInfoReducer.name);
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
    <div className={'mx-[14px]'}>
      <p className={'text-2xl font-medium mb-3'}>{userName}님이 좋아할만한 장소에요</p>
      <div className={'grid grid-cols-4 gap-3'}>
        {regionRecommendation.map((regionRec, index) => (
          <Link
            key={index}
            to={'/location/region/' + regions[regionRec.region]?.uid}
            className={'rounded-2xl overflow-clip relative shadow hover:shadow-lg transition-all'}
          >
            <img
              src={ImageUrlProcessor(regions[regionRec.region]?.thumbnail)}
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
    </div>
  )
}

function RegionalSearchSkeleton() {
  return (
    <div className={'mx-[14px]'}>
      <SkeletonFrame>
        <SkeletonElement unit expH={32} expW={240} className={'mb-3'}/>
        <div className={'grid grid-cols-4 gap-3'}>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
          <SkeletonElement unit className={'aspect-square rounded-2xl overflow-clip'}/>
        </div>
      </SkeletonFrame>
    </div>
  );
}

export default RegionalSearch;
