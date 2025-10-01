import type ApiInterface from "./apiInterface.ts";

type interactionLike = ApiInterface & {
  liked: boolean;
}

type interactionLikes = ApiInterface & {
  likes: string[];
}

export type {
  interactionLike,
  interactionLikes
}
