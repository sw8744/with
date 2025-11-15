import type APITypes from "./APITypes.ts";
import type {Identity, SearchedUser} from "../model/User";

type UserAPI = APITypes & {
  user: Identity
}

type SearchUsersAPI = APITypes & {
  users: Array<SearchedUser>
}

export type {
  UserAPI, SearchUsersAPI
}
