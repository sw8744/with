import CarouselRecommendation from "./CarouselRecommendation.tsx";
import RegionalSearch from "./RegionalSearch.tsx";
import {PageTransitionLayer} from "../../elements/hierarchy/HierarchyStructure.tsx";

function CoreLocationIndex() {
  return (
    <PageTransitionLayer className={"flex flex-col gap-5 p-5"}>
      <CarouselRecommendation/>
      <RegionalSearch/>
    </PageTransitionLayer>
  );
}


export default CoreLocationIndex;
