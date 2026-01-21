# Frontend Implementation Plan - FreelancerUp MVP

## 📋 Overview

**Project**: FreelancerUp - Freelancer Marketplace Platform (Frontend)
**Architecture**: Next.js 16 App Router + React 19 + TypeScript
**Backend**: Spring Boot REST API (JWT authentication)
**Timeline**: 6-7 weeks (aligned with Backend completion)
**Status**: 🚧 Ready to Start
**Last Updated**: 2026-01-21

---

## 🎯 Implementation Phases

### Phase 0: Foundation Setup ⭐ Priority 0
**Duration**: 1-2 days | **Week**: 1

#### Objective
Set up the foundational infrastructure for the frontend application.

#### Tasks

##### 0.1 Environment Configuration
**File**: `.env.local`

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WebSocket URL (for chat - optional for MVP)
NEXT_PUBLIC_WS_URL=ws://localhost:8081/ws

# Feature flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_PAYMENTS=true
```

##### 0.2 TypeScript Type Definitions
**File**: `src/types/api.ts`

```typescript
// API Response wrapper
interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// User types
interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'USER' | 'CLIENT' | 'FREELANCER';
  isActive: boolean;
  createdAt: string;
}

interface Client {
  id: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  totalSpent: number;
  postedProjects: number;
}

interface Freelancer {
  id: string;
  userId: string;
  bio?: string;
  hourlyRate: number;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  totalEarned: number;
  completedProjects: number;
  successRate: number;
  skills: FreelancerSkill[];
}

interface FreelancerSkill {
  skillId: string;
  name: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
}

// Project types
interface Project {
  id: string;
  clientId: string;
  freelancerId?: string;
  title: string;
  description: string;
  requirements?: string;
  skills: string[];
  budget: ProjectBudget;
  duration?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  type: 'FIXED_PRICE' | 'HOURLY';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectBudget {
  minAmount: number;
  maxAmount: number;
  currency: string;
  isNegotiable: boolean;
}

// Bid types
interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  proposal: string;
  price: number;
  estimatedDuration?: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  submittedAt: string;
  respondedAt?: string;
}

// Payment types
interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  totalEarned: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface Payment {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'ESCROW_HOLD' | 'RELEASED' | 'COMPLETED' | 'REFUNDED';
  isEscrow: boolean;
  createdAt: string;
}

// Chat types
interface Message {
  id: string;
  conversationId: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  projectId: string;
  participantIds: string[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isActive: boolean;
}

// Review types
interface Review {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  isVisible: boolean;
  createdAt: string;
}
```

##### 0.3 API Client Setup
**File**: `src/lib/api/fetcher.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

// Get access token from localStorage
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Get refresh token from localStorage
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

// Set tokens
export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// Clear tokens
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Fetcher with auth
export const fetcher = async (url: string, options: RequestInit = {}) => {
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - try refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry original request with new token
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        });
      }
    }
    // Redirect to login if refresh fails
    if (typeof window !== 'undefined') {
      window.location.href = '/(auth)/login';
    }
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Refresh access token
const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  clearTokens();
  return false;
};
```

##### 0.4 React Query / SWR Setup
**File**: `src/lib/api/query-client.tsx`

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create QueryClient with optimized defaults
const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always create a new client
    return makeQueryClient();
  }
  // Browser: create client once and reuse
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

##### 0.5 Global Error Handling
**File**: `app/error.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

##### 0.6 Loading UI
**File**: `app/loading.tsx`

```typescript
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}
```

#### Deliverables
- ✅ Environment variables configured
- ✅ TypeScript types defined
- ✅ API client with auth handling
- ✅ React Query setup
- ✅ Error and loading boundaries

---

### Phase 1: Authentication Module ⭐⭐⭐ Priority 1
**Duration**: 2-3 days | **Week**: 1

#### Objective
Build complete authentication flow with JWT tokens.

#### Package Structure
```
app/(auth)/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
└── layout.tsx

features/auth/
├── hooks/
│   ├── useAuth.ts
│   └── useProtectedRoute.ts
├── services/
│   └── authService.ts
└── components/
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    └── ProtectedRoute.tsx
```

#### Tasks

##### 1.1 Authentication Service
**File**: `features/auth/services/authService.ts`

