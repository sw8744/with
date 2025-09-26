import axios, {isAxiosError} from "axios";
import store from "../redux/RootReducer.ts";
import {refreshAccessToken} from "./apiAccessTokenInterceptor.ts";
import {PageState} from "../apiResponseInterfaces/apiInterface.ts";

const api = axios.create({
  baseURL: '/api/v1/',
  timeout: 5000,
});

const apiAuth = axios.create({
  baseURL: '/api/v1/',
  timeout: 5000,
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
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`
      };
    } else {
      const accessToken = await refreshAccessToken();

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
)

export {
  api,
  apiAuth,
  handleAxiosError
};
