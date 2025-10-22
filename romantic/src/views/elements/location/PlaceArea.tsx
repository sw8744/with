import {thumbnailUrl} from "../../../core/model/ImageUrlProcessor.ts";
import {Link} from "react-router-dom";
import type {Place} from "../../../core/model/LocationModels.ts";
import {SkeletonElement, SkeletonUnit} from "../Skeleton.tsx";

interface InformationAreaPropsType {
  place: Place,
  className?: string,
}

function PlaceArea(
  {
    place, className
  }: InformationAreaPropsType
) {
  const tUrl = thumbnailUrl(place.thumbnail);

  return (
    <Link
      className={
        'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row' +
        (className ? ' ' + className : '')
      }
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
        <p className={'font-bold text-lg text-left'}>{place.name}</p>
        <p className={'text-sm text-left'}>{place.description}</p>
      </div>
    </Link>
  );
}

function PlaceAreaShow(
  {
    place, className
  }: InformationAreaPropsType
) {
  const tUrl = thumbnailUrl(place.thumbnail);

  return (
    <div
      className={
        'w-full shadow-neutral-300 shadow rounded-xl overflow-clip flex flex-row' +
        (className ? ' ' + className : '')
      }
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
        <p className={'font-bold text-lg text-left'}>{place.name}</p>
        <p className={'text-sm text-left'}>{place.description}</p>
      </div>
    </div>
  );
}

function PlaceAreaSkeleton() {
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

export {
  PlaceAreaSkeleton, PlaceArea, PlaceAreaShow
};
