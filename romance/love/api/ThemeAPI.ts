import type APITypes from "./APITypes.ts";
import type {ThemeMapping} from "../model/Theme";

type RecommendationThemeAPI = APITypes & {
  themes: ThemeMapping;
}

export type {
  RecommendationThemeAPI
}
