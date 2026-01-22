'use client';

import { useParams } from 'next/navigation';
import { useProjectDetail } from '@/features/projects/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, Clock, User } from 'lucide-react';

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: project, isLoading, error } = useProjectDetail(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">
              {error instanceof Error ? error.message : 'Project not found'}
            </p>
            <Button onClick={() => window.history.back()}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {project.client.fullName || project.client.companyName}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    Posted {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge className={statusColors[project.status]}>
                {project.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Project Details */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-3">Project Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.description}
            </p>
          </CardContent>
        </Card>

        {/* Project Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    {project.budget
                      ? `${project.budget.minAmount.toLocaleString()} - ${project.budget.maxAmount.toLocaleString()} ${project.budget.currency}`
                      : 'Negotiable'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(project.deadline || project.duration) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    {project.deadline ? (
                      <p className="font-semibold">
                        {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    ) : project.duration ? (
                      <p className="font-semibold">{project.duration}</p>
                    ) : (
                      <p className="font-semibold">Negotiable</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Skills */}
        {project.skills && project.skills.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {project.status === 'OPEN' && (
            <Button size="lg" className="flex-1">
              Place Bid
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
