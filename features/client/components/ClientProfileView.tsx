'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ClientProfileResponse } from '@/types/api';
import { Building2, Calendar, Users } from 'lucide-react';

interface ClientProfileViewProps {
  profile: ClientProfileResponse;
  onEdit: () => void;
}

export function ClientProfileView({ profile, onEdit }: ClientProfileViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.companyName}</CardTitle>
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
          {profile.industry && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Industry
              </h4>
              <Badge variant="secondary">{profile.industry}</Badge>
            </div>
          )}

          {profile.companySize && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Company Size
              </h4>
              <Badge variant="secondary">{profile.companySize}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.postedProjects || 0}</p>
              <p className="text-sm text-muted-foreground">Projects Posted</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${profile.totalSpent?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center flex flex-col items-center">
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Client Account</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
