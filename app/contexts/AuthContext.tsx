// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api'; // từ FE-01
import type { LoginRequest, LoginResponse } from '@/app/types/api.types';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: unknown) => Promise<void>; // tùy backend có endpoint register hay không
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setToken(storedToken);
      // Optional: fetch profile để lấy thông tin user đầy đủ hơn
      // authApi.getProfile().then(res => setUser(res.user)).catch(() => logout());
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);

      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      setToken(response.accessToken);
      setUser(response.user || null);

      router.push('/dashboard');
      router.refresh(); // giúp refresh server components nếu cần
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const register = async (_data: unknown) => {
    // Implement nếu backend có endpoint /register
    // await authApi.register(_data);
    void _data; // tránh lỗi unused
    // Sau đó có thể tự động login hoặc redirect
    throw new Error('Chưa implement chức năng đăng ký');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};