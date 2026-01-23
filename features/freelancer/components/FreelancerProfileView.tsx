'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FreelancerProfileResponse } from '@/types/api';
import { User, Award, DollarSign } from 'lucide-react';
import { SkillBadge } from './SkillBadge';

interface FreelancerProfileViewProps {
  profile: FreelancerProfileResponse;
  onEdit: () => void;
}

const availabilityConfig = {
  AVAILABLE: { label: 'Available', color: 'bg-green-100 text-green-700' },
  BUSY: { label: 'Busy', color: 'bg-yellow-100 text-yellow-700' },
  OFFLINE: { label: 'Offline', color: 'bg-gray-100 text-gray-700' },
};

export function FreelancerProfileView({ profile, onEdit }: FreelancerProfileViewProps) {
  const availability = availabilityConfig[profile.availability];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button onClick={onEdit} variant="outline">
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                About
              </h4>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Hourly Rate
              </h4>
              <p className="text-lg font-semibold">${profile.hourlyRate}/hr</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Availability
              </h4>
              <Badge className={availability.color}>{availability.label}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <SkillBadge key={skill.skillId} skill={skill} showExperience />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile.completedProjects || 0}</p>
              <p className="text-sm text-muted-foreground">Completed Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-2xl font-bold">
                ${profile.totalEarned?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile.successRate || 0}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
