import type APITypes from "./APITypes.ts";
import type {ThemeMapping} from "model/Theme.ts";

type recommendationThemeAPI = APITypes & {
  themes: ThemeMapping;
}

export type {
  recommendationThemeAPI
}
