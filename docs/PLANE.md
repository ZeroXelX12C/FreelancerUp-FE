# Frontend Implementation Plan - FreelancerUp MVP

## 📋 Overview

**Project**: FreelancerUp - Freelancer Marketplace Platform (Frontend)
**Architecture**: Next.js 16 App Router + React 19 + TypeScript + TanStack Query
**Backend**: Spring Boot REST API (JWT authentication, polyglot persistence)
**Timeline**: 7-8 weeks (aligned with backend completion)
**Status**: 🚧 In Development
**Last Updated**: 2026-01-22

---

## 🎯 Backend Alignment

The backend is **90% complete** with all 8 core modules implemented:

- ✅ Authentication (JWT-based)
- ✅ Client Management (profiles, statistics)
- ✅ Project Management (CRUD, search, filters)
- ✅ Bidding System (submit, accept, reject, withdraw)
- ✅ Payment System (escrow, wallets, transactions)
- ✅ Chat System (conversations, messages)
- ✅ Contract Management (auto-create on bid acceptance)
- ✅ Review System (ratings, comments)
- 🚧 Redis Caching (stubbed, implementation pending)

**Key Backend APIs Available**:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Base URL: `http://localhost:8080/api/v1`

---

## 🎯 Implementation Phases

### Phase 0: Foundation Setup ⭐ Priority 0

**Duration**: 1-2 days | **Week**: 1 | **Status**: ✅ Complete

#### Objective

Set up foundational infrastructure.

#### Completed Tasks

- ✅ Next.js 16 project initialized
- ✅ TypeScript configured with path aliases
- ✅ Tailwind CSS 4 + shadcn/ui setup
- ✅ TanStack Query installed
- ✅ Basic auth pages (login/register UI)
- ✅ Root layout with metadata

#### Remaining Tasks

- ⚠️ Environment variables configuration (`.env.local`)
- ⚠️ TypeScript type definitions
- ⚠️ API client with auth handling
- ⚠️ React Query Provider setup
- ⚠️ Global error handling
- ⚠️ Toast notification system

---

### Phase 1: Authentication Module ⭐⭐⭐ Priority 1

**Duration**: 2-3 days | **Week**: 1 | **Status**: 🚧 In Progress

#### Objective

Build complete authentication flow with JWT tokens.

#### Package Structure

```
features/auth/
├── services/
│   └── authService.ts          # API calls to /auth/*
├── hooks/
│   ├── useAuth.ts              # Auth context & state
│   └── useProtectedRoute.ts    # Protected route wrapper
├── components/
│   ├── LoginForm.tsx           # ✅ Already exists
│   ├── RegisterForm.tsx        # ✅ Already exists
│   └── ProtectedRoute.tsx
└── types/
    └── auth.ts                 # Auth-specific types
```

#### Backend Integration

| Endpoint                | Method | Auth   | Purpose                    |
| ----------------------- | ------ | ------ | -------------------------- |
| `/api/v1/auth/login`    | POST   | None   | Login with email/password  |
| `/api/v1/auth/register` | POST   | None   | Register new user          |
| `/api/v1/auth/logout`   | POST   | Bearer | Logout (invalidate tokens) |
| `/api/v1/auth/refresh`  | POST   | None   | Refresh access token       |
| `/api/v1/auth/me`       | GET    | Bearer | Get current user profile   |

#### Tasks

##### 1.1 Complete API Client Setup

**File**: `src/lib/api/fetcher.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Token management
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Authenticated fetcher with auto-refresh
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

  // Handle 401 - try refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        return fetch(`${API_BASE_URL}${url}`, { ...options, headers });
      }
    }
    // Redirect to login if refresh fails
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refresh_token');
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

##### 1.2 Auth Service

**File**: `features/auth/services/authService.ts`

```typescript
import { fetcher, setTokens, clearTokens } from '@/lib/api/fetcher';

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
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetcher('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetcher('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await fetcher('/auth/logout', { method: 'POST' });
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  },

  async getCurrentUser(): Promise<User> {
    return fetcher('/auth/me');
  },
};
```

##### 1.3 Auth Context & Hook

**File**: `features/auth/hooks/useAuth.ts`

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
    checkAuth();
  }, []);

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

##### 1.4 Update Root Layout

**File**: `app/layout.tsx`

```typescript
import { QueryProvider } from '@/lib/api/query-client';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

