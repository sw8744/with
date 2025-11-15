import type APITypes from "./APITypes.ts";

type AuthorizeAPI = APITypes & {
  auth: boolean;
}

type RefreshTokenAPI = APITypes & {
  accessToken: string;
}


export type {
  AuthorizeAPI,
  RefreshTokenAPI
}
