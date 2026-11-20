import Axios, { type AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { getServerApiUrl } from '@/shared/config/env';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: typeof window === 'undefined' ? getServerApiUrl() : '',
  withCredentials: true,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const NO_REFRESH_URLS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshPromise ??= AXIOS_INSTANCE.post('/api/auth/refresh', undefined, { _retry: true } as AxiosRequestConfig)
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

AXIOS_INSTANCE.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const isBrowser = typeof window !== 'undefined';
  if (
    isBrowser &&
    config &&
    error.response?.status === 401 &&
    !config._retry &&
    !NO_REFRESH_URLS.some((url) => config.url?.startsWith(url))
  ) {
    config._retry = true;
    try {
      await refreshSession();
    } catch {
      throw error;
    }
    return AXIOS_INSTANCE(config);
  }
  throw error;
});

export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> =>
  AXIOS_INSTANCE({ ...config, ...options }).then(({ data }) => data);

export type BodyType<BodyData> = BodyData;
