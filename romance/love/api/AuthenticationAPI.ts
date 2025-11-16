import type APITypes from "./APITypes.ts";

type authAuthorizeAPI = APITypes & {
  auth: boolean;
}

type authRefreshAPI = APITypes & {
  accessToken: string;
}

type PasskeyAuthenticationAPI = APITypes & {
  jwt: string;
}

type AuthenticationMethodsAPI = APITypes & {
  methods: {
    google: number;
    passkey: number;
  };
}

export type {
  authAuthorizeAPI,
  authRefreshAPI,
  PasskeyAuthenticationAPI,
  AuthenticationMethodsAPI
}
