'use client';

import { ProjectCard } from './ProjectCard';
import type { ProjectResponse } from '@/types/api';

interface ProjectListProps {
  projects: ProjectResponse[];
  isLoading?: boolean;
}

export function ProjectList({ projects, isLoading }: ProjectListProps) {
  if (isLoading) {
    return <ProjectListGrid isLoading />;
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

interface ProjectListGridProps {
  isLoading?: boolean;
  children?: React.ReactNode;
}

function ProjectListGrid({ isLoading, children }: ProjectListGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>;
}

function ProjectCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="h-6 bg-gray-200 rounded flex-1" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-16 bg-gray-200 rounded" />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>

      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      <div className="h-10 bg-gray-200 rounded" />
    </div>
  );
}
