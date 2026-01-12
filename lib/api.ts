// src/lib/api.ts
import { ApiErrorResponse, FreelancerProfile, LoginRequest, LoginResponse, UpdateFreelancerProfileRequest } from '@/app/types/api.types';
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const BASE_URL = 'http://localhost:8081';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------------------
// Refresh token logic
// --------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(null);
  });
  failedQueue = [];
};

// Request interceptor - tự động gắn token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  // Thành công → chỉ trả về data
  (response) => response.data,

  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Xử lý 401 - token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh → chờ trong hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh token (thay đổi endpoint nếu backend khác)
        const refreshRes = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/api/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('refreshToken')}`,
            },
          }
        );

        const { accessToken } = refreshRes.data;
        localStorage.setItem('accessToken', accessToken);

        // Cập nhật header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        processQueue();
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        // Refresh fail → logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login?sessionExpired=true';

        return Promise.reject(refreshError);
      }
    }

    // Lỗi chung
    const errorData: ApiErrorResponse = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'Đã có lỗi xảy ra. Vui lòng thử lại!',
    };

    return Promise.reject(errorData);
  }
);

// --------------------------
// API functions có type
// --------------------------
export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/api/auth/login', data),
};

export const freelancerApi = {
  getProfile: () => api.get<FreelancerProfile>('/api/freelancers/profile'),

  updateProfile: (data: UpdateFreelancerProfileRequest) =>
    api.put<FreelancerProfile>('/api/freelancers/profile', data),
};

export default api;