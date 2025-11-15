import type APITypes from "./APITypes.ts";

type authAuthorizeAPI = APITypes & {
  auth: boolean;
}

type authRefreshAPI = APITypes & {
  accessToken: string;
}


export type {
  authAuthorizeAPI,
  authRefreshAPI
}