#### Deliverables

- ✅ Login page with form validation
- ✅ Register page
- ⚠️ Auth context and hooks (needs completion)
- ⚠️ Protected route wrapper
- ✅ JWT token management (in auth pages)
- ⚠️ Auto token refresh on 401
- ⚠️ Root layout integration

---

### Phase 2: Client Module ⭐⭐ Priority 2

**Duration**: 2-3 days | **Week**: 2

#### Objective

Build client-specific features after user is logged in.

#### Package Structure

```
features/client/
├── services/
│   └── clientService.ts
├── hooks/
│   ├── useClientProfile.ts
│   └── useClientStats.ts
└── components/
    ├── ClientRegistrationForm.tsx
    ├── ClientProfileView.tsx
    ├── ClientStatsCard.tsx
    └── EditClientProfileForm.tsx
```

#### Backend Integration

| Endpoint                   | Method | Auth   | Purpose            |
| -------------------------- | ------ | ------ | ------------------ |
| `/api/v1/clients/register` | POST   | USER   | Register as client |
| `/api/v1/clients/profile`  | GET    | CLIENT | Get client profile |
| `/api/v1/clients/profile`  | PUT    | CLIENT | Update profile     |
| `/api/v1/clients/stats`    | GET    | CLIENT | Get statistics     |
| `/api/v1/clients/profile`  | DELETE | CLIENT | Delete profile     |

#### Key Features

1. **Client Registration Flow** - After account creation, complete company info
2. **Profile Management** - View/edit company details
3. **Statistics Dashboard** - Total spent, projects posted, active projects

#### Client Registration Page

**File**: `app/register/client/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { clientService } from '@/features/client/services/clientService';

export default function ClientRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: RegisterClientRequest) => clientService.register(data),
    onSuccess: () => {
      // Reload to get updated role
      window.location.href = '/dashboard/client';
    },
  });

  // Form implementation...
}
```

---

### Phase 3: Freelancer Module ⭐⭐ Priority 2

**Duration**: 2-3 days | **Week**: 2

#### Objective

Build freelancer-specific features.

#### Package Structure

```
features/freelancer/
├── services/
│   └── freelancerService.ts
├── hooks/
│   ├── useFreelancerProfile.ts
│   └── useFreelancerStats.ts
└── components/
    ├── FreelancerRegistrationForm.tsx
    ├── FreelancerProfileView.tsx
    ├── SkillSelector.tsx
    ├── ExperienceEditor.tsx
    └── EducationEditor.tsx
```

#### Backend Integration

| Endpoint                       | Method | Auth       | Purpose                |
| ------------------------------ | ------ | ---------- | ---------------------- |
| `/api/v1/freelancers/register` | POST   | USER       | Register as freelancer |
| `/api/v1/freelancers/profile`  | GET    | FREELANCER | Get profile            |
| `/api/v1/freelancers/profile`  | PUT    | FREELANCER | Update profile         |
| `/api/v1/freelancers/{id}`     | GET    | None       | View public profile    |

#### Key Features

1. Extended profile (bio, hourly rate, availability)
2. Skills management (name, proficiency, experience)
3. Work experience history
4. Education background
5. Portfolio (optional for MVP)

---

### Phase 4: Project Discovery ⭐⭐⭐ Priority 1

**Duration**: 3-4 days | **Week**: 2-3

#### Objective

Build project listing, search, and detail pages.

#### Package Structure

