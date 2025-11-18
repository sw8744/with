import type APITypes from "./APITypes.ts";
import type {Place, Region} from "../model/Location";

type LocationRegionAPI = APITypes & {
  content: Region[]
}

type LocationPlaceAPI = APITypes & {
  content: Place[]
}

export type {
  LocationRegionAPI,
  LocationPlaceAPI
}
