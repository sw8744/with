import type ApiInterface from "./apiInterface.ts";

type recommendationRegion = ApiInterface & {
  recommendation: [
    {
      region: string;
      score: number
    }
  ]
}

export type {
  recommendationRegion
}
