import axios from "axios";
import store from "../redux/RootReducer.ts";
import {refreshAccessToken} from "./apiAccessTokenInterceptor.ts";
import {userInfoAction} from "../redux/UserInfoReducer.ts";

const api = axios.create({
  baseURL: '/api/v1/',
  timeout: 5000,
});

const apiAuth = axios.create({
  baseURL: '/api/v1/',
  timeout: 5000,
});

apiAuth.interceptors.request.use(
  async (config) => {
    const accessToken = store.getState().userInfoReducer.accessToken;

    if(accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`
      };
    }
    else {
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
  apiAuth
};
