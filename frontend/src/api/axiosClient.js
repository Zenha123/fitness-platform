import axios from "axios";

const ACCESS_TOKEN_KEY = "fcp_access_token";
const REFRESH_TOKEN_KEY = "fcp_refresh_token";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const axiosClient = axios.create({
  baseURL: BASE_URL,
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

// Shared promise for concurrent 401s — all waiters share ONE refresh call.
// Reset only after the promise settles so no second caller starts a new
// refresh with the already-rotated (now blacklisted) token.
let refreshInFlight = null;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Only attempt refresh for 401s that haven't been retried yet
    if (response?.status !== 401 || config._retry || !getRefreshToken()) {
      return Promise.reject(error);
    }
    config._retry = true;

    // Start one shared refresh call; all concurrent 401 failures share it
    if (!refreshInFlight) {
      // Build the refresh URL from the base URL's origin to avoid double /api/ prefix
      const origin = new URL(BASE_URL).origin;
      refreshInFlight = axios
        .post(`${origin}/api/auth/token/refresh/`, { refresh: getRefreshToken() })
        .then((res) => {
          setTokens({ access: res.data.access, refresh: res.data.refresh });
          return res.data.access;
        })
        .catch((err) => {
          // Refresh failed — clear everything and force re-login
          clearTokens();
          localStorage.removeItem("fcp_user");
          // Redirect to login only if not already there
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(err);
        })
        .finally(() => {
          refreshInFlight = null;
        });
    }

    try {
      const newAccessToken = await refreshInFlight;
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(config);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;