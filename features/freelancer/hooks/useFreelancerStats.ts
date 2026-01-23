'use client';

import { useQuery } from '@tanstack/react-query';
import { freelancerService } from '../services/freelancerService';
import type { FreelancerStatsResponse } from '@/types/api';

/**
 * Hook for fetching freelancer statistics
 * Returns data about earnings, projects, ratings, etc.
 */
export function useFreelancerStats() {
  return useQuery<FreelancerStatsResponse>({
    queryKey: ['freelancer', 'stats'],
    queryFn: () => freelancerService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
  });
}
