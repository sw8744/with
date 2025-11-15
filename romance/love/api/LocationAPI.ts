import type APITypes from "./APITypes.ts";
import {Place, Region} from "../model/LocationModels";

type locationRegionAPI = APITypes & {
  content: Region[]
}

type locationPlaceAPI = APITypes & {
  content: Place[]
}

export type {
  locationRegionAPI,
  locationPlaceAPI
}
