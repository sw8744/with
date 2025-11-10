import SeasonalRecommendation from "./SeasonalRecommendation.tsx";
import PlaceAround from "./PlaceAround.tsx";
import RegionalSearch from "./RegionalSearch.tsx";

function CoreLocationIndex() {
  return (
    <div className={"flex flex-col gap-4 m-5"}>
      <SeasonalRecommendation/>
      <PlaceAround/>
      <RegionalSearch/>
    </div>
  );
}


export default CoreLocationIndex;
