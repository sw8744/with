import type ApiInterface from "./apiInterface.ts";

type userFollowerCount = ApiInterface & {
  count: number;
}

type userFollowingCount = ApiInterface & {
  count: number;
}

type FriendInformationType = {
  uid: string;
  name: string;
}

type userFollowingGet = ApiInterface & {
  followings: [FriendInformationType];
}

enum Relationship {
  BLOCKED = 0,
  FOLLOWING = 1,
  FRIEND = 2,
  LIKED = 3
}

export type {
  userFollowerCount,
  userFollowingCount,
  userFollowingGet,
  FriendInformationType
}

export {
  Relationship
}
