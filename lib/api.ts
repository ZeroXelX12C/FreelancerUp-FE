import axios from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  FreelancerProfile,
  UpdateFreelancerProfileRequest
} from '@/app/types/api.types';

// 1. Cấu hình Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Gắn Token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 3. Response Interceptor: Xử lý Token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 (Unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Xóa token và reload trang (hoặc redirect về login)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Force redirect
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/register', payload);
    return data;
  },
  
  refreshToken: async (token: string) => {
    const { data } = await api.post('/auth/refresh', { refreshToken: token });
    return data;
  }
};

export const freelancerApi = {
    getProfile: async (): Promise<FreelancerProfile> => {
        const { data } = await api.get<FreelancerProfile>('/freelancers/profile');
        return data;
    },
    updateProfile: async (payload: UpdateFreelancerProfileRequest): Promise<FreelancerProfile> => {
        const { data } = await api.put<FreelancerProfile>('/freelancers/profile', payload);
        return data;
    }
}

export default api;