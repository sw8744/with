import {useParams} from "react-router-dom";
import {type ReactElement, type ReactNode, useEffect, useState} from "react";
import type {Place} from "love/model/Location.ts";
import PageState from "love/model/PageState.ts";
import {apiAuth, handleAxiosError} from "../../core/axios/withAxios.ts";
import type {LocationPlaceAPI} from "love/api/LocationAPI.ts";
import {SkeletonElement, SkeletonFrame} from "../elements/loading/Skeleton.tsx";
import {PageError} from "../error/ErrorPage.tsx";
import PlaceMetaInterpreter from "./PlaceMetadata.tsx";
import type {interactionLike} from "love/api/InteractionAPI.ts";
import {StarFilledIcon, StarIcon} from "../../assets/svgs/svgs.ts";
import {BackHeader} from "../elements/hierarchy/HierarchyStructure.tsx";
import AnimatedSuspense from "../elements/hierarchy/AnimatedSuspense.tsx";
import Img, {ImageType} from "../elements/common/Imgs.tsx";
import {isPageError} from "love/api/APITypes.ts";

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

function PlaceShowcase() {
  const placeUid = useParams()["placeUID"];

  const [placeInfo, setPlaceInfo] = useState<Place>();
  const [likedPlace, setLikedPlace] = useState<boolean>(false);
  const [pageState, setPageState] = useState<PageState>(PageState.LOADING);
  const [likeOperationState, setLikeOperationState] = useState<PageState>(PageState.LOADING);

  function toggleLike() {
    setLikeOperationState(PageState.WORKING);
    if (likedPlace) {
      apiAuth.delete(
        "/interaction/like/" + placeUid
      ).then(() => {
        setLikedPlace(false);
        setLikeOperationState(PageState.NORMAL);
      }).catch(err => {
        handleAxiosError(err, setLikeOperationState);
      });
    } else {
      apiAuth.post(
        "/interaction/like",
        {
          placeId: placeUid
        }
      ).then(() => {
        setLikedPlace(true);
        setLikeOperationState(PageState.NORMAL);
      }).catch(err => {
        handleAxiosError(err, setLikeOperationState);
      });
    }
  }

  useEffect(() => {
    if (!placeUid) {
      setPageState(PageState.NOT_FOUND);
      return;
    }

    (async () => {
      const placeResp = await apiAuth.get<LocationPlaceAPI>(
        "location/place",
        {
          params: {
            uid: placeUid
          }
        }
      );
      if (placeResp.data.content.length === 0) {
        setPageState(PageState.NOT_FOUND);
        return;
      }
      setPlaceInfo(placeResp.data.content[0]);
      setPageState(PageState.NORMAL);

      const likeResp = await apiAuth.get<interactionLike>(
        "interaction/like/" + placeUid
      );
      setLikedPlace(likeResp.data.liked);
    })().catch(err => {
      handleAxiosError(err, setPageState);
    });
  }, []);

  if (isPageError(pageState)) return <PageError pageState={pageState}/>;

  return (
    <AnimatedSuspense
      pageState={pageState}
      loadingSkeleton={<PlaceShowcaseSkeleton/>}
    >
      <BackHeader title={placeInfo?.name ?? ""}/>

      <Img
        src={placeInfo?.thumbnail}
        type={ImageType.PLACE_THUMBNAIL}
        className={"mb-10 w-full shadow"}
      />

      <div className={"flex flex-col justify-baseline items-center gap-3"}>
        <p className={"text-3xl font-extrabold"}>{placeInfo?.name}</p>
        <p className={"text-lg font-medium"}>{placeInfo?.description}</p>
        <div className={"flex justify-center items-center"}>
          <ThemeTag emogi={"❤️"} name={"연인"} color={"#ffc1cc"}/>
        </div>
        <div className={"flex justify-center w-full"}>
          <PlaceOperationButton
            onClick={toggleLike}
            disabled={likeOperationState === PageState.WORKING}
            icon={
              likedPlace ?
                <StarFilledIcon height={22} className={"fill-amber-400"}/> :
                <StarIcon height={22} className={"fill-neutral-500"}/>
            }
          >저장</PlaceOperationButton>
          <PlaceOperationButton onClick={toggleLike}>TODO: FEATURE PLACEHOLDER</PlaceOperationButton>
          <PlaceOperationButton onClick={toggleLike}>TODO: FEATURE PLACEHOLDER</PlaceOperationButton>
        </div>
      </div>

      <PlaceMetaInterpreter meta={placeInfo?.metadata} address={placeInfo?.address}/>
    </AnimatedSuspense>
  );
}

function PlaceShowcaseSkeleton() {
  return (
    <SkeletonFrame>
      <BackHeader title={""}/>

      <SkeletonElement className={"w-full mb-10 aspect-video"}/>
      <div className={"flex flex-col justify-baseline items-center gap-3"}>
        <SkeletonElement expH={36} expW={100}/>
        <SkeletonElement expH={28} expW={220} className={"max-w-[50%]"}/>
        <SkeletonElement expH={32} expW={500} className={"max-w-[70%]"}/>
      </div>
    </SkeletonFrame>
  );
}

interface PlaceOperationButtonType {
  icon: ReactElement
  children: ReactNode,
  disabled: boolean,
  onClick: () => void,
}

function PlaceOperationButton(
  {
    icon,
    children,
    onClick,
    disabled
  }: PlaceOperationButtonType
) {
  return (
    <button
      className={"w-full px-5 py-2 border-y border-neutral-600 flex gap-1.5 justify-center items-center cursor-pointer"}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export default PlaceShowcase;
