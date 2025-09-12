import type ApiInterface from "./apiInterface.ts";

type userRegisterAPI = ApiInterface & {
  jwt: string;
}

type authOAuthGoogleRegisterInfoAPI = ApiInterface & {
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
