import {Button} from "../elements/Buttons.tsx";
import {type ReactElement, useEffect, useState} from "react";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {recommendationPlace} from "../../core/apiResponseInterfaces/recommendation.ts";
import type {Place} from "../../core/model/LocationModels.ts";
import type {locationPlaceAPI} from "../../core/apiResponseInterfaces/location.ts";
import {useAppDispatch, useAppSelector} from "../../core/hook/ReduxHooks.ts";
import {PlaceAreaShow, PlaceAreaSkeleton} from "../elements/location/PlaceArea.tsx";
import {PageError} from "../error/ErrorPage.tsx";
import {SkeletonFrame} from "../elements/Skeleton.tsx";
import {plannerAction} from "../../core/redux/PlannerReducer.ts";
import {TextInput} from "../elements/Inputs.tsx";
import {motion} from "motion/react";
import {AnimatePresence} from "framer-motion";
import {BlockListMotion} from "../../core/motionVariants.ts";

function PlaceSelector(
  {prev, next}: {
    prev: () => void;
    next: () => void;
  }
) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recommendedCache, setRecommendedCache] = useState<Place[]>([]);
  const [pageState, setPageState] = useState(PageState.LOADING);
  const [placeInList, setPlaceInList] = useState<Place[]>([]);

  const dispatch = useAppDispatch();
  const placeSelected = useAppSelector(state => state.plannerReducer.places);
  const regions = useAppSelector(state => state.plannerReducer.region);
  const members = useAppSelector(state => state.plannerReducer.members);

  function togglePlaceSelection(place: Place) {
    if (placeSelected.includes(place)) {
      const idx = placeInList.indexOf(place);
      dispatch(plannerAction.setPlaces(
        placeSelected.filter((_place, ind) => ind !== idx)
      ));
    } else {
      dispatch(plannerAction.setPlaces(
        [...placeSelected, place]
      ));
    }
  }

  useEffect(() => {
    (async () => {
      const initialRecommendation = await apiAuth.get<recommendationPlace>(
        "/recommendation/place",
        {
          params: {
            users: members.map((u) => u.uid).join("."),
            regions: regions.map((r) => r.uid).join("."),
          }
        }
      );

      const recommendations = initialRecommendation.data.recommendation;
      const recommendedPlaces: Place[] = []
      for (const recommendation of recommendations) {
        const placeResp = await apiAuth.get<locationPlaceAPI>(
          "/location/place",
          {
            params: {
              uid: recommendation.place
            }
          }
        );

        recommendedPlaces.push(placeResp.data.content[0]);
      }

      setRecommendedCache(recommendedPlaces);
      setPlaceInList(
        loadAlreadySelectedPlace(recommendedPlaces)
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
      setPlaceInList(
        loadAlreadySelectedPlace(recommendedCache)
      );
      setPageState(PageState.NORMAL);
      return;
    }

    apiAuth.get<locationPlaceAPI>(
      "/location/place",
      {
        params: {
          name: searchQuery
        }
      }
    ).then(res => {
      setPlaceInList(
        loadAlreadySelectedPlace(res.data.content)
      );
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, [searchQuery]);

  function loadAlreadySelectedPlace(loadedPlaces: Place[]): Place[] {
    const additionalPlace: Place[] = [];

    placeSelected.forEach((selectedPlace) => {
      let isExists = false;

      for (const selectedPlace of loadedPlaces) {
        if (selectedPlace.uid === selectedPlace.uid) {
          isExists = true;
          break;
        }
      }

      if (isExists) {
        let idx = 0;
        for (const place of loadedPlaces) {
          if (place.uid === selectedPlace.uid) {
            break;
          } else idx++;
        }
        loadedPlaces.splice(idx, 1);
        additionalPlace.push(selectedPlace);
      } else {
        (async () => {
          const sPlace = await apiAuth.get<locationPlaceAPI>(
            "/location/place",
            {
              params: {
                uid: selectedPlace,
              }
            }
          );
          additionalPlace.push(sPlace.data.content[0]);
        })().catch(err => {
          handleAxiosError(err, setPageState);
        });
      }
    });

    return [...additionalPlace, ...loadedPlaces];
  }

  const places: ReactElement[] = [];
  if (pageState === PageState.LOADING) places.push(<PlaceSelectorSkeleton/>);
  else if (isPageError(pageState)) places.push(<PageError pageState={pageState}/>);
  else {
    if (placeInList.length === 0) {
      places.push(
        <motion.div
          key={"noresult"}
          layout={"position"}
          variants={BlockListMotion}
          className={"my-3"}
        >
          <p className={"text-center font-medium text-lg my-1"}>검색결과가 없습니다.</p>
          <p className={"text-center my-1"}>놀러가고 싶은 장소를 찾아보세요</p>
          <p className={"text-center my-1"}>앞서 선택한 지역에 있는 장소만 나와요</p>
        </motion.div>
      );
    } else {
      placeInList.forEach((place, index) => {
        places.push(
          <motion.button
            key={place.uid}
            layout={"position"}
            variants={BlockListMotion}
            className={
              "w-full rounded-2xl overflow-clip " +
              "shadow-neutral-300 shadow hover:shadow-md transition-all duration-300 " +
              "flex flex-row" +
              (placeSelected.includes(place) ? " bg-amber-200" : "")
            }
            onClick={() => togglePlaceSelection(place)}
          >
            <PlaceAreaShow
              key={index}
              place={place}
            />
          </motion.button>
        );
      });
    }
  }

  return (
    <>
      <div className={"h-full"}>
        <TextInput
          placeholder={"놀러갈 장소 찾아보기"}
          value={searchQuery}
          setter={setSearchQuery}
        />
        <div className={"flex-1 flex flex-col gap-3 my-2"}>
          <AnimatePresence mode={"popLayout"}>
            {places}
          </AnimatePresence>
        </div>
      </div>
      <div className={"flex justify-between"}>
        <Button onClick={prev}>이전</Button>
        <Button onClick={next}>만들기</Button>
      </div>
    </>
  );
}

function PlaceSelectorSkeleton() {
  return (
    <SkeletonFrame className={"flex-1 flex flex-col gap-3 mt-3 mb-3"}>
      <PlaceAreaSkeleton/>
      <PlaceAreaSkeleton/>
      <PlaceAreaSkeleton/>
    </SkeletonFrame>
  );
}

export default PlaceSelector;
