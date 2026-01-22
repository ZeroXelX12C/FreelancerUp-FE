import { fetcher } from '@/lib/api/fetcher';
import type {
  ProjectResponse,
  ProjectDetailResponse,
  ProjectSearchRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectStatus,
} from '@/types/api';

export const projectService = {
  /**
   * Search and filter projects
   * GET /api/v1/projects/search
   */
  async search(params?: ProjectSearchRequest): Promise<ProjectResponse[]> {
    const queryParams = new URLSearchParams();

    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.statuses && params.statuses.length > 0) {
      params.statuses.forEach((status) => queryParams.append('statuses', status));
    }
    if (params?.minBudget) queryParams.append('minBudget', params.minBudget.toString());
    if (params?.maxBudget) queryParams.append('maxBudget', params.maxBudget.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    return fetcher(`/projects/search${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get project details by ID
   * GET /api/v1/projects/{id}
   */
  async getById(id: string): Promise<ProjectDetailResponse> {
    return fetcher(`/projects/${id}`);
  },

  /**
   * Create a new project (CLIENT only)
   * POST /api/v1/projects
   */
  async create(data: CreateProjectRequest): Promise<ProjectDetailResponse> {
    return fetcher('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update project (CLIENT only)
   * PUT /api/v1/projects/{id}
   */
  async update(id: string, data: UpdateProjectRequest): Promise<ProjectDetailResponse> {
    return fetcher(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update project status
   * PATCH /api/v1/projects/{id}/status
   */
  async updateStatus(id: string, status: ProjectStatus): Promise<void> {
    return fetcher(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Delete project (CLIENT only)
   * DELETE /api/v1/projects/{id}
   */
  async delete(id: string): Promise<void> {
    return fetcher(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get projects by current client
   * GET /api/v1/projects/client
   */
  async getClientProjects(): Promise<ProjectResponse[]> {
    return fetcher('/projects/client');
  },

  /**
   * Get project categories
   * GET /api/v1/projects/categories
   */
  async getCategories(): Promise<string[]> {
    return fetcher('/projects/categories');
  },
};
