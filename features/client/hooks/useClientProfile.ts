'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/clientService';
import type { ClientProfileResponse, UpdateClientProfileRequest } from '@/types/api';
import { toast } from 'sonner';

export function useClientProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['client', 'profile'],
    queryFn: () => clientService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateClientProfileRequest) => clientService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['client', 'profile'], data);
      toast.success('Hồ sơ đã được cập nhật thành công!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cập nhật hồ sơ thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientService.deleteProfile(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Hồ sơ đã được xóa');
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Xóa hồ sơ thất bại');
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteProfile: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    refetch: profileQuery.refetch,
  };
}

export function useClientStats() {
  return useQuery({
    queryKey: ['client', 'stats'],
    queryFn: () => clientService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
