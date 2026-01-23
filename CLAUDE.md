# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FreelancerUp-FE** is the frontend application for the FreelancerUp freelancer marketplace platform. Built with Next.js 16, React 19, and TypeScript.

### Technology Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Package Manager**: pnpm (preferred, npm also works)
- **Backend API**: Spring Boot at `http://localhost:8080/api/v1`
- **State Management**: TanStack Query (React Query) for server state

### Project Structure

```
FreelancerUp-FE/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/         # Login page
│   │   └── register/      # Register page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   └── utils.ts          # cn() utility for Tailwind
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
├── next.config.ts        # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Common Development Commands

```bash
# Install dependencies
pnpm install
# or
npm install

# Run development server (http://localhost:3000)
pnpm dev
npm run dev

# Build for production
pnpm build
npm run build

# Run production build
pnpm start
npm start

# Lint code
pnpm lint
npm run lint
```

## Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Other environment variables (add as needed)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to git. Use `NEXT_PUBLIC_` prefix for variables that need to be exposed to the browser.

## Architecture & Patterns

### App Router (Not Pages Router)

This project uses **Next.js 16 App Router** with:

- File-based routing in `app/` directory
- React Server Components (RSC) by default
- Route groups with parentheses: `(auth)` for grouping without URL segment

**Key conventions**:

- Use `page.tsx` for route pages
- Use `layout.tsx` for shared layouts
- Use `loading.tsx` for loading states
- Use `error.tsx` for error boundaries
- Use `template.tsx` for templates that remount on navigation

### Server Components vs Client Components

**Default to Server Components** (no `"use client"` directive):

- Better performance (no client-side JavaScript)
- Data fetching on the server
- Secure (server code never sent to client)

**Use Client Components when you need**:

- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser APIs (`window`, `document`, etc.)

Add `"use client";` at the top of the file for client components.

### Path Aliases

From `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

Use the `@/` prefix for imports:

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MyComponent } from '@/components/MyComponent';
```

### shadcn/ui Configuration

From `components.json`:

- Style: "new-york"
- Base color: neutral
- CSS variables: enabled
- Icon library: lucide-react

**Path aliases** (auto-configured):

- `@/components` → `components/`
- `@/lib/utils` → `lib/utils`
- `@/components/ui` → `components/ui/`
- `@/hooks` → `hooks/`

**Adding new shadcn/ui components**:

```bash
npx shadcn@latest add [component-name]
# Example:
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Tailwind CSS

**Utilities**:

- Use `cn()` function from `lib/utils.ts` for conditional classes:

  ```tsx
  import { cn } from '@/lib/utils';

  <div
    className={cn(
      'base-class',
      condition && 'conditional-class',
      className // allow override via prop
    )}
  />;
  ```

**CSS Variables** (defined in `app/globals.css`):

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--border`, `--input`, `--ring`

## State Management

### TanStack Query (React Query)

The project uses `@tanstack/react-query` for server state management:

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });
}

// Mutations
function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

## API Integration

### Backend Endpoint

Backend API runs on `http://localhost:8080/api/v1`

**API Documentation**: Swagger UI available at `http://localhost:8080/swagger-ui/index.html`

### Fetching Data Patterns

**Server Component** (recommended for most cases):

```tsx
// app/projects/page.tsx
async function getProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
    cache: 'no-store', // or 'force-cache' for caching
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectList projects={projects} />;
}
```

**Client Component** (for interactive features):

```tsx
'use client';

import { useState, useEffect } from 'react';

export function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return <div>{/* render projects */}</div>;
}
```

### Authentication

The backend uses JWT Bearer tokens. Store tokens in:

- HttpOnly cookies (server-side) for security (recommended)
- Or localStorage with proper security measures

Example API call with auth:

```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### API Layer Architecture (Recommended)

**Repository Pattern** for better separation:

```typescript
// lib/repositories/project.repository.ts
class ProjectRepository {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL;

  async getAll(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams(filters as any);
    const res = await fetch(`${this.baseUrl}/projects?${params}`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  }

  async getById(id: string): Promise<Project> {
    const res = await fetch(`${this.baseUrl}/projects/${id}`);
    if (!res.ok) throw new Error('Project not found');
    return res.json();
  }

  async create(data: CreateProjectDTO): Promise<Project> {
    const res = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  }
}

export const projectRepository = new ProjectRepository();
```

**Usage with TanStack Query**:

```typescript
// hooks/use-projects.ts
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectRepository.getAll(filters),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDTO) => projectRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

### Error Handling Pattern

**Consistent error handling with Toast**:

```typescript
// lib/api/fetch-handler.ts
export async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  } catch (error) {
    // Log to error tracking service
    console.error('API Error:', error);
    throw error;
  }
}
```

## Component Organization

**Recommended structure** (feature-based):

```
components/
├── ui/              # shadcn/ui base components (don't modify directly)
├── auth/            # Auth-related components
│   ├── login-form.tsx
│   └── register-form.tsx
├── project/         # Project-related components
│   ├── project-card.tsx
│   ├── project-list.tsx
│   └── project-filters.tsx
├── bid/             # Bidding components
├── chat/            # Messaging components
├── layout/          # Layout components (Header, Footer, Sidebar)
│   ├── header.tsx
│   ├── footer.tsx
│   └── sidebar.tsx
└── shared/          # Shared reusable components
    ├── loading-spinner.tsx
    ├── error-boundary.tsx
    └── empty-state.tsx
```

**Component best practices**:

- Keep components small and focused
- Use TypeScript for all components
- Extract reusable logic into custom hooks
- Use composition over complex props
- Prefer Server Components when possible
- Separate client components into `client/` subdirs within feature folders
- Use View Models (MVVM pattern) for complex component logic

