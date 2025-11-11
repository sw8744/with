import {Button} from "../elements/Buttons.tsx";
import {TextInput} from "../elements/Inputs.tsx";
import {type ReactElement, useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {locationRegionAPI} from "../../core/apiResponseInterfaces/location.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {recommendationRegion} from "../../core/apiResponseInterfaces/recommendation.ts";
import type {Region} from "../../core/model/LocationModels.ts";
import {useAppDispatch, useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {AnimatePresence, motion} from "framer-motion";
import {plannerAction} from "../../core/redux/PlannerReducer.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonElement, SkeletonFrame, SkeletonUnit} from "../elements/Skeleton.tsx";
import {ImageUrlProcessor} from "../../core/model/ImageUrlProcessor.ts";
import {BlockListMotion} from "../../core/motionVariants.ts";

function RegionSelector(
  {prev, next}: {
    prev: () => void;
    next: () => void;
  }
) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recommendedCache, setRecommendedCache] = useState<Region[]>([]);
  const [pageState, setPageState] = useState(PageState.LOADING);
  const [regionsInList, setRegionsInList] = useState<Region[]>([]);

  const dispatch = useAppDispatch();
  const regionSelected = useAppSelector(state => state.plannerReducer.region);
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
        "/recommendation/region",
        {
          params: {
            users: members.map((u) => u.uid).join("."),
          }
        }
      );

      const recommendations = initialRecommendation.data.recommendation;
      const recommendedRegions: Region[] = []
      for (const recommendation of recommendations) {
        const regionResp = await apiAuth.get<locationRegionAPI>(
          "/location/region",
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

    if (searchQuery == "") {
      setRegionsInList(
        loadAlreadySelectedRegion(recommendedCache)
      );
      setPageState(PageState.NORMAL);
      return;
    }

    apiAuth.get<locationRegionAPI>(
      "/location/region",
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
      handleAxiosError(err, setPageState);
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
          const sRegion = await apiAuth.get<locationRegionAPI>(
            "/location/region",
            {
              params: {
                uid: selectedRegion,
              }
            }
          );
          additionalRegion.push(sRegion.data.content[0]);
        })().catch(err => {
          handleAxiosError(err, setPageState);
        });
      }
    });

    return [...additionalRegion, ...loadedRegions];
  }


  const regions: ReactElement[] = [];
  if (pageState === PageState.LOADING) regions.push(<RegionSelectorSkeleton/>);
  else if (isPageError(pageState)) regions.push(<PageError pageState={pageState}/>);
  else {
    if (regionsInList.length == 0) {
      regions.push(
        <motion.div
          key={"noresult"}
          layout={"position"}
          variants={BlockListMotion}
          className={"my-3"}
        >
          <p className={"text-center font-medium text-lg my-1"}>검색결과가 없습니다.</p>
          <p className={"text-center my-1"}>놀러가고 싶은 지역을 찾아보세요</p>
        </motion.div>
      );
    } else {
      regionsInList.forEach((region, index) => {
        regions.push(
          <RegionResult
            region={region}
            toggleRegionSelected={toggleRegionSelection}
            selected={regionSelected.includes(region)}
            key={index}
          />
        );
      });
    }
  }

  return (
    <>
      <div className={"h-full"}>
        <TextInput
          placeholder={"놀러갈 지역 찾아보기"}
          value={searchQuery}
          setter={setSearchQuery}
        />
        <div className={"flex-1 flex flex-col gap-3 my-2"}>
          <AnimatePresence mode={"popLayout"}>
            {regions}
          </AnimatePresence>
        </div>
      </div>
      <div className={"flex justify-between"}>
        <Button onClick={prev}>이전</Button>
        <Button
          onClick={next}
          disabled={regionSelected.length == 0}
        >다음</Button>
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

  const tu = ImageUrlProcessor(region.thumbnail);

  return (
    <motion.button
      key={region.uid}
      layout={"position"}
      variants={BlockListMotion}
      className={
        "w-full rounded-2xl overflow-clip " +
        "shadow-neutral-300 shadow hover:shadow-md transition-all duration-300 " +
        "flex flex-row" +
        (selected ? " bg-amber-200" : "")
      }
      onClick={selectRegion}
    >
      <img
        src={tu}
        alt={region.name + "의 썸네일"}
        className={
          "h-[130px] w-1/2 object-cover " +
          "[mask-image:linear-gradient(to_right,black_70%,transparent)] " +
          "[mask-repeat:no-repeat] [mask-size:100%_100%]"
        }
      />

      <div className={"px-3 py-3"}>
        <p className={"font-bold text-lg text-left"}>{region.name}</p>
        <p className={"text-sm text-left"}>{region.description}</p>
      </div>
    </motion.button>
  );
}

function RegionSelectorSkeleton() {
  return (
    <SkeletonFrame className={"flex-1 flex flex-col gap-3 mt-3 mb-3"}>
      <RegionInListSkeleton/>
      <RegionInListSkeleton/>
      <RegionInListSkeleton/>
    </SkeletonFrame>
  );
}

function RegionInListSkeleton() {
  return (
    <SkeletonUnit className={"w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row"}>
      <SkeletonElement className={"w-1/2"} expH={130}/>

      <div className={"px-3 py-3"}>
        <SkeletonElement expH={20} expW={70}/>
        <SkeletonElement expH={15} expW={170} className={"my-2"}/>
        <SkeletonElement expH={15} expW={130}/>
      </div>
    </SkeletonUnit>
  );
}

export default RegionSelector;
