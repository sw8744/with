import CarouselRecommendation from "./CarouselRecommendation.tsx";
import PlaceAround from "./PlaceAround.tsx";
import RegionalSearch from "./RegionalSearch.tsx";

function CoreLocationIndex() {
  return (
    <div className={"flex flex-col gap-4 m-5"}>
      <CarouselRecommendation/>
      <PlaceAround/>
      <RegionalSearch/>
    </div>
  );
}


export default CoreLocationIndex;