## TypeScript Configuration

**Key settings from `tsconfig.json`**:

- Target: ES2017
- Module: esnext
- Strict mode: enabled
- JSX: react-jsx (new JSX transform)
- Path aliases: `@/*` → `./`

**Type checking**:

```bash
pnpm build  # includes type checking
npx tsc --noEmit  # type check only
```

## Linting

Uses ESLint with Next.js config:

```bash
pnpm lint
npm run lint
```

Configured in `eslint.config.mjs` with:

- `eslint-config-next/core-web-vitals` for general rules
- `eslint-config-next/typescript` for TypeScript rules

## Type Definitions

**Organize types by domain**:

```typescript
// types/project.ts
export interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  status: ProjectStatus;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ProjectFilters {
  status?: ProjectStatus;
  minBudget?: number;
  maxBudget?: number;
  search?: string;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  budget: number;
  deadline: string;
  skills: string[];
}
```

**Type organization**:

```
types/
├── index.ts           # Export all types
├── project.ts         # Project types
├── user.ts            # User types
├── bid.ts             # Bid types
├── contract.ts        # Contract types
└── api.ts             # API response types
```

## Testing (Recommended Setup)

**Vitest** for unit testing (recommended):

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

**Example test structure**:

```typescript
// __tests__/components/project-card.test.tsx
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/project/project-card';

describe('ProjectCard', () => {
  const mockProject = {
    _id: '1',
    title: 'Test Project',
    description: 'Test description',
    budget: 1000,
    status: 'OPEN',
  };

  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('shows correct status badge', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
```

**Testing commands** (when configured):

```bash
pnpm test              # Run all tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Run tests with coverage
```

## Current Implementation Status

**Completed**:

- ✅ Project scaffolded with Next.js 16 + React 19
- ✅ TypeScript configured with path aliases
- ✅ Tailwind CSS 4 + shadcn/ui setup
- ✅ Basic auth pages (login/register UI)

**Pending**:

- ❌ API integration layer
- ❌ Protected routes with authentication
- ❌ Dashboard pages (client, freelancer)
- ❌ Project listing and detail pages
- ❌ Chat interface
- ❌ Payment dashboard
- ❌ Profile management pages

## Development Workflow

1. **Before starting**:
   - Ensure backend is running: `cd ../FreelancerUp-BE && ./mvnw spring-boot:run`
   - Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`
   - Install dependencies: `pnpm install`

2. **Creating new pages**:
   - Add `page.tsx` in appropriate `app/` subdirectory
   - Use Server Components by default
   - Add `"use client"` only when needed (interactivity, hooks, browser APIs)
   - Add `layout.tsx` for shared layouts
   - Add `loading.tsx` for loading states
   - Add `error.tsx` for error boundaries

3. **Creating new features** (recommended structure):

   ```
   components/project/
   ├── project-card.tsx          # Server component
   ├── project-card.client.tsx   # Client component (if needed)
   └── types.ts                  # Feature-specific types

   hooks/
   └── use-project.ts            # Custom hook with TanStack Query

   lib/repositories/
   └── project.repository.ts     # API calls
   ```

4. **Creating new components**:
   - Place in `components/` by feature (e.g., `components/project/`)
   - Use TypeScript with proper types
   - Use `cn()` for conditional classes
   - Import shadcn/ui components from `@/components/ui/`
   - Separate server and client components when needed

5. **Adding shadcn/ui components**:

   ```bash
   npx shadcn@latest add [component-name]
   ```

   Components are added to `components/ui/` - don't modify directly, extend them

6. **Type safety workflow**:
   - Define types in `types/` folder by domain
   - Export all types from `types/index.ts`
   - Use strict TypeScript settings
   - Run `npx tsc --noEmit` to check types

7. **Working with TanStack Query**:
   - Create custom hooks in `hooks/` for data fetching
   - Use repositories for API calls
   - Invalidate queries after mutations
   - Handle errors gracefully with toast notifications

8. **Code organization principles**:
   - **Feature-based**: Group by business feature, not by technical role
   - **Separation of concerns**: UI, logic, data access in separate files
   - **Single responsibility**: Each file/component does one thing well
   - **DRY**: Extract reusable logic into hooks and utilities
   - **Type safety**: Leverage TypeScript for compile-time safety

## Important Files

- `app/layout.tsx` - Root layout with fonts and metadata
- `app/globals.css` - Global styles and Tailwind directives
- `lib/utils.ts` - `cn()` utility for class merging
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript config with path aliases
- `next.config.ts` - Next.js configuration
- `package.json` - Dependencies and scripts

## Backend Reference

For backend API details, see `../FreelancerUp-BE/CLAUDE.md` and `../FreelancerUp-BE/docs/API_DOCUMENTATION.md`.

**Key backend endpoints** (refer to Swagger UI for complete list):

- Authentication: `/api/v1/auth/*`
- Clients: `/api/v1/clients/*`
- Freelancers: `/api/v1/freelancers/*`
- Projects: `/api/v1/projects/*`
- Bids: `/api/v1/bids/*`
- Payments: `/api/v1/payments/*`

## Common Gotchas

1. **Server vs Client Components**: Default to Server Components - only add `"use client"` when necessary
2. **Path aliases**: Use `@/` prefix for imports, not relative paths like `../`
3. **shadcn/ui components**: Don't modify components in `components/ui/` directly - extend them instead
4. **Environment variables**: Must use `NEXT_PUBLIC_` prefix for variables exposed to browser
5. **fetch in Server Components**: Can use `fetch` directly, no need for `useEffect`
6. **TanStack Query**: Only needed in Client Components for interactive features
7. **Tailwind classes**: Use `cn()` utility for conditional class merging
8. **TypeScript**: Always type component props and API responses
