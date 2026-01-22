'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useClientProfile } from '@/features/client/hooks/useClientProfile';
import { useClientStats } from '@/features/client/hooks/useClientStats';
import { ClientProfileView } from '@/features/client/components/ClientProfileView';
import { EditClientProfileForm } from '@/features/client/components/EditClientProfileForm';
import { ClientStatsCard } from '@/features/client/components/ClientStatsCard';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

function ClientDashboardContent() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile, isUpdating } = useClientProfile();
  const { data: stats, isLoading: statsLoading } = useClientStats();
  const [isEditing, setIsEditing] = useState(false);

  if (profileLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-muted-foreground">
              Không tìm thấy hồ sơ client. Vui lòng đăng ký.
            </p>
            <Button asChild>
              <Link href="/register/client">Đăng ký ngay</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Client</h1>
          <p className="text-muted-foreground">
            Chào mừng, {user?.fullName || profile.companyName}
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Đăng dự án mới
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        {/* Stats Section */}
        {!statsLoading && stats && <ClientStatsCard stats={stats} />}

        {/* Profile Section */}
        {isEditing ? (
          <EditClientProfileForm
            profile={profile}
            onUpdate={(data) => {
              updateProfile(data);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            isUpdating={isUpdating}
          />
        ) : (
          <ClientProfileView
            profile={profile}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['CLIENT']}>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
