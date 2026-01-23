'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freelancerService } from '../services/freelancerService';
import type { FreelancerProfileResponse, UpdateFreelancerProfileRequest } from '@/types/api';
import { toast } from 'sonner';

export function useFreelancerProfile() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['freelancer', 'profile'],
    queryFn: () => freelancerService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateFreelancerProfileRequest) =>
      freelancerService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['freelancer', 'profile'], data);
      queryClient.invalidateQueries({ queryKey: ['freelancer', 'stats'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => freelancerService.deleteProfile(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Profile deleted');
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete profile');
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
