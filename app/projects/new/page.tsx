'use client';

import { CreateProjectForm } from '@/features/projects/components/CreateProjectForm';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';

export default function NewProjectPage() {
  return (
    <ProtectedRoute requiredRoles={['CLIENT']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <CreateProjectForm />
      </div>
    </ProtectedRoute>
  );
}
