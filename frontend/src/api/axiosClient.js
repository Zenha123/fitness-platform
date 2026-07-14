import axios from "axios";

const ACCESS_TOKEN_KEY = "fcp_access_token";
const REFRESH_TOKEN_KEY = "fcp_refresh_token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshInFlight = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status !== 401 || config._retry || !getRefreshToken()) {
      return Promise.reject(error);
    }
    config._retry = true;
    try {
      refreshInFlight =
        refreshInFlight ||
        axios.post(`${axiosClient.defaults.baseURL}/auth/token/refresh/`, {
          refresh: getRefreshToken(),
        });
      const { data } = await refreshInFlight;
      setTokens({ access: data.access });
      config.headers.Authorization = `Bearer ${data.access}`;
      return axiosClient(config);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      refreshInFlight = null;
    }
  }
);

export default axiosClient;