import type {ThemeMapping} from "love/model/Theme.ts";
import {apiAuth} from "../axios/withAxios.ts";
import type {RecommendationThemeAPI} from "love/api/ThemeAPI.ts";

let themeListLoaded = false;
let theme: ThemeMapping = {};

function getThemeMapping(): Promise<ThemeMapping> {
  return new Promise((resolve, reject) => {
    if (themeListLoaded) resolve(theme);
    else {
      apiAuth.get<RecommendationThemeAPI>(
        "/recommendation/theme",
      ).then(res => {
        themeListLoaded = true;
        theme = res.data.themes;
        resolve(theme);
      }).catch(err => {
        reject(err);
      });
    }
  });
}

function resetThemeCache() {
  themeListLoaded = false;
  theme = {};
}

export {
  getThemeMapping, resetThemeCache
}
