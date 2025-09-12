import type ApiInterface from "./apiInterface.ts";

type authAuthorizeAPI = ApiInterface & {
  code: number;
  status: string;
  auth: boolean;
}

type authRefreshAPI = ApiInterface & {
  accessToken: string;
}


export type {
  authAuthorizeAPI,
  authRefreshAPI
}