```typescript
import { fetcher, setTokens, clearTokens } from '@/lib/api/fetcher';
import type { User } from '@/types/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  // Login
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetcher('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  // Register
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetcher('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await fetcher('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
      window.location.href = '/(auth)/login';
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    return fetcher('/auth/me');
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetcher('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    setTokens(response.accessToken, response.refreshToken);
    return response;
  },
};
```

##### 1.2 useAuth Hook
**File**: `features/auth/hooks/useAuth.ts`

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/api';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await authService.register({ email, password, fullName });
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

##### 1.3 Login Page
**File**: `app/(auth)/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Redirect based on role
      // This will be handled after role selection is implemented
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your FreelancerUp account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/(auth)/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

##### 1.4 Protected Route Component
**File**: `features/auth/components/ProtectedRoute.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<'CLIENT' | 'FREELANCER'>;
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/(auth)/login');
        return;
      }

      if (requiredRoles && user && !requiredRoles.includes(user.role as any)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRoles, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role as any)) {
    return null;
  }

  return <>{children}</>;
}
```

#### Deliverables
- ✅ Login page with form validation
- ✅ Register page
- ✅ Auth context and hooks
- ✅ Protected route wrapper
- ✅ JWT token management
- ✅ Auto token refresh on 401

#### API Integration
| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/v1/auth/login` | POST | None |
| `/api/v1/auth/register` | POST | None |
| `/api/v1/auth/logout` | POST | Bearer |
| `/api/v1/auth/refresh` | POST | None |
| `/api/v1/auth/me` | GET | Bearer |

---

### Phase 2: Client Module ⭐⭐ Priority 2
**Duration**: 2-3 days | **Week**: 2

#### Objective
Build client-specific features: registration, profile management, statistics.

#### Package Structure
```
features/client/
├── services/
│   └── clientService.ts
├── hooks/
│   └── useClient.ts
└── components/
    ├── ClientRegistrationForm.tsx
    ├── ClientProfileView.tsx
    ├── ClientStatsCard.tsx
    └── EditClientProfileForm.tsx
```

#### Tasks

##### 2.1 Client Service
**File**: `features/client/services/clientService.ts`

```typescript
import { fetcher } from '@/lib/api/fetcher';
import type { Client, ClientProfileResponse, ClientStatsResponse } from '@/types/api';

interface RegisterClientRequest {
  companyName: string;
  industry?: string;
  companySize?: string;
  paymentMethods?: any[];
}

interface UpdateClientProfileRequest {
  companyName?: string;
  industry?: string;
  companySize?: string;
  paymentMethods?: any[];
}

export const clientService = {
  // Register as client
  async register(data: RegisterClientRequest): Promise<Client> {
    return fetcher('/clients/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get client profile
  async getProfile(): Promise<ClientProfileResponse> {
    return fetcher('/clients/profile');
  },

  // Update client profile
  async updateProfile(data: UpdateClientProfileRequest): Promise<ClientProfileResponse> {
    return fetcher('/clients/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get client statistics
  async getStats(): Promise<ClientStatsResponse> {
    return fetcher('/clients/stats');
  },

  // Delete client profile
  async deleteProfile(): Promise<void> {
    return fetcher('/clients/profile', {
      method: 'DELETE',
    });
  },
};
```

##### 2.2 Client Registration Flow
**File**: `app/(auth)/register/client/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { clientService } from '@/features/client/services/clientService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ClientRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await clientService.register(formData);

      // Update user role will be handled by backend
      // Reload user data
      window.location.href = '/dashboard/client';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Register as Client</h1>
          <p className="text-muted-foreground">
            Tell us about your company to start posting projects
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g. Technology, Finance, Healthcare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Select
              value={formData.companySize}
              onValueChange={(value) => setFormData({ ...formData, companySize: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

#### Deliverables
- ✅ Client registration form
- ✅ Client profile page
- ✅ Client stats dashboard
- ✅ Edit profile functionality

---

### Phase 3: Freelancer Module ⭐⭐ Priority 2
**Duration**: 2-3 days | **Week**: 2

#### Objective
Build freelancer-specific features: profile, skills, experience, education.

#### Package Structure
```
features/freelancer/
├── services/
│   └── freelancerService.ts
├── hooks/
│   └── useFreelancer.ts
└── components/
    ├── FreelancerRegistrationForm.tsx
    ├── FreelancerProfileView.tsx
    ├── SkillSelector.tsx
    ├── ExperienceEditor.tsx
    └── EducationEditor.tsx
