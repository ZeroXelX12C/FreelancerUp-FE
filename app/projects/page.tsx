'use client';

import { useState } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProjectSearchBar } from '@/features/projects/components/ProjectSearchBar';
import { ProjectFilters } from '@/features/projects/components/ProjectFilters';
import { ProjectList } from '@/features/projects/components/ProjectList';
import { EmptyProjects } from '@/features/projects/components/EmptyProjects';
import { ProjectListSkeleton } from '@/features/projects/components/ProjectSkeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { ProjectSearchRequest } from '@/types/api';

export default function ProjectsPage() {
  const [filters, setFilters] = useState<Partial<ProjectSearchRequest>>({
    sortBy: 'createdAt',
    sortDirection: 'DESC',
  });
  const [keyword, setKeyword] = useState('');

  const { data: projects, isLoading, error, refetch } = useProjects(filters);

  const handleSearch = (searchKeyword: string) => {
    setKeyword(searchKeyword);
    setFilters({
      ...filters,
      keyword: searchKeyword || undefined,
    });
  };

  const handleFiltersChange = (newFilters: Partial<ProjectSearchRequest>) => {
    setFilters({
      ...newFilters,
      keyword: keyword || undefined,
    });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setFilters({
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    });
  };

  const hasActiveFilters = Boolean(keyword || Object.keys(filters).some((key) => {
    if (key === 'sortBy' || key === 'sortDirection') return false;
    const value = filters[key as keyof ProjectSearchRequest];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Explore Projects</h1>
            <p className="text-muted-foreground">
              Find the perfect project that matches your skills
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              Post a Project
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <ProjectSearchBar
            onSearch={handleSearch}
            defaultValue={keyword}
            placeholder="Search by project title, description, or skills..."
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProjectFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
          />
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading projects...'
            ) : error ? (
              <span className="text-destructive">
                {error instanceof Error ? error.message : 'Failed to load projects'}
              </span>
            ) : projects && projects.length > 0 ? (
              `Found ${projects.length} project${projects.length !== 1 ? 's' : ''}`
            ) : (
              'No projects found'
            )}
          </p>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <ProjectListSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">
              {error instanceof Error ? error.message : 'Failed to load projects'}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : projects && projects.length > 0 ? (
          <ProjectList projects={projects} />
        ) : (
          <EmptyProjects hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        )}
      </div>
    </div>
  );
}
