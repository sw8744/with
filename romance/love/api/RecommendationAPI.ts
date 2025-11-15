import type APITypes from "./APITypes.ts";

type recommendationRegion = APITypes & {
  recommendation: [
    {
      region: string;
      score: number
    }
  ],
}

type recommendationPlace = APITypes & {
  recommendation: [
    {
      place: string;
      score: number
    }
  ],
}

export type {
  recommendationRegion,
  recommendationPlace
}
