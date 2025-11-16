import type APITypes from "./APITypes";
import type {Passkey} from "../model/Passkey";

type ListPasskeyAPI = APITypes & {
  passkeys: Passkey[];
}

export type {
  ListPasskeyAPI
}
