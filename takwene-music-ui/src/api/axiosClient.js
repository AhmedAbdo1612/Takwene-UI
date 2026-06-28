import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://takwenemusic.onrender.com/';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper functions for token storage
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Request Interceptor: Attach the JWT token securely to the production origin
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // Determine if request is targetting our API production origin or local development
      const isRelative = config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://');
      const isProductionOrigin = config.url && config.url.startsWith(API_BASE_URL);
      const isLocalOrigin = config.url && (config.url.startsWith('http://localhost:5023') || config.url.startsWith('http://127.0.0.1:5023'));

      if (isRelative || isProductionOrigin || isLocalOrigin) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variables for managing refresh token calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Unwrap responses & handle token rotation / errors
axiosClient.interceptors.response.use(
  (response) => {
    // Under context.md, responses are wrapped in ApiResponse<T> envelope:
    // { isSuccess: boolean, message: string, data: T }
    const apiResponse = response.data;
    
    // If it's a standard wrapper and isSuccess is false, reject it
    if (apiResponse && Object.prototype.hasOwnProperty.call(apiResponse, 'isSuccess')) {
      if (!apiResponse.isSuccess) {
        return Promise.reject({
          message: apiResponse.message || 'API Error occurred',
          response,
        });
      }
      // Unwrap the custom API response layout globally by extracting the data payload
      return apiResponse.data !== undefined ? apiResponse.data : apiResponse;
    }

    return apiResponse;
  },
  async (error) => {
    const originalRequest = error.config;

    // Standard Problem Details (RFC 7807) error formatting
    let errorDetails = {
      message: error.message || 'An unexpected error occurred',
      status: error.response?.status,
      errors: null,
      type: 'Error',
    };

    if (error.response?.data) {
      const data = error.response.data;
      errorDetails.message = data.title || data.message || errorDetails.message;
      errorDetails.errors = data.errors || null;
      errorDetails.type = data.type || 'Error';
    }

    // Token Rotation: Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();

      if (refreshToken) {
        try {
          // Attempt refresh using /api/auth/refresh on production origin
          const response = await axios.post(`${API_BASE_URL}api/auth/refresh`, {
            accessToken,
            refreshToken,
          });

          // Standard return contains AuthResponseDto
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
          
          setTokens(newAccessToken, newRefreshToken);
          
          processQueue(null, newAccessToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          clearTokens();
          // Dispatch a custom event to notify components/routers to redirect to login
          window.dispatchEvent(new Event('auth:unauthorized'));
          return Promise.reject({
            ...errorDetails,
            message: 'Session expired. Please log in again.',
          });
        }
      } else {
        clearTokens();
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(errorDetails);
  }
);

export default axiosClient;
