import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach access token
api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
  if (tokens.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        const res = await axios.post(`${API_BASE}/auth/refresh-token`, {
          refreshToken: tokens.refreshToken
        });
        const newTokens = res.data.data.tokens;
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
