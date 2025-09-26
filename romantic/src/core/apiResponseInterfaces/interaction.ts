import type ApiInterface from "./apiInterface.ts";

type interactionLike = ApiInterface & {
  liked: boolean;
}

export type {
  interactionLike
}
