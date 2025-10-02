import {useEffect, useState} from "react";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {Place} from "../../core/model/LocationModels.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {interactionLikes} from "../../core/apiResponseInterfaces/interaction.ts";
import PlaceArea from "../elements/PlaceArea.tsx";

function LikedPlaces() {
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING)
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);

  useEffect(() => {
    apiAuth.get<interactionLikes>(
      '/interaction/like'
    ).then(res => {
      setLikedPlaces(res.data.likes);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if(pageState === PageState.LOADING) {

  }
  if(isPageError(pageState)) {

  }

  return (
    <div className={'flex flex-col gap-y-4'}>
      {likedPlaces.map((place: Place, index: number) => {
        return <PlaceArea
          key={index}
          place={place}
        />
      })}
    </div>
  );
}

export default LikedPlaces;
