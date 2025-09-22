import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Place} from "../../core/model/LocationModels.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {locationPlaceAPI} from "../../core/apiResponseInterfaces/location.ts";
import {thumbnailUrl} from "../../core/model/ImageUrlProcessor.ts";
import {SkeletonElement, SkeletonFrame} from "../elements/Skeleton.tsx";
import {PageError} from "../error/ErrorPage.tsx";
import LocationMetaInterpreter from "./LocationMetadata.tsx";

interface ThemeTagPropsType {
  emogi: string;
  name: string;
  color: string;
  textColor?: string | null;
}


function ThemeTag(
  props: ThemeTagPropsType
) {
  return (
    <span
      style={{
        backgroundColor: props.color,
        color: props.textColor ?? '#0C0C0C',
      }}
      className={'rounded-lg px-2 py-1'}
    >{props.emogi} {props.name}</span>
  )
}

function LocationShowcase() {
  const placeUid = useParams()['placeUID'];

  const [placeInfo, setPlaceInfo] = useState<Place>();
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  useEffect(() => {
    if (!placeUid) setPageState(1);

    apiAuth.get<locationPlaceAPI>(
      "location/place",
      {
        params: {
          uid: placeUid
        }
      }
    ).then(res => {
      setPlaceInfo(res.data.content[0]);
      setPageState(PageState.NORMAL);
    }).catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (pageState === PageState.LOADING) return <LocationShowcaseSkeleton/>
  if (isPageError(pageState)) return <PageError pageState={pageState}/>

  return (
    <>
      <img
        src={thumbnailUrl(placeInfo?.thumbnail)}
        className={'mb-10 w-full'}
      />

      <div className={'flex flex-col justify-baseline items-center gap-3'}>
        <p className={'text-3xl font-extrabold'}>{placeInfo?.name}</p>
        <p className={'text-lg font-medium'}>{placeInfo?.description}</p>
        <div className={'flex justify-center items-center'}>
          <ThemeTag emogi={'❤️'} name={'연인'} color={'#ffc1cc'}/>
        </div>
      </div>

      <LocationMetaInterpreter meta={placeInfo?.metadata} address={placeInfo?.address}/>
    </>
  );
}

function LocationShowcaseSkeleton() {
  return (
    <SkeletonFrame>
      <SkeletonElement className={'w-full mb-10 aspect-video'}/>

      <div className={'flex flex-col justify-baseline items-center gap-3'}>
        <SkeletonElement expH={36} expW={100}/>
        <SkeletonElement expH={28} expW={220} className={'max-w-[50%]'}/>
        <SkeletonElement expH={32} expW={500} className={'max-w-[70%]'}/>
      </div>
    </SkeletonFrame>
  );
}

export default LocationShowcase;
