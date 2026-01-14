// src/types/api.types.ts

/**
 * Format lỗi chung mà backend trả về (tùy backend bạn có thể điều chỉnh)
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: Record<string, string[]>; // validation errors nếu có
  data?: unknown;
}

/**
 * Request & Response cho Auth
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;     // nếu backend có refresh token
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'FREELANCER' | 'CLIENT' | 'ADMIN';
    avatar?: string;
  };
}

/**
 * Profile Freelancer
 */
export interface FreelancerProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  location?: string;
  experienceYears?: number;
  updatedAt: string;
}

/**
 * Dữ liệu gửi lên khi update profile (cho phép partial)
 */
export type UpdateFreelancerProfileRequest = Partial<
  Omit<FreelancerProfile, 'id' | 'email' | 'updatedAt'>
>;