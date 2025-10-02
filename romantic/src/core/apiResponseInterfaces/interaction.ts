import type ApiInterface from "./apiInterface.ts";
import type {Place} from "../model/LocationModels.ts";

type interactionLike = ApiInterface & {
  liked: boolean;
}

type interactionLikes = ApiInterface & {
  likes: Place[];
}

export type {
  interactionLike,
  interactionLikes
}
