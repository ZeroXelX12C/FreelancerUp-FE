'use client';

import { FreelancerRegistrationForm } from '@/features/freelancer/components/FreelancerRegistrationForm';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export default function FreelancerRegisterPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
        <FreelancerRegistrationForm />
      </div>
    </ProtectedRoute>
  );
}
