import type ApiInterface from "./apiInterface.ts";
import type {Place, Region} from "../model/LocationModels.ts";

type locationRegionAPI = ApiInterface & {
  content: [Region]
}

type locationPlaceAPI = ApiInterface & {
  content: [Place]
}

export type {
  locationRegionAPI,
  locationPlaceAPI
}
