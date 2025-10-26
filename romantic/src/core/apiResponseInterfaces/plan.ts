import type ApiInterface from "./apiInterface.ts";

type planAddition = ApiInterface & {
  plan: {
    uid: string;
    name: string;
    host_id: string;
    date_from: string;
    date_to: string;
  }
}

export type {
  planAddition
}
