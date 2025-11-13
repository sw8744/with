import CarouselRecommendation from "./CarouselRecommendation.tsx";
import ThemeSearch from "./ThemeSearch.tsx";
import RegionalSearch from "./RegionalSearch.tsx";

function CoreLocationIndex() {
  return (
    <div className={"flex flex-col gap-5 p-5"}>
      <CarouselRecommendation/>
      <RegionalSearch/>
      <ThemeSearch/>
    </div>
  );
}


export default CoreLocationIndex;
