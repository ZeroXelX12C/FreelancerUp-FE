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
 * Request Đăng ký (Thêm mới)
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'FREELANCER' | 'CLIENT';
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
  refreshToken?: string;
}

export interface JwtPayload {
  sub: string;       // userId
  role: 'FREELANCER' | 'CLIENT' | 'ADMIN';
  fullName: string;
  iat: number;       // Issued At (Thời điểm tạo)
  exp: number;       // Expiration (Thời điểm hết hạn)
}

/**
 * Profile Freelancer
 */
export interface ExperienceItem { position?: string; company?: string; years?: string }
export interface EducationItem { schoolName?: string; degree?: string; fieldOfStudy?: string }

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
  experience?: ExperienceItem[];
  education?: EducationItem[];
  updatedAt: string;
}

/**
 * Dữ liệu gửi lên khi update profile (cho phép partial)
 */
export type UpdateFreelancerProfileRequest = Partial<
  Omit<FreelancerProfile, 'id' | 'email' | 'updatedAt'>
>;
