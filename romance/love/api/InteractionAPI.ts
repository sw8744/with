import type APITypes from "./APITypes.ts";
import {Place} from "../model/LocationModels";

type interactionLike = APITypes & {
  liked: boolean;
}

type interactionLikes = APITypes & {
  likes: Place[];
}

export type {
  interactionLike,
  interactionLikes
}