```
features/projects/
├── services/
│   └── projectService.ts
├── hooks/
│   ├── useProjects.ts
│   ├── useProjectDetail.ts
│   └── useCreateProject.ts
└── components/
    ├── ProjectCard.tsx
    ├── ProjectGrid.tsx
    ├── ProjectList.tsx
    ├── ProjectSearchBar.tsx
    ├── ProjectFilters.tsx
    ├── ProjectDetailPage.tsx
    └── CreateProjectForm.tsx
```

#### Backend Integration

| Endpoint                       | Method | Auth              | Purpose                |
| ------------------------------ | ------ | ----------------- | ---------------------- |
| `/api/v1/projects/search`      | GET    | None              | Search/filter projects |
| `/api/v1/projects/{id}`        | GET    | None              | Get project details    |
| `/api/v1/projects`             | POST   | CLIENT            | Create project         |
| `/api/v1/projects/{id}/status` | PATCH  | CLIENT/FREELANCER | Update status          |
| `/api/v1/projects/{id}`        | DELETE | CLIENT            | Delete project         |

#### Key Features

1. **Project Listing** - Paginated list with filters
2. **Advanced Search** - By keyword, skills, budget, type, status
3. **Project Detail** - Full project info with client details
4. **Create Project** - Form for clients to post projects

#### Project List Page (Server Component)

**File**: `app/projects/page.tsx`

```typescript
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProjectFilters } from '@/features/projects/components/ProjectFilters';

export default function ProjectsPage() {
  // Implementation with TanStack Query
}
```

---

### Phase 5: Bidding System ⭐⭐⭐ Priority 2

**Duration**: 2-3 days | **Week**: 3-4

#### Objective

Build bid submission and management.

#### Package Structure

```
features/bids/
├── services/
│   └── bidService.ts
├── hooks/
│   ├── useBids.ts
│   ├── useMyBids.ts
│   └── useSubmitBid.ts
└── components/
    ├── BidForm.tsx
    ├── BidList.tsx
    ├── BidCard.tsx
    ├── BidStatusBadge.tsx
    └── AcceptRejectButtons.tsx
```

#### Backend Integration

| Endpoint                            | Method | Auth       | Purpose               |
| ----------------------------------- | ------ | ---------- | --------------------- |
| `/api/v1/projects/{projectId}/bids` | POST   | FREELANCER | Submit bid            |
| `/api/v1/projects/{projectId}/bids` | GET    | CLIENT     | List bids for project |
| `/api/v1/bids/{id}/accept`          | PATCH  | CLIENT     | Accept bid            |
| `/api/v1/bids/{id}/reject`          | PATCH  | CLIENT     | Reject bid            |
| `/api/v1/bids/{id}/withdraw`        | DELETE | FREELANCER | Withdraw bid          |

#### Key Features

1. Submit bid with proposal, price, duration
2. View all bids for own projects (client)
3. Accept/reject bids (client)
4. Edit/withdraw pending bids (freelancer)
5. Real-time bid status updates

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
│   ├── useTransactions.ts
│   └── useEscrow.ts
└── components/
    ├── WalletBalanceCard.tsx
    ├── TransactionList.tsx
    ├── FundEscrowForm.tsx
    ├── ReleasePaymentButton.tsx
    └── PaymentStatusBadge.tsx
```

#### Backend Integration

| Endpoint                          | Method | Auth   | Purpose             |
| --------------------------------- | ------ | ------ | ------------------- |
| `/api/v1/wallets`                 | GET    | USER   | Get wallet balance  |
| `/api/v1/wallets/transactions`    | GET    | USER   | Transaction history |
| `/api/v1/payments/escrow/fund`    | POST   | CLIENT | Fund escrow         |
| `/api/v1/payments/escrow/release` | POST   | CLIENT | Release payment     |
| `/api/v1/payments/{projectId}`    | GET    | USER   | Get payment details |

#### Key Features

1. View wallet balance (available, escrow, total earned)
2. Transaction history with pagination
3. Fund escrow for project (client)
4. Release payment to freelancer (client)
5. Escrow status tracking

#### Important Payment Flow

```
1. Client posts project → status: OPEN
2. Freelancer submits bid → status: PENDING
3. Client accepts bid → Contract created, Project status: IN_PROGRESS
4. Client funds escrow → Payment status: ESCROW_HOLD
5. Work completed → Client releases payment → Payment status: RELEASED
6. Money credited to freelancer wallet
```

---

### Phase 7: Contract Management ⭐⭐ Priority 3

**Duration**: 2 days | **Week**: 5

#### Package Structure

```
features/contracts/
├── services/
│   └── contractService.ts
├── hooks/
│   └── useContracts.ts
└── components/
    ├── ContractCard.tsx
    ├── ContractDetail.tsx
    └── ActiveContractsList.tsx
