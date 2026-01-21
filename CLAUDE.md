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
- **Backend API**: Spring Boot at `http://localhost:8081/api/v1`

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
NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1

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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MyComponent } from "@/components/MyComponent";
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
  import { cn } from "@/lib/utils";

  <div className={cn(
    "base-class",
    condition && "conditional-class",
    className  // allow override via prop
  )} />
  ```

**CSS Variables** (defined in `app/globals.css`):
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--border`, `--input`, `--ring`

## API Integration

### Backend Endpoint

Backend API runs on `http://localhost:8081/api/v1`

**API Documentation**: Swagger UI available at `http://localhost:8081/swagger-ui/index.html`

### Fetching Data Patterns

**Server Component** (recommended for most cases):
```tsx
// app/projects/page.tsx
async function getProjects() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
    cache: 'no-store',  // or 'force-cache' for caching
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
"use client";

import { useState, useEffect } from 'react';

export function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);

  return <div>{/* render projects */}</div>;
}
```

### Authentication

The backend uses JWT Bearer tokens. Store tokens in:
- HttpOnly cookies (server-side) for security
- Or localStorage with proper security measures

Example API call with auth:
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Component Organization

**Component structure**:
```
components/
├── ui/              # shadcn/ui base components (don't modify directly)
├── auth/            # Auth-related components
├── project/         # Project-related components
├── layout/          # Layout components (Header, Footer, Sidebar)
└── shared/          # Shared reusable components
```

**Component best practices**:
- Keep components small and focused
- Use TypeScript for all components
- Extract reusable logic into custom hooks
- Use composition over complex props
- Prefer Server Components when possible

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
   - Create `.env.local` with `NEXT_PUBLIC_API_URL`

2. **Creating new pages**:
   - Add `page.tsx` in appropriate `app/` subdirectory
   - Use Server Components by default
   - Add `"use client"` only when needed

3. **Creating new components**:
   - Place in `components/` by feature (e.g., `components/project/`)
   - Use TypeScript with proper types
   - Use `cn()` for conditional classes
   - Import shadcn/ui components from `@/components/ui/`

4. **Adding shadcn/ui components**:
   ```bash
   npx shadcn@latest add [component-name]
   ```
   Components are added to `components/ui/`

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
