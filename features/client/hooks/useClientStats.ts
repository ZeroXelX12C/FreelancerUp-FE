'use client';

import { useQuery } from '@tanstack/react-query';
import { clientService } from '../services/clientService';
import type { ClientStatsResponse } from '@/types/api';

/**
 * Hook for fetching client statistics
 * Returns data about total spent, projects posted, active projects, etc.
 */
export function useClientStats() {
  return useQuery<ClientStatsResponse>({
    queryKey: ['client', 'stats'],
    queryFn: () => clientService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
  });
}
