'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../services/projectService';
import type { ProjectSearchRequest, ProjectResponse, ProjectDetailResponse, CreateProjectRequest, UpdateProjectRequest, ProjectStatus } from '@/types/api';
import { toast } from 'sonner';

export function useProjects(params?: ProjectSearchRequest) {
  return useQuery({
    queryKey: ['projects', 'search', params],
    queryFn: () => projectService.search(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useClientProjects() {
  return useQuery({
    queryKey: ['projects', 'client'],
    queryFn: () => projectService.getClientProjects(),
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.create(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', newProject.id], newProject);
      toast.success('Dự án đã được đăng thành công!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Đăng dự án thất bại');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectService.update(id, data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject);
      toast.success('Dự án đã được cập nhật!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cập nhật dự án thất bại');
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      projectService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Trạng thái dự án đã được cập nhật!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cập nhật trạng thái thất bại');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Dự án đã được xóa!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Xóa dự án thất bại');
    },
  });
}

export function useProjectCategories() {
  return useQuery({
    queryKey: ['projects', 'categories'],
    queryFn: () => projectService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories rarely change
  });
}
