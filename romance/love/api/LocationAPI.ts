import type APITypes from "./APITypes.ts";
import type {Place, Region} from "../model/Location";

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
