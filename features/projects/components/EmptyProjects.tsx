'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileSearch, Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyProjectsProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyProjects({ hasFilters = false, onClearFilters }: EmptyProjectsProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>

        {hasFilters ? (
          <>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try adjusting your filters or search terms to find more projects.
            </p>
            <Button onClick={onClearFilters} variant="outline">
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no projects available at the moment. Check back later or post your own
              project to get started!
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Project
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
