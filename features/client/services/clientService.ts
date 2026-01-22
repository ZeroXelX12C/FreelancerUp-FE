import { fetcher } from '@/lib/api/fetcher';
import type {
  Client,
  ClientProfileResponse,
  ClientStatsResponse,
  RegisterClientRequest,
  UpdateClientProfileRequest,
} from '@/types/api';

export const clientService = {
  /**
   * Register as a client (USER -> CLIENT role upgrade)
   * POST /api/v1/clients/register
   */
  async register(data: RegisterClientRequest): Promise<ClientProfileResponse> {
    return fetcher('/clients/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current client's profile
   * GET /api/v1/clients/profile
   */
  async getProfile(): Promise<ClientProfileResponse> {
    return fetcher('/clients/profile');
  },

  /**
   * Update client profile
   * PUT /api/v1/clients/profile
   */
  async updateProfile(data: UpdateClientProfileRequest): Promise<ClientProfileResponse> {
    return fetcher('/clients/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get client statistics
   * GET /api/v1/clients/stats
   */
  async getStats(): Promise<ClientStatsResponse> {
    return fetcher('/clients/stats');
  },

  /**
   * Delete client profile
   * DELETE /api/v1/clients/profile
   */
  async deleteProfile(): Promise<void> {
    return fetcher('/clients/profile', {
      method: 'DELETE',
    });
  },

  /**
   * Get client by ID (public view)
   * GET /api/v1/clients/{id}
   */
  async getClientById(id: string): Promise<Client> {
    return fetcher(`/clients/${id}`);
  },
};
