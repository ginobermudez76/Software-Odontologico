import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición: adjuntar Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Respuesta: auto-refresh en 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken });
          const { accessToken } = res.data;

          useAuthStore.setState({ accessToken });
          localStorage.setItem('sigo_access_token', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (credentials: any) => {
    const res = await apiClient.post('/api/v1/auth/login', credentials);
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/api/v1/auth/logout');
    return res.data;
  },
  getMyNavigation: async () => {
    const res = await apiClient.get('/api/v1/auth/my-navigation');
    return res.data;
  },
};

