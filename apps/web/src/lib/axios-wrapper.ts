import axios, { type InternalAxiosRequestConfig } from "axios";

const config = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
};

const API = axios.create(config);

// bare instance so the refresh call itself never goes through the interceptor
const refreshClient = axios.create(config);

// 401s from these endpoints are real answers, not an expired session
const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

type RetriableRequest = InternalAxiosRequestConfig & { _retried?: boolean };

// share one refresh call between requests that fail at the same time
let refreshing: Promise<unknown> | null = null;

function refreshTokens() {
  refreshing ??= refreshClient.post("/auth/refresh").finally(() => {
    refreshing = null;
  });
  return refreshing;
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: RetriableRequest | undefined = error.config;

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      AUTH_PATHS.some((path) => original.url?.includes(path))
    ) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      await refreshTokens();
    } catch {
      return Promise.reject(error);
    }

    return API(original);
  },
);

export default API;
