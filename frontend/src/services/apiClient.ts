import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { store } from '../store/index';
import { clearAuth, setToken } from '../store/store';
import { addNotification } from '../store/store';
import { authService } from './authService';

// Create base API client
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Try to refresh the token
          const refreshResponse = await authService.refreshToken(refreshToken);
          const newToken = refreshResponse.token;

          // Store the new token
          localStorage.setItem('token', newToken);
          store.dispatch(setToken(newToken));

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          store.dispatch(clearAuth());

          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Session Expired',
              message: 'Your session has expired. Please log in again.',
            })
          );

          // Redirect to login page
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear auth and redirect
        localStorage.removeItem('token');
        store.dispatch(clearAuth());

        store.dispatch(
          addNotification({
            type: 'error',
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again.',
          })
        );

        // Redirect to login page
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 403:
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Access Denied',
              message: 'You do not have permission to perform this action.',
            })
          );
          break;

        case 404:
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Not Found',
              message: 'The requested resource was not found.',
            })
          );
          break;

        case 422:
          // Validation errors
          const validationMessage = (data as any)?.message || 'Validation failed';
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Validation Error',
              message: validationMessage,
            })
          );
          break;

        case 429:
          store.dispatch(
            addNotification({
              type: 'warning',
              title: 'Rate Limited',
              message: 'Too many requests. Please try again later.',
            })
          );
          break;

        case 500:
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Server Error',
              message: 'An internal server error occurred. Please try again later.',
            })
          );
          break;

        default:
          const errorMessage = (data as any)?.message || 'An unexpected error occurred';
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Error',
              message: errorMessage,
            })
          );
      }
    } else if (error.request) {
      // Network error
      store.dispatch(
        addNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
        })
      );
    } else {
      // Other error
      store.dispatch(
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'An unexpected error occurred.',
        })
      );
    }

    return Promise.reject(error);
  }
);

// API response wrapper utility
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default apiClient;