```

#### Backend Integration

| Endpoint                 | Method | Auth              | Purpose              |
| ------------------------ | ------ | ----------------- | -------------------- |
| `/api/v1/contracts/{id}` | GET    | CLIENT/FREELANCER | Get contract details |
| `/api/v1/contracts`      | GET    | CLIENT/FREELANCER | List contracts       |

**Note**: Contracts are auto-created when a bid is accepted (backend handles this).

---

### Phase 8: Chat System ⭐⭐ Priority 2

**Duration**: 3-4 days | **Week**: 5-6

#### Objective

Build messaging interface for project communication.

#### Package Structure

```
features/chat/
├── services/
│   └── chatService.ts
├── hooks/
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── useWebSocket.ts (optional)
└── components/
    ├── ConversationList.tsx
    ├── MessageThread.tsx
    ├── MessageInput.tsx
    ├── MessageBubble.tsx
    └── UnreadBadge.tsx
```

#### Backend Integration

| Endpoint                              | Method | Auth | Purpose            |
| ------------------------------------- | ------ | ---- | ------------------ |
| `/api/v1/conversations`               | GET    | USER | List conversations |
| `/api/v1/conversations/{id}/messages` | GET    | USER | Get messages       |
| `/api/v1/messages`                    | POST   | USER | Send message       |
| `/api/v1/messages/{id}/read`          | PATCH  | USER | Mark as read       |

#### Key Features

1. Conversation list (grouped by project)
2. Real-time or polling message updates
3. Read/unread status
4. Typing indicators (optional)
5. File attachments (optional for MVP)

#### Polling Implementation (MVP)

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
├── hooks/
│   └── useReviews.ts
└── components/
    ├── ReviewCard.tsx
    ├── ReviewForm.tsx
    ├── RatingStars.tsx
    ├── UserReviewsList.tsx
    └── ReviewStats.tsx
```

#### Backend Integration

| Endpoint                              | Method | Auth | Purpose             |
| ------------------------------------- | ------ | ---- | ------------------- |
| `/api/v1/reviews`                     | POST   | USER | Create review       |
| `/api/v1/reviews/project/{projectId}` | GET    | None | Get project reviews |
| `/api/v1/reviews/user/{userId}`       | GET    | None | Get user reviews    |

#### Key Features

1. Submit review (after project completion)
2. View reviews by project
3. View reviews by user
4. Rating breakdown (communication, quality, etc.)

---

### Phase 10: Dashboard & Analytics ⭐⭐ Priority 2

**Duration**: 3-4 days | **Week**: 6-7

#### Objective

Build role-based dashboards.

#### Package Structure

```
app/dashboard/
├── layout.tsx                 # Dashboard layout with navigation
├── client/
│   ├── page.tsx              # Client dashboard overview
│   ├── projects/
│   │   ├── page.tsx          # Client's projects
│   │   └── [id]/page.tsx     # Project detail
│   └── payments/
│       └── page.tsx          # Payment history
└── freelancer/
    ├── page.tsx              # Freelancer dashboard overview
    ├── bids/
    │   └── page.tsx          # Freelancer's bids
    ├── contracts/
    │   └── page.tsx          # Active contracts
    └── earnings/
        └── page.tsx          # Earnings overview
```

