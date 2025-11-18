import type APITypes from "./APITypes.ts";
import type {ThemeMapping} from "../model/Theme";

type RecommendationThemeAPI = APITypes & {
  themes: ThemeMapping;
}

type PlaceThemeRequestAPI = APITypes & {
  themes: number[];
}

export type {
  RecommendationThemeAPI,
  PlaceThemeRequestAPI
}
