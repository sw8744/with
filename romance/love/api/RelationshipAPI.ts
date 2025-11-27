import type APITypes from "./APITypes.ts";

type userFollowerCount = APITypes & {
  count: number;
}

type userFollowingCount = APITypes & {
  count: number;
}

type RelationshipStateAPI = APITypes & {
  relationship: Relationship;
}

type FriendInformationType = {
  uid: string;
  name: string;
}

type userFollowingGet = APITypes & {
  followings: FriendInformationType[];
}

//@ts-expect-error ENUM이 뭐가 어때서
enum Relationship {
  NONE = -1,
  BLOCKED = 0,
  FOLLOWING = 1,
  FRIEND = 2,
  LIKED = 3
}

export type {
  userFollowerCount,
  userFollowingCount,
  userFollowingGet,
  FriendInformationType,
  RelationshipStateAPI
}

export {
  Relationship
}
