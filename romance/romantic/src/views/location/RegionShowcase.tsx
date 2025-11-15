import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {locationPlaceAPI, locationRegionAPI} from "love/api/LocationAPI.ts";
import PageState from "love/model/PageState.ts";
import {isPageError} from "love/api/APITypes.ts";
import type {Place, Region} from "love/model/LocationModels.ts";
import {SkeletonElement, SkeletonFrame, SkeletonUnit} from "../elements/loading/Skeleton.tsx";
import {PageError} from "../error/ErrorPage.tsx";
import {PlaceArea, PlaceAreaSkeleton} from "../elements/location/PlaceArea.tsx";
import {BackHeader} from "../elements/hierarchy/HierarchyStructure.tsx";
import AnimatedSuspense from "../elements/hierarchy/AnimatedSuspense.tsx";
import Img, {ImageType} from "../elements/common/Imgs.tsx";


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
        color: props.textColor ?? "#0C0C0C",
      }}
      className={"rounded-lg px-2 py-1"}
    >{props.emogi} {props.name}</span>
  )
}

function RegionShowcase() {
  const regionUid = useParams()["regionUID"];

  const [regionInfo, setRegionInfo] = useState<Region>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);

  useEffect(() => {
    if (!regionUid) {
      setPageState(PageState.NOT_FOUND);
      return;
    }

    (async () => {
      const regionResp =
        await apiAuth.get<locationRegionAPI>(
          "/location/region",
          {
            params: {
              uid: regionUid
            }
          }
        );
      if (regionResp.data.content.length === 0) {
        setPageState(PageState.NOT_FOUND);
        return;
      }
      setRegionInfo(regionResp.data.content[0]);

      const placeResp =
        await apiAuth.get<locationPlaceAPI>(
          "/location/place",
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

  if (isPageError(pageState)) return <PageError pageState={pageState}/>;

  return (
    <AnimatedSuspense
      pageState={pageState}
      loadingSkeleton={<RegionShowcaseSkeleton/>}
    >
      <BackHeader title={regionInfo?.name ?? ""}/>

      <Img
        src={regionInfo?.thumbnail}
        type={ImageType.REGION_THUMBNAIL}
        className={"mb-10 w-full shadow"}
      />

      <div className={"flex flex-col justify-baseline items-center gap-3"}>
        <p className={"text-3xl font-extrabold"}>{regionInfo?.name}</p>
        <p className={"text-lg font-medium"}>{regionInfo?.description}</p>
        <div className={"flex justify-center items-center gap-2"}>
          <ThemeTag emogi={"❤️"} name={"연인"} color={"#ffc1cc"}/>
          <ThemeTag emogi={"🔥"} name={"청춘"} color={"#ffc1cc"}/>
        </div>
      </div>


      <div className={"flex flex-col justify-baseline items-center gap-4 mx-5 my-5"}>
        {places.map((place, index) => (
          <PlaceArea
            key={index}
            place={place}
          />
        ))}
      </div>
    </AnimatedSuspense>
  );
}

function RegionShowcaseSkeleton() {
  return (
    <SkeletonFrame>
      <SkeletonUnit>
        <SkeletonElement className={"w-full mb-10 aspect-video"} unit/>
      </SkeletonUnit>

      <div className={"flex flex-col justify-baseline items-center gap-3"}>
        <SkeletonElement expH={36} expW={100} unit/>
        <SkeletonElement expH={28} expW={220} className={"max-w-[50%]"} unit/>
        <SkeletonElement expH={32} expW={500} className={"max-w-[70%]"} unit/>
      </div>

      <div className={"flex flex-col justify-baseline items-center gap-4 mx-5 my-5"}>
        <PlaceAreaSkeleton/>
        <PlaceAreaSkeleton/>
      </div>
    </SkeletonFrame>
  )
}

export default RegionShowcase;
