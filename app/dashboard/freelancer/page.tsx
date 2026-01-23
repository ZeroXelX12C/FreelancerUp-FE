'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFreelancerProfile } from '@/features/freelancer/hooks/useFreelancerProfile';
import { useFreelancerStats } from '@/features/freelancer/hooks/useFreelancerStats';
import { FreelancerProfileView } from '@/features/freelancer/components/FreelancerProfileView';
import { EditFreelancerProfileForm } from '@/features/freelancer/components/EditFreelancerProfileForm';
import { FreelancerStatsCard } from '@/features/freelancer/components/FreelancerStatsCard';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';

function FreelancerDashboardContent() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile, isUpdating } =
    useFreelancerProfile();
  const { data: stats, isLoading: statsLoading } = useFreelancerStats();
  const [isEditing, setIsEditing] = useState(false);

  if (profileLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
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
              No freelancer profile found. Please register.
            </p>
            <Button asChild>
              <Link href="/register/freelancer">Register Now</Link>
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
          <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.fullName || profile.fullName}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/projects">
            <Briefcase className="mr-2 h-4 w-4" />
            Browse Projects
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        {/* Stats Section */}
        {!statsLoading && stats && <FreelancerStatsCard stats={stats} />}

        {/* Profile Section */}
        {isEditing ? (
          <EditFreelancerProfileForm
            profile={profile}
            onUpdate={(data) => {
              updateProfile(data);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            isUpdating={isUpdating}
          />
        ) : (
          <FreelancerProfileView
            profile={profile}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
}

export default function FreelancerDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={['FREELANCER']}>
      <FreelancerDashboardContent />
    </ProtectedRoute>
  );
}
