import type {ThemeMapping} from "../model/Theme.ts";
import {apiAuth} from "../axios/withAxios.ts";
import type {recommendationThemeAPI} from "../apiResponseInterfaces/theme.ts";

let themeListLoaded = false;
let theme: ThemeMapping = {};

function getThemeMapping(): Promise<ThemeMapping> {
  return new Promise((resolve, reject) => {
    if (themeListLoaded) resolve(theme);
    else {
      apiAuth.get<recommendationThemeAPI>(
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

export {
  getThemeMapping,
}
