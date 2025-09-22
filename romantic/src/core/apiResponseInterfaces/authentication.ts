import type ApiInterface from "./apiInterface.ts";

type authAuthorizeAPI = ApiInterface & {
  auth: boolean;
}

type authRefreshAPI = ApiInterface & {
  accessToken: string;
}


export type {
  authAuthorizeAPI,
  authRefreshAPI
}
