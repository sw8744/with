import type ApiInterface from "./apiInterface.ts";

type recommendationRegion = ApiInterface & {
  recommendation: [
    {
      region: string;
      score: number
    }
  ],
}

type recommendationPlace = ApiInterface & {
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
