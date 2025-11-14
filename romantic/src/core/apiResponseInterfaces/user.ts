import type ApiInterface from "./apiInterface.ts";
import type {Identity} from "../model/User.ts";

type userAPI = ApiInterface & {
  user: Identity
}

type SearchedUser = {
  uid: string;
  name: string;
}

type SearchUsersAPI = ApiInterface & {
  users: Array<SearchedUser>
}

export type {
  userAPI, SearchUsersAPI, SearchedUser
}
