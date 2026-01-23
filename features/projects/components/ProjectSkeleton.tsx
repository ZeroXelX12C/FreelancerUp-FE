'use client';

export function ProjectSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>

      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export function ProjectListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectSkeleton key={i} />
      ))}
    </div>
  );
}
