import axios, {isAxiosError} from "axios";
import store from "../redux/RootReducer.ts";
import {refreshAccessToken} from "./apiAccessTokenInterceptor.ts";
import PageState from "love/model/PageState.ts";

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

apiAuth.interceptors.request.use(
  async config => {
    const accessToken = store.getState().userInfoReducer.accessToken;

    //@ts-expect-error 타입 문제 없음
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`
    };

    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

//@ts-expect-error 타입 문제 없음
const processQueue = (error, token: string) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiAuth.interceptors.response.use(
  response => {
    return response;
  },
  async err => {
    const originalRequest = err.config;

    if (err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return apiAuth(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      } else {
        isRefreshing = true;

        try {
          const accessToken = await refreshAccessToken();
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          processQueue(null, accessToken);

          return apiAuth(originalRequest);
        } catch (err) {
          processQueue(err, "");
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    } else return Promise.reject(err);
  }
);

export {
  api,
  apiAuth,
  handleAxiosError
};
