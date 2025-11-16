import type APITypes from "./APITypes.ts";
import type {Place} from "../model/Location";

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
