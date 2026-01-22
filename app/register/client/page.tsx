'use client';

import { ClientRegistrationForm } from '@/features/client/components/ClientRegistrationForm';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export default function ClientRegisterPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <ClientRegistrationForm />
      </div>
    </ProtectedRoute>
  );
}