```

#### Key Features
1. Extended profile with bio, hourly rate
2. Skills management with proficiency levels
3. Work experience history
4. Education background
5. Portfolio (optional for MVP)

---

### Phase 4: Project Discovery ⭐⭐⭐ Priority 1
**Duration**: 3-4 days | **Week**: 2-3

#### Objective
Build project listing, search, and detail pages with advanced filtering.

#### Package Structure
```
features/projects/
├── services/
│   └── projectService.ts
├── hooks/
│   ├── useProjects.ts
│   └── useProjectDetail.ts
└── components/
    ├── ProjectCard.tsx
    ├── ProjectGrid.tsx
    ├── ProjectList.tsx
    ├── ProjectSearchBar.tsx
    ├── ProjectFilters.tsx
    ├── ProjectDetailPage.tsx
    └── BudgetBadge.tsx
```

#### Tasks

##### 4.1 Project Service
**File**: `features/projects/services/projectService.ts`

```typescript
import { fetcher } from '@/lib/api/fetcher';
import type { Project, PageResponse } from '@/types/api';

interface ProjectSearchRequest {
  keyword?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  type?: 'FIXED_PRICE' | 'HOURLY';
  statuses?: ('OPEN' | 'IN_PROGRESS' | 'COMPLETED')[];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

interface CreateProjectRequest {
  title: string;
  description: string;
  requirements?: string;
  skills: string[];
  budget: {
    minAmount: number;
    maxAmount: number;
    currency: string;
    isNegotiable: boolean;
  };
  duration?: number;
  type: 'FIXED_PRICE' | 'HOURLY';
  deadline?: string;
}

export const projectService = {
  // Search projects
  async search(params: ProjectSearchRequest): Promise<PageResponse<Project>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.set(key, value.toString());
        }
      }
    });

    return fetcher(`/projects/search?${queryParams.toString()}`);
  },

  // Get project detail
  async getDetail(id: string): Promise<Project> {
    return fetcher(`/projects/${id}`);
  },

  // Create project (client only)
  async create(data: CreateProjectRequest): Promise<Project> {
    return fetcher('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update project status
  async updateStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'): Promise<Project> {
    return fetcher(`/projects/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  },

  // Delete project (client only)
  async delete(id: string): Promise<void> {
    return fetcher(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};
```

##### 4.2 Project List Page with Filters
**File**: `app/projects/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/features/projects/services/projectService';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectFilters } from '@/features/projects/components/ProjectFilters';
import { ProjectSearchBar } from '@/features/projects/components/ProjectSearchBar';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    keyword: '',
    skills: [] as string[],
    minBudget: undefined as number | undefined,
    maxBudget: undefined as number | undefined,
    type: undefined as 'FIXED_PRICE' | 'HOURLY' | undefined,
    page: 0,
    size: 20,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.search(filters),
  });

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Find Projects</h1>
          <p className="text-muted-foreground">
            Browse opportunities and submit your proposals
          </p>
        </div>

        {/* Search */}
        <ProjectSearchBar
          value={filters.keyword}
          onChange={(keyword) => setFilters({ ...filters, keyword, page: 0 })}
        />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProjectFilters
              filters={filters}
              onChange={setFilters}
            />
          </aside>

          {/* Project List */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="text-center py-10">Loading projects...</div>
            ) : error ? (
              <div className="text-center py-10 text-destructive">
                Failed to load projects
              </div>
            ) : data?.content.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No projects found matching your criteria
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {data?.content.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 0}
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {filters.page + 1} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={filters.page >= data.totalPages - 1}
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

##### 4.3 Project Card Component
**File**: `features/projects/components/ProjectCard.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Project } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const timeAgo = formatDistanceToNow(new Date(project.createdAt), { addSuffix: true });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/projects/${project.id}`}
            className="font-semibold hover:text-primary line-clamp-2"
          >
            {project.title}
          </Link>
          <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget */}
        <div>
          <span className="text-sm font-medium">
            ${project.budget.minAmount} - ${project.budget.maxAmount}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {project.budget.isNegotiable ? '(Negotiable)' : '(Fixed)'}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {project.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.skills.length - 4} more
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{project.type === 'FIXED_PRICE' ? 'Fixed Price' : 'Hourly'}</span>
          {project.duration && <span>{project.duration} days</span>}
          <span>Posted {timeAgo}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/projects/${project.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

#### Deliverables
- ✅ Project listing with search
- ✅ Advanced filters (budget, skills, type)
- ✅ Project detail page
- ✅ Pagination
- ✅ Responsive design

---

### Phase 5: Bidding System ⭐⭐⭐ Priority 2
**Duration**: 2-3 days | **Week**: 3-4

#### Objective
Build bid submission and management for freelancers.

#### Package Structure
```
features/bids/
├── services/
│   └── bidService.ts
├── hooks/
│   ├── useBids.ts
│   └── useMyBids.ts
└── components/
    ├── BidForm.tsx
    ├── BidList.tsx
    ├── BidCard.tsx
    └── BidStatusBadge.tsx
```

#### Key Features
1. Submit bid on project
2. View bid status
3. Edit/withdraw pending bids
4. View all bids for own projects (client)
5. Accept/reject bids (client)

#### Bid Form Component
**File**: `features/bids/components/BidForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bidService } from '@/features/bids/services/bidService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BidFormProps {
  projectId: string;
  projectBudget: { minAmount: number; maxAmount: number };
  onSuccess?: () => void;
}

