import {userInfoAction, type UserSignInType} from "../redux/UserInfoReducer.ts";
import {api} from "./withAxios.ts";
import axios from "axios";
import store from "../redux/RootReducer.ts";
import type {AuthorizeAPI, RefreshTokenAPI} from "../api/AuthenticationAPIs.ts";
import type {UserInfoAPI} from "../api/UserInfoAPI.ts";

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
    authResp = await api.get<AuthorizeAPI>(
      "/auth/authorize",
      {headers: {"Authorization": `Bearer ${accessToken}`}}
    );
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.message;
    } else throw "인증 실패";
  }
  if (!authResp.data.auth) throw "잘못된 인증 정보";

  try {
    const resp = await api.get<UserInfoAPI>(
      "/user",
      {headers: {"Authorization": `Bearer ${accessToken}`}}
    );

    return {
      name: resp.data.user.name,
      uid: resp.data.user.uid,
      accessToken: accessToken,
      role: resp.data.user.role,
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw err.message;
    } else throw "사용자 정보 로드 실패";
  }
}

async function refreshAccessToken(): Promise<string> {
  const resp = await api.post<RefreshTokenAPI>(
    "/auth/refresh"
  );

  const credential = await resetAccessToken(resp.data.accessToken);
  store.dispatch(userInfoAction.signIn(credential));

  return credential.accessToken;
}

async function manualRefreshAccessToken(refreshToken: string): Promise<string> {
  const resp = await axios.post<RefreshTokenAPI>(
    "/auth/refresh",
    {},
    {
      withCredentials: true,
      headers: {
        "X-Refresh-Token": refreshToken
      }
    }
  );

  const credential = await resetAccessToken(resp.data.accessToken);
  store.dispatch(userInfoAction.signIn(credential));

  return credential.accessToken;
}

export {
  resetAccessToken,
  refreshAccessToken,
  manualRefreshAccessToken
}
