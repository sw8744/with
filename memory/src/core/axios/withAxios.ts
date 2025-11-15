import axios, {isAxiosError} from "axios";
import store from "../redux/RootReducer.ts";
import {refreshAccessToken} from "./apiAccessTokenInterceptor.ts";
import {PageState} from "../api/APITypes.ts";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

const apiAuth = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

function handleAxiosError(
  err: unknown,
  stateSetter: (state: PageState) => void
) {
  console.error(err);
  if (isAxiosError(err)) {
    switch (err.status) {
      case 400:
      case 406:
      case 422:
        stateSetter(PageState.CLIENT_FAULT);
        break;
      case 404:
      case 405:
        stateSetter(PageState.NOT_FOUND);
        break;
      case 401:
      case 403:
        stateSetter(PageState.FORBIDDEN);
        break;
      case 500:
        stateSetter(PageState.SERVER_FAULT);
        break;
      default:
        stateSetter(PageState.UNKNOWN_FAULT);
    }
  } else stateSetter(PageState.UNKNOWN_FAULT);
}

apiAuth.interceptors.request.use(
  async config => {
    const accessToken = store.getState().userInfoReducer.accessToken;

    if (accessToken) {
      //@ts-expect-error 타입 문제 없음
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`
      };
    } else {
      const accessToken = await refreshAccessToken();

      //@ts-expect-error 타입 문제 없음
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`
      };
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export {
  api,
  apiAuth,
  handleAxiosError
};
