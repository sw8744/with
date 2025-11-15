import type APITypes from "./APITypes.ts";

type userRegisterAPI = APITypes & {
  jwt: string;
}

type authOAuthGoogleRegisterInfoAPI = APITypes & {
  content: {
    auth: {
      type: string;
      sub: string;
    }
    name: string;
    email: string;
    email_verified: boolean;
  }
}

export type {
  userRegisterAPI,
  authOAuthGoogleRegisterInfoAPI
}
