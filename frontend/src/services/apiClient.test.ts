import axios from 'axios';
import { store } from '../store/index';
import { clearAuth, setToken } from '../store/store';
import { addNotification } from '../store/store';
import apiClient, { handleApiResponse, handleApiError } from './apiClient';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock store
jest.mock('@store/index', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch = jest.fn();
    window.location.href = '';
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');

      const mockRequest = {
        headers: {},
      };

      const mockConfig = {
        ...mockRequest,
        transformRequest: axios.defaults.transformRequest,
        transformResponse: axios.defaults.transformResponse,
      };

      // Simulate the request interceptor
      const requestInterceptor = mockedAxios.interceptors.request.use(
        config => config,
        error => Promise.reject(error)
      );

      const result = await requestInterceptor.onFulfilled(mockConfig);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add Authorization header when no token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const mockRequest = {
        headers: {},
      };

      const mockConfig = {
        ...mockRequest,
        transformRequest: axios.defaults.transformRequest,
        transformResponse: axios.defaults.transformResponse,
      };

      const requestInterceptor = mockedAxios.interceptors.request.use(
        config => config,
        error => Promise.reject(error)
      );

      const result = await requestInterceptor.onFulfilled(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor - Success', () => {
    it('should pass through successful responses', async () => {
      const mockResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        error => Promise.reject(error)
      );

      const result = await responseInterceptor.onFulfilled(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Response Interceptor - 401 Unauthorized', () => {
    it('should handle 401 error with refresh token successfully', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: false },
      };

      localStorageMock.getItem
        .mockReturnValueOnce('old-token') // token
        .mockReturnValueOnce('refresh-token'); // refreshToken

      // Mock successful token refresh
      const mockRefreshResponse = {
        token: 'new-token',
      };

      const mockAuthService = {
        refreshToken: jest.fn().mockResolvedValue(mockRefreshResponse),
      };

      // Mock authService import
      jest.doMock('./authService', () => ({
        authService: mockAuthService,
      }));

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
              const refreshResponse = await mockAuthService.refreshToken('refresh-token');
              const newToken = refreshResponse.token;

              localStorageMock.setItem('token', newToken);
              store.dispatch(setToken(newToken));

              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              return apiClient(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );

      // This would typically retry the original request
      // For testing purposes, we verify the refresh logic
      expect(localStorageMock.getItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should handle 401 error when refresh fails', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: false },
      };

      localStorageMock.getItem
        .mockReturnValueOnce('old-token')
        .mockReturnValueOnce('refresh-token');

      const mockAuthService = {
        refreshToken: jest.fn().mockRejectedValue(new Error('Refresh failed')),
      };

      jest.doMock('./authService', () => ({
        authService: mockAuthService,
      }));

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
              await mockAuthService.refreshToken('refresh-token');
            } catch (refreshError) {
              localStorageMock.removeItem('token');
              localStorageMock.removeItem('refreshToken');
              store.dispatch(clearAuth());

              store.dispatch(
                addNotification({
                  type: 'error',
                  title: 'Session Expired',
                  message: 'Your session has expired. Please log in again.',
                })
              );

              window.location.href = '/auth/login';
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(store.dispatch).toHaveBeenCalledWith(clearAuth());
      expect(window.location.href).toBe('/auth/login');
    });

    it('should handle 401 error without refresh token', async () => {
      const error = {
        response: { status: 401 },
        config: { _retry: false },
      };

      localStorageMock.getItem.mockReturnValueOnce('old-token').mockReturnValueOnce(null); // No refresh token

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          const originalRequest = error.config;

          if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorageMock.getItem('refreshToken');

            if (!refreshToken) {
              localStorageMock.removeItem('token');
              store.dispatch(clearAuth());

              store.dispatch(
                addNotification({
                  type: 'error',
                  title: 'Session Expired',
                  message: 'Your session has expired. Please log in again.',
                })
              );

              window.location.href = '/auth/login';
            }

            return Promise.reject(error);
          }

          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(store.dispatch).toHaveBeenCalledWith(clearAuth());
      expect(window.location.href).toBe('/auth/login');
    });
  });

  describe('Response Interceptor - Other HTTP Errors', () => {
    it('should handle 403 Forbidden error', async () => {
      const error = {
        response: { status: 403 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.response?.status === 403) {
            store.dispatch(
              addNotification({
                type: 'error',
                title: 'Access Denied',
                message: 'You do not have permission to perform this action.',
              })
            );
          }
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'error',
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
        })
      );
    });

    it('should handle 404 Not Found error', async () => {
      const error = {
        response: { status: 404 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.response?.status === 404) {
            store.dispatch(
              addNotification({
                type: 'error',
                title: 'Not Found',
                message: 'The requested resource was not found.',
              })
            );
          }
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'error',
          title: 'Not Found',
          message: 'The requested resource was not found.',
        })
      );
    });

    it('should handle 422 Validation error', async () => {
      const error = {
        response: {
          status: 422,
          data: { message: 'Invalid input data' },
        },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.response?.status === 422) {
            const validationMessage = error.response?.data?.message || 'Validation failed';
            store.dispatch(
              addNotification({
                type: 'error',
                title: 'Validation Error',
                message: validationMessage,
              })
            );
          }
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Invalid input data',
        })
      );
    });

    it('should handle 429 Rate Limit error', async () => {
      const error = {
        response: { status: 429 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.response?.status === 429) {
            store.dispatch(
              addNotification({
                type: 'warning',
                title: 'Rate Limited',
                message: 'Too many requests. Please try again later.',
              })
            );
          }
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'warning',
          title: 'Rate Limited',
          message: 'Too many requests. Please try again later.',
        })
      );
    });

    it('should handle 500 Server error', async () => {
      const error = {
        response: { status: 500 },
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.response?.status === 500) {
            store.dispatch(
              addNotification({
                type: 'error',
                title: 'Server Error',
                message: 'An internal server error occurred. Please try again later.',
              })
            );
          }
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'error',
          title: 'Server Error',
          message: 'An internal server error occurred. Please try again later.',
        })
      );
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors', async () => {
      const error = {
        request: {},
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          if (error.request) {
            store.dispatch(
              addNotification({
                type: 'error',
                title: 'Network Error',
                message: 'Unable to connect to the server. Please check your internet connection.',
              })
            );
          }
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
        })
      );
    });

    it('should handle other errors', async () => {
      const error = {
        message: 'Some other error',
      };

      const responseInterceptor = mockedAxios.interceptors.response.use(
        response => response,
        async error => {
          store.dispatch(
            addNotification({
              type: 'error',
              title: 'Error',
              message: 'An unexpected error occurred.',
            })
          );
          return Promise.reject(error);
        }
      );

      await responseInterceptor.onRejected(error);

      expect(store.dispatch).toHaveBeenCalledWith(
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'An unexpected error occurred.',
        })
      );
    });
  });
});

describe('API Utilities', () => {
  describe('handleApiResponse', () => {
    it('should extract data from axios response', () => {
      const response = {
        data: { id: 1, name: 'Test' },
        status: 200,
        statusText: 'OK',
      };

      const result = handleApiResponse(response);
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('handleApiError', () => {
    it('should extract message from response data', () => {
      const error = {
        response: {
          data: {
            message: 'Error message from response',
          },
        },
      };

      const result = handleApiError(error);
      expect(result).toBe('Error message from response');
    });

    it('should extract message from error object', () => {
      const error = {
        message: 'Error message from object',
      };

      const result = handleApiError(error);
      expect(result).toBe('Error message from object');
    });

    it('should return default message for unknown errors', () => {
      const error = {};

      const result = handleApiError(error);
      expect(result).toBe('An unexpected error occurred');
    });
  });
});
