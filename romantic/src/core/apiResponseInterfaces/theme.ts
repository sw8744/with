import type ApiInterface from "./apiInterface.ts";
import type {ThemeMapping} from "../model/Theme.ts";

type recommendationThemeAPI = ApiInterface & {
  themes: ThemeMapping;
}

export type {
  recommendationThemeAPI
}
