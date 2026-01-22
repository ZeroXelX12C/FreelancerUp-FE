'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProjectResponse } from '@/types/api';
import {
  DollarSign,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';

interface ProjectCardProps {
  project: ProjectResponse;
}

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const typeColors: Record<string, string> = {
  FIXED_PRICE: 'bg-purple-100 text-purple-800',
  HOURLY: 'bg-orange-100 text-orange-800',
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="line-clamp-2 text-xl">
            <Link
              href={`/projects/${project.id}`}
              className="hover:text-primary transition-colors"
            >
              {project.title}
            </Link>
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={statusColors[project.status] || 'bg-gray-100'}>
              {project.status}
            </Badge>
            <Badge className={typeColors[project.type] || 'bg-gray-100'}>
              {project.type === 'FIXED_PRICE' ? 'Fixed Price' : 'Hourly'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {project.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="h-4 w-4" />
            {project.budget
              ? `${project.budget.minAmount.toLocaleString()} - ${project.budget.maxAmount.toLocaleString()} ${project.budget.currency}`
              : 'Negotiable'}
          </div>

          {project.duration && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {project.duration} days
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{project.client.fullName}</span>
          </div>
          <span>
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/projects/${project.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
