import {useEffect, useState} from "react";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {Place} from "../../core/model/LocationModels.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {interactionLikes} from "../../core/apiResponseInterfaces/interaction.ts";
import {PageError} from "../error/ErrorPage.tsx";
import {PlaceArea, PlaceAreaSkeleton} from "../elements/location/PlaceArea.tsx";
import {SkeletonFrame} from "../elements/Skeleton.tsx";

function LikedPlaces() {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING)
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);

  useEffect(() => {
    apiAuth.get<interactionLikes>(
      "/interaction/like"
    ).then(res => {
      setLikedPlaces(res.data.likes);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (pageState === PageState.LOADING) {
    return <LikedPlaceSkeleton/>
  }
  if (isPageError(pageState)) {
    return <PageError pageState={pageState}/>
  }

  return (
    <div className={"flex flex-col gap-y-4"}>
      {likedPlaces.map((place: Place, index: number) => {
        return <PlaceArea
          key={index}
          place={place}
        />
      })}
    </div>
  );
}

function LikedPlaceSkeleton() {
  return (
    <SkeletonFrame>
      <div className={"flex flex-col gap-y-4"}>
        <PlaceAreaSkeleton/>
        <PlaceAreaSkeleton/>
        <PlaceAreaSkeleton/>
        <PlaceAreaSkeleton/>
      </div>
    </SkeletonFrame>
  )
}

export default LikedPlaces;