export function BidForm({ projectId, projectBudget, onSuccess }: BidFormProps) {
  const queryClient = useQueryClient();
  const [proposal, setProposal] = useState('');
  const [price, setPrice] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  const submitBid = useMutation({
    mutationFn: () => bidService.submit(projectId, {
      proposal,
      price: parseFloat(price),
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      onSuccess?.();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); submitBid.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposal">Proposal *</Label>
            <Textarea
              id="proposal"
              placeholder="Explain why you're the best fit for this project..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={5}
              required
              minLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Your Bid ($) *</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter your bid amount"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={projectBudget.minAmount}
              max={projectBudget.maxAmount}
              required
            />
            <p className="text-xs text-muted-foreground">
              Project budget: ${projectBudget.minAmount} - ${projectBudget.maxAmount}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Estimated Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="e.g. 7"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              min={1}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitBid.isPending}
          >
            {submitBid.isPending ? 'Submitting...' : 'Submit Proposal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

### Phase 6: Wallet & Payments ⭐⭐⭐⭐ Priority 3
**Duration**: 3-4 days | **Week**: 4-5

#### Objective
Build wallet management and payment interface.

#### Package Structure
```
features/payments/
├── services/
│   └── paymentService.ts
├── hooks/
│   ├── useWallet.ts
│   └── useTransactions.ts
└── components/
    ├── WalletBalanceCard.tsx
    ├── TransactionList.tsx
    ├── FundEscrowForm.tsx
    ├── ReleasePaymentButton.tsx
    └── PaymentStatusBadge.tsx
```

#### Key Features
1. View wallet balance
2. Transaction history
3. Fund escrow (client)
4. Release payment (client)
5. View escrow status

---

### Phase 7: Contract Management ⭐⭐ Priority 3
**Duration**: 2 days | **Week**: 5

#### Package Structure
```
features/contracts/
├── services/
│   └── contractService.ts
└── components/
    ├── ContractCard.tsx
    ├── ContractDetail.tsx
    └── ActiveContractsList.tsx
```

---

### Phase 8: Chat System ⭐⭐ Priority 2
**Duration**: 3-4 days | **Week**: 5-6

#### Objective
Build real-time messaging interface (WebSocket or polling).

#### Package Structure
```
features/chat/
├── services/
│   └── chatService.ts
├── hooks/
│   ├── useMessages.ts
│   └── useWebSocket.ts
└── components/
    ├── ConversationList.tsx
    ├── MessageThread.tsx
    ├── MessageInput.tsx
    ├── MessageBubble.tsx
    └── UnreadBadge.tsx
```

#### WebSocket Hook (for real-time)
**File**: `features/chat/hooks/useWebSocket.ts`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';

export function useWebSocket(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const ws = new WebSocket(`${WS_URL}?token=${token}&conversationId=${conversationId}`);

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [conversationId]);

  const sendMessage = (content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }));
    }
  };

  return { messages, connected, sendMessage };
}
```

**Alternative: Polling-based approach**
```typescript
// Fallback for MVP without WebSocket
export function useMessagesPolling(conversationId: string, enabled = true) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId),
    enabled,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
```

---

### Phase 9: Review System ⭐⭐ Priority 2
**Duration**: 2 days | **Week**: 6

#### Package Structure
```
features/reviews/
├── services/
│   └── reviewService.ts
└── components/
    ├── ReviewCard.tsx
    ├── ReviewForm.tsx
    ├── RatingStars.tsx
    ├── UserReviewsList.tsx
    └── ReviewStats.tsx
