import type {Identity} from "../model/Identity.ts";
import type APIType from "./APITypes.ts";

type UserInfoAPI = APIType & {
  user: Identity
}

type SearchedUser = {
  uid: string;
  name: string;
}

type SearchUsersAPI = APIType & {
  users: Array<SearchedUser>
}

export type {
  UserInfoAPI, SearchUsersAPI, SearchedUser
}
