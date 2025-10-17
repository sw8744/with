import {Button} from "../elements/Buttons.tsx";
import {TextInput} from "../elements/Inputs.tsx";
import {type ReactNode, useEffect, useState} from "react";
import {api, apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {locationRegionAPI} from "../../core/apiResponseInterfaces/location.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {recommendationRegion} from "../../core/apiResponseInterfaces/recommendation.ts";
import type {Region} from "../../core/model/LocationModels.ts";
import {useAppDispatch, useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {AnimatePresence, motion} from "framer-motion";
import {plannerAction} from "../../core/redux/PlanReducer.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame, SkeletonUnit} from "../elements/Skeleton.tsx";

function RegionSelector(
  {prev, next}: {
    prev: () => void;
    next: () => void;
  }
) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recommendedCache, setRecommendedCache] = useState<Region[]>([]);
  const [pageState, setPageState] = useState(PageState.LOADING);
  const [workState, setWorkState] = useState(PageState.NORMAL);
  const regionSelected = useAppSelector(state => state.plannerReducer.region);

  const [regionsInList, setRegionsInList] = useState<Region[]>([]);
  const dispatch = useAppDispatch();
  const members = useAppSelector(state => state.plannerReducer.members);

  function toggleRegionSelection(region: Region) {
    if (regionSelected.includes(region)) {
      const idx = regionSelected.indexOf(region);
      dispatch(plannerAction.setRegion(
        regionSelected.filter((_region, ind) => ind !== idx)
      ));
    } else {
      dispatch(plannerAction.setRegion(
        [...regionSelected, region]
      ));
    }
  }

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

      const recommendations = initialRecommendation.data.recommendation;
      const recommendedRegions: Region[] = []
      for (const recommendation of recommendations) {
        const regionResp = await api.get<locationRegionAPI>(
          '/location/region',
          {
            params: {
              uid: recommendation.region
            }
          }
        );

        recommendedRegions.push(regionResp.data.content[0]);
      }

      setRecommendedCache(recommendedRegions);
      setRegionsInList(
        loadAlreadySelectedRegion(recommendedRegions)
      );

      setPageState(PageState.NORMAL);
    })().catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [members]);

  useEffect(() => {
    if (pageState === PageState.LOADING) return;

    setPageState(PageState.WORKING);

    if (searchQuery == '') {
      setRegionsInList(
        loadAlreadySelectedRegion(recommendedCache)
      );
      setPageState(PageState.NORMAL);
      return;
    }

    api.get<locationRegionAPI>(
      '/location/region',
      {
        params: {
          name: searchQuery
        }
      }
    ).then(res => {
      setRegionsInList(
        loadAlreadySelectedRegion(res.data.content)
      );
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setWorkState);
    });
  }, [searchQuery]);

  function loadAlreadySelectedRegion(loadedRegions: Region[]): Region[] {
    const additionalRegion: Region[] = [];

    regionSelected.forEach((selectedRegion) => {
      let isExists = false;

      for (const selectedRegion of loadedRegions) {
        if (selectedRegion.uid === selectedRegion.uid) {
          isExists = true;
          break;
        }
      }

      if (isExists) {
        let idx = 0;
        for (const region of loadedRegions) {
          if (region.uid === selectedRegion.uid) {
            break;
          } else idx++;
        }
        loadedRegions.splice(idx, 1);
        additionalRegion.push(selectedRegion);
      } else {
        (async () => {
          const sRegion = await api.get<locationRegionAPI>(
            '/location/region',
            {
              params: {
                uid: selectedRegion,
              }
            }
          );
          additionalRegion.push(sRegion.data.content[0]);
        })().catch(err => {
          handleAxiosError(err, setWorkState);
        });
      }
    });

    return [...additionalRegion, ...loadedRegions];
  }

  if (isPageError(pageState)) return <PageError pageState={pageState}/>;

  let searchResult: ReactNode;
  if (pageState === PageState.LOADING) searchResult = <RegionSelectorSkeleton/>;
  else if (pageState === PageState.NORMAL) {
    const searchedElements: ReactNode[] = [];

    regionsInList.forEach((region, index) => {
      searchedElements.push(
        <RegionResult
          region={region}
          toggleRegionSelected={toggleRegionSelection}
          selected={regionSelected.includes(region)}
          key={index}
        />
      );

      searchResult = (
        <div className={'flex-1 flex flex-col gap-3 my-2'}>{searchedElements}</div>
      )
    });
    if (regionsInList.length == 0) {
      searchResult = (
        <div>
          <p className={'text-center font-medium text-xl my-1'}>검색결과가 없습니다.</p>
          <p className={'text-center text-lg my-1'}>놀러가고 싶은 지역을 검색해보세요</p>
        </div>
      );
    }
  }

  return (
    <>
      <div className={'h-full flex flex-col'}>
        <TextInput
          value={searchQuery}
          setter={setSearchQuery}
        />
        <div className={'flex-1 flex flex-col gap-3 my-2'}>
          <AnimatePresence mode={'popLayout'}>
            {searchResult}
          </AnimatePresence>
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

function RegionResult(
  {
    region,
    toggleRegionSelected,
    selected
  }: { region: Region, toggleRegionSelected: (uid: Region) => void, selected: boolean },
) {
  function selectRegion() {
    toggleRegionSelected(region);
  }

  return (
    <motion.button
      layout
      key={region.uid}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{
        duration: 0.2,
        ease: 'easeInOut'
      }}
      className={
        'w-full rounded-2xl overflow-clip ' +
        'shadow-neutral-300 shadow hover:shadow-md transition-all duration-300 ' +
        'flex flex-row cursor-pointer' +
        (selected ? ' bg-amber-200' : '')
      }
      onClick={selectRegion}
    >
      <img
        src={region.thumbnail}
        alt={region.name + '의 썸네일'}
        className={
          'h-[130px] w-1/2 object-cover ' +
          '[mask-image:linear-gradient(to_right,black_70%,transparent)] ' +
          '[mask-repeat:no-repeat] [mask-size:100%_100%]'
        }
      />

      <div className={'px-3 py-3'}>
        <p className={'font-bold text-lg text-left'}>{region.name}</p>
        <p className={'text-sm text-left'}>{region.description}</p>
      </div>
    </motion.button>
  );
}

function RegionSelectorSkeleton() {
  return (
    <SkeletonFrame className={'flex-1 flex flex-col gap-3 mt-3 mb-3'}>
      <RegionInListSkeleton/>
      <RegionInListSkeleton/>
      <RegionInListSkeleton/>
    </SkeletonFrame>
  );
}

function RegionInListSkeleton() {
  return (
    <SkeletonUnit className={'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row'}>
      <SkeletonElement className={'w-1/2'} expH={130}/>

      <div className={'px-3 py-3'}>
        <SkeletonElement expH={20} expW={70}/>
        <SkeletonElement expH={15} expW={170} className={'my-2'}/>
        <SkeletonElement expH={15} expW={130}/>
      </div>
    </SkeletonUnit>
  );
}

export default RegionSelector;
