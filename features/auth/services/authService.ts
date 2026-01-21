import { fetcher, setTokens, clearTokens } from '@/lib/api/fetcher';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/api';

export const authService = {
  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetcher('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetcher('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<void> {
    try {
      await fetcher('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return fetcher('/auth/me');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetcher('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    setTokens(response.accessToken, response.refreshToken);
    return response;
  },
};
