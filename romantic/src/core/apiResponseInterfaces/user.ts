import type ApiInterface from "./apiInterface.ts";

type userAPI = ApiInterface & {
  user: {
    uuid: string;
    name: string;
    email: string;
    emailVerified: string;
    sex: number;
    birthday: string;
    role: string[];
  }
}

export type {
  userAPI
}
