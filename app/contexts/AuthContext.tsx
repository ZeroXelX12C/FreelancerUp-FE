'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { authApi } from '@/lib/api';
import type { LoginRequest, LoginResponse, RegisterRequest, JwtPayload } from '@/app/types/api.types';

// Interface UserInfo
interface UserInfo {
  id: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hàm Logout
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  // Hàm giải mã Token để lấy thông tin User
  const setAuthFromToken = (accessToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(accessToken);

      // Kiểm tra hết hạn (exp tính bằng giây, Date.now tính bằng ms)
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      // Lấy thông tin từ payload token
      setUser({
        id: decoded.sub, // 'sub' là userId
        role: decoded.role,
        fullName: decoded.fullName
      });

      setToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
    } catch (error) {
      console.error("Lỗi giải mã token:", error);
      logout();
    }
  };

  // Check token khi App khởi động
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAuthFromToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (response: LoginResponse) => {
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    // Giải mã token ngay lập tức
    setAuthFromToken(response.accessToken);

    // Điều hướng dựa trên Role trong token
    const decoded = jwtDecode<JwtPayload>(response.accessToken);
    if (decoded.role === 'FREELANCER') {
      router.push('/freelancer/profile');
    } else {
      router.push('/');
    }
    router.refresh();
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      handleAuthSuccess(response);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      handleAuthSuccess(response);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
};