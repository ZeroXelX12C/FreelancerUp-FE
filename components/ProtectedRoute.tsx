// src/components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      const redirectPath = window.location.pathname;
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}