import type ApiInterface from "./apiInterface.ts";
import type {Identity} from "../model/User.ts";

type userAPI = ApiInterface & {
  user: Identity
}

export type {
  userAPI
}