#### Dashboard Navigation

**File**: `components/layout/DashboardNav.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  MessageSquare,
  FileText,
  Users,
} from 'lucide-react';

export function DashboardNav() {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  return (
    <aside className="w-64 border-r min-h-screen p-4">
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-accent"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {isClient ? (
          <>
            <Link href="/dashboard/projects">My Projects</Link>
            <Link href="/dashboard/payments">Payments</Link>
          </>
        ) : (
          <>
            <Link href="/dashboard/bids">My Bids</Link>
            <Link href="/dashboard/contracts">Contracts</Link>
            <Link href="/dashboard/earnings">Earnings</Link>
          </>
        )}

        <Link href="/dashboard/messages">Messages</Link>
        <Link href="/dashboard/profile">Profile</Link>
      </nav>
    </aside>
  );
}
```

---

### Phase 11: Performance Optimization ⭐ Priority 1

**Duration**: 2-3 days | **Week**: 7

#### Apply Best Practices

##### 11.1 Server Components by Default

```typescript
// ✅ Server Component - no "use client"
async function ProjectList({ filters }: ProjectListProps) {
  const projects = await fetcher('/projects/search', {
    method: 'POST',
    body: JSON.stringify(filters),
  });

  return <ProjectGrid projects={projects} />;
}
```

##### 11.2 Dynamic Imports for Heavy Components

```typescript
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(
  () => import('@/components/charts/RevenueChart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false,
  }
);
```

##### 11.3 Image Optimization

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

##### 11.4 Code Splitting by Route

Next.js App Router automatically handles this. Ensure large components are in separate files.

---

### Phase 12: Testing & Deployment ⭐⭐ Priority 2

**Duration**: 2-3 days | **Week**: 7-8

#### Tasks

##### 12.1 Testing Setup

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

##### 12.2 Component Testing

```typescript
// Example test
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/features/projects/components/ProjectCard';

describe('ProjectCard', () => {
  it('renders project information', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

##### 12.3 Production Build

```bash
pnpm build
pnpm start
```

##### 12.4 Deployment Checklist

- [ ] Environment variables configured
- [ ] CORS configured on backend
- [ ] API_URL points to production backend
- [ ] Analytics integrated (optional)
- [ ] Error tracking configured (Sentry - optional)
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

Week 6:  ██████████ Phase 6 (Payments)
         ████████ Phase 8 (Chat)
         ██████ Phase 9 (Reviews)

Week 7:  ██████████ Phase 10 (Dashboard)
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

- **Server State**: TanStack Query for API data (caching, refetching)
- **Client State**: React Context for auth, theme
- **Form State**: React Hook Form for complex forms

### API Integration Patterns

```typescript
// ✅ Use TanStack Query for data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => projectService.search(filters),
});

// ✅ Use mutations for writes
const mutation = useMutation({
  mutationFn: (data) => projectService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    toast.success('Project created!');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

### Error Handling Patterns

- Global error boundary (app/error.tsx)
- Page-level error.tsx for route groups
- Toast notifications for user feedback
- Graceful degradation for failed API calls

### TypeScript Best Practices

- Define all API response types
- Use strict mode
- Avoid `any` types
- Leverage utility types (Pick, Omit, Partial)

---

## 🚀 Getting Started

### Quick Start Commands

```bash
# 1. Install dependencies
cd FreelancerUp-FE
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your API URL

# 3. Run development server
pnpm dev

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html
```

### Development Workflow

```bash
# 1. Start backend
cd ../FreelancerUp-BE
./mvnw spring-boot:run

# 2. Start frontend (new terminal)
cd FreelancerUp-FE
pnpm dev

# 3. Test endpoints via Swagger
# http://localhost:8080/swagger-ui/index.html

# 4. Build for production
pnpm build
pnpm start
```

---

**Last Updated**: 2026-01-22
**Version**: MVP v2.0 (Aligned with Backend Status)
**Status**: 🚧 In Development (Phase 0-1)
