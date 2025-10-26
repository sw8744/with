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

type GetGeneralPlanRequest = ApiInterface & {
  plan: {
    uid: string;
    name: string;
    host_id: string;
    date: {
      from: string;
      to: string;
    };
    members: Array<{
      uid: string;
      name: string;
      role: number;
    }>;
  }
}

export type {
  planAddition,
  GetGeneralPlanRequest
}
