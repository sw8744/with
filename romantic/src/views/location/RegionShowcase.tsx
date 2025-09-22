import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {locationPlaceAPI, locationRegionAPI} from "../../core/apiResponseInterfaces/location.ts";
import {isPageError, PageState} from "../../core/apiResponseInterfaces/apiInterface.ts";
import type {Place, Region} from "../../core/model/LocationModels.ts";
import {thumbnailUrl} from "../../core/model/ImageUrlProcessor.ts";
import {SkeletonElement, SkeletonFrame} from "../elements/Skeleton.tsx";
import {PageError} from "../error/ErrorPage.tsx";

interface InformationAreaPropsType {
  place: Place
}
interface ThemeTagPropsType {
  emogi: string;
  name: string;
  color: string;
  textColor?: string | null;
}

function PlaceArea(
  {place}: InformationAreaPropsType
) {
  const tUrl = thumbnailUrl(place.thumbnail);

  return (
    <Link
      className={'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row'}
      to={'/location/place/' + place.uid}
    >
      <img
        src={tUrl}
        className={
          'h-[130px] w-1/2 object-cover ' +
          '[mask-image:linear-gradient(to_right,black_70%,transparent)] ' +
          '[mask-repeat:no-repeat] [mask-size:100%_100%]'
        }
      />

      <div className={'px-3 py-3'}>
        <p className={'font-bold text-lg'}>{place.name}</p>
        <p className={'text-sm'}>{place.description}</p>
      </div>
    </Link>
  );
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

function RegionShowcase() {
  const regionUid = useParams()['regionUID'];

  const [regionInfo, setRegionInfo] = useState<Region>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  useEffect(() => {
    if (!regionUid) setPageState(1);

    (async () => {
      const regionResp =
        await apiAuth.get<locationRegionAPI>(
          '/location/region',
          {
            params: {
              uid: regionUid
            }
          }
        );
      setRegionInfo(regionResp.data.content[0]);

      const placeResp =
        await apiAuth.get<locationPlaceAPI>(
          '/location/place',
          {
            params: {
              regionUid: regionUid
            }
          }
        );
      setPlaces(placeResp.data.content);

      setPageState(PageState.NORMAL);
    })()
      .catch(err => {
        handleAxiosError(err, setPageState);
      });
  }, []);

  if (pageState === PageState.LOADING) return <RegionShowcaseSkeleton/>;
  else if (isPageError(pageState)) return <PageError pageState={pageState}/>;

  const tUrl = thumbnailUrl(regionInfo?.thumbnail);
  return (
    <>
      <img
        src={tUrl}
        className={'mb-10 w-full'}
      />

      <div className={'flex flex-col justify-baseline items-center gap-3'}>
        <p className={'text-3xl font-extrabold'}>{regionInfo?.name}</p>
        <p className={'text-lg font-medium'}>{regionInfo?.description}</p>
        <div className={'flex justify-center items-center gap-2'}>
          <ThemeTag emogi={'❤️'} name={'연인'} color={'#ffc1cc'}/>
          <ThemeTag emogi={'🔥'} name={'청춘'} color={'#ffc1cc'}/>
        </div>
      </div>


      <div className={'flex flex-col justify-baseline items-center gap-4 mx-5 my-5'}>
        {places.map((place, index) => (
          <PlaceArea
            key={index}
            place={place}
          />
        ))}
      </div>
    </>
  );
}

function RegionShowcaseSkeleton() {
  return (
    <SkeletonFrame>
      <SkeletonElement className={'w-full mb-10 aspect-video'}/>

      <div className={'flex flex-col justify-baseline items-center gap-3'}>
        <SkeletonElement expH={36} expW={100}/>
        <SkeletonElement expH={28} expW={220} className={'max-w-[50%]'}/>
        <SkeletonElement expH={32} expW={500} className={'max-w-[70%]'}/>
      </div>


      <div className={'flex flex-col justify-baseline items-center gap-4 mx-5 my-5'}>
        <div className={'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row'}>
          <SkeletonElement className={'w-1/2'} expH={130}/>

          <div className={'px-3 py-3'}>
            <SkeletonElement expH={20} expW={70}/>
            <SkeletonElement expH={15} expW={170} className={'my-2'}/>
            <SkeletonElement expH={15} expW={130}/>
          </div>
        </div>
        <div className={'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row'}>
          <SkeletonElement className={'w-1/2'} expH={130}/>

          <div className={'px-3 py-3'}>
            <SkeletonElement expH={20} expW={70}/>
            <SkeletonElement expH={15} expW={170} className={'my-2'}/>
            <SkeletonElement expH={15} expW={130}/>
          </div>
        </div>
      </div>
    </SkeletonFrame>
  )
}

export default RegionShowcase;
