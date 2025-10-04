import type ApiInterface from "./apiInterface.ts";

type userFollowerCount = ApiInterface & {
  count: number;
}

type userFollowingCount = ApiInterface & {
  count: number;
}

export type {
  userFollowerCount,
  userFollowingCount
}
