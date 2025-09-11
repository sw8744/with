import {type UserSignInType} from "../redux/UserInfoReducer.ts";
import {api} from "./withAxios.ts";
import type {userAPI} from "../apiResponseInterfaces/user.ts";
import axios from "axios";
import type {authAuthorizeAPI} from "../apiResponseInterfaces/authentication.ts";

/**
 * reset access token and user redux
 * @param accessToken token to reset
 * @return user information to patch redux
 * @throws 1 400 error
 * @throws 2 401 error
 * @throws 3 500 or any other errors
 */
async function resetAccessToken(
  accessToken: string
): Promise<UserSignInType> {
  let authResp
  try {
    authResp = await api.get<authAuthorizeAPI>(
      '/auth/authorize',
      {headers: {'Authorization': `Bearer ${accessToken}`}}
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.status === 401) throw 2;
      else if (err.status === 400) throw 1;
      else throw 3;
    } else throw 3;
  }
  if (!authResp.data.auth) throw 2;

  try {
    const resp = await api.get<userAPI>(
      '/user',
      {headers: {'Authorization': `Bearer ${accessToken}`}}
    );

    return {
      name: resp.data.user.name,
      uid: resp.data.user.uuid,
      accessToken: accessToken,
      role: resp.data.user.role
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.status === 401) throw 2;
      else if (err.status === 400) throw 1;
      else throw 3;
    } else throw 3;
  }
}

function refreshAccessToken() {

}

export {
  resetAccessToken,
  refreshAccessToken
}
