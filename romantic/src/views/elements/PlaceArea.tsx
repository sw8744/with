import {thumbnailUrl} from "../../core/model/ImageUrlProcessor.ts";
import {Link} from "react-router-dom";
import type {Place} from "../../core/model/LocationModels.ts";

interface InformationAreaPropsType {
  place: Place
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

export default PlaceArea;
