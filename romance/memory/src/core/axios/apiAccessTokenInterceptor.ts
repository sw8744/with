import {api} from "./withAxios.ts";
import type {UserAPI} from "love/api/UserAPI.ts";
import axios from "axios";
import type {authAuthorizeAPI, authRefreshAPI} from "love/api/AuthenticationAPI.ts";
import {userInfoAction, type UserSignInType} from "../redux/UserInfoReducer.ts";
import store from "../redux/RootReducer.ts";
import issueNotification from "../notification/NotificationCenter.ts";

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
      "/auth/authorize",
      {headers: {"Authorization": `Bearer ${accessToken}`}}
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
    const resp = await api.get<UserAPI>(
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
      if (err.status === 401) throw 2;
      else if (err.status === 400) throw 1;
      else throw 3;
    } else throw 3;
  }
}

async function refreshAccessToken(): Promise<string> {
  // TODO: ADD CSRF PREVENT TOKEN BEFORE REFRESH
  const resp = await api.post<authRefreshAPI>(
    "/auth/refresh"
  );

  const credential = await resetAccessToken(resp.data.accessToken);
  store.dispatch(userInfoAction.signIn(credential));

  issueNotification(
    "인증 정보 업데이트",
    "액세스 토큰이 갱신되었습니다.",
    "info"
  );

  return credential.accessToken;
}

async function manualRefreshAccessToken(refreshToken: string): Promise<string> {
  // TODO: ADD CSRF PREVENT TOKEN BEFORE REFRESH
  const resp = await api.post<authRefreshAPI>(
    "/auth/refresh",
    {},
    {headers: {"X-Refresh-Token": `Bearer ${refreshToken}`}}
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