```

---

### Phase 10: Dashboard & Analytics ⭐⭐ Priority 2
**Duration**: 3-4 days | **Week**: 6-7

#### Objective
Build role-based dashboards for clients and freelancers.

#### Package Structure
```
app/dashboard/
├── client/
│   ├── page.tsx
│   ├── projects/
│   │   └── page.tsx
│   └── payments/
│       └── page.tsx
└── freelancer/
    ├── page.tsx
    ├── bids/
    │   └── page.tsx
    ├── contracts/
    │   └── page.tsx
    └── earnings/
        └── page.tsx
```

#### Dashboard Layout
**File**: `app/dashboard/layout.tsx`

```typescript
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { DashboardNav } from '@/components/layout/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <DashboardNav />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

---

### Phase 11: Performance Optimization ⭐ Priority 1
**Duration**: 2-3 days | **Week**: 7

#### Apply Vercel React Best Practices

##### 11.1 Code Splitting
```typescript
// Dynamic import for heavy components
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(() => import('@/components/charts/RevenueChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});
```

##### 11.2 Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

##### 11.3 Server Components Where Possible
```typescript
// Server component by default (no "use client")
async function DashboardStats() {
  const stats = await fetcher('/clients/stats');

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Total Projects" value={stats.totalProjects} />
      <StatCard label="Active Projects" value={stats.activeProjects} />
      <StatCard label="Total Spent" value={`$${stats.totalSpent}`} />
    </div>
  );
}
```

---

### Phase 12: Testing & Deployment ⭐⭐ Priority 2
**Duration**: 2-3 days | **Week**: 7

#### Tasks

##### 12.1 Testing Setup
```bash
# Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

##### 12.2 Production Build
```bash
# Build for production
pnpm build

# Test production build locally
pnpm start
```

##### 12.3 Deployment Checklist
- [ ] Environment variables configured
- [ ] CORS configured on backend
- [ ] API_URL points to production backend
- [ ] Analytics integrated (optional)
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring enabled

---

## 📊 Timeline Overview

```
Week 1:  ████████████████████ Phase 0-1 (Foundation + Auth)

Week 2:  ██████████ Phase 2 (Client)
         ██████████ Phase 3 (Freelancer)

Week 3:  ████████████████ Phase 4 (Project Discovery)

Week 4:  ██████████ Phase 4 completion
         ████████ Phase 5 (Bidding) - START

Week 5:  ████████████████ Phase 5 (Bidding)
         ██████ Phase 6 (Payments) - START

Week 6:  ████████████████████ Phase 6 (Payments)
         ██████ Phase 8 (Chat)

Week 7:  ████████ Phase 9 (Reviews)
         ██████████ Phase 10 (Dashboard)
         ██████ Phase 11 (Optimization)

Week 8:  ██████████ Phase 12 (Testing + Deployment)
```

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Users can register/login as Client or Freelancer
- ✅ Clients can post and manage projects
- ✅ Freelancers can browse and search projects
- ✅ Freelancers can submit bids
- ✅ Clients can accept/reject bids
- ✅ Users can view wallet and transactions
- ✅ Users can send/receive messages
- ✅ Users can leave reviews
- ✅ Role-based dashboards work correctly

### Non-Functional Requirements
- ✅ Page load time < 2 seconds
- ✅ Time to Interactive < 3 seconds
- ✅ Lighthouse score > 90
- ✅ Responsive on mobile/tablet/desktop
- ✅ Accessible (WCAG AA compliant)
- ✅ SEO optimized

---

## 📝 Important Notes

### State Management Strategy
- **Server State**: React Query (@tanstack/react-query) for API data
- **Client State**: React Context for auth, theme
- **Form State**: React Hook Form for forms

### Styling Conventions
- Use shadcn/ui components as base
- Extend with custom Tailwind classes when needed
- Follow CSS variables for theming
- Use `cn()` utility for conditional classes

### API Integration Patterns
```typescript
// ✅ Use React Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => projectService.search(filters),
});

// ✅ Use mutations for writes
const mutation = useMutation({
  mutationFn: (data) => projectService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

### Error Handling Patterns
```typescript
// Global error boundary
// Page-level error.tsx
// Component-level try-catch
// Toast notifications for user feedback
```

---

**Last Updated**: 2026-01-21
**Version**: MVP v1.0
**Status**: 📝 Ready for Implementation
