import { fetcher } from '@/lib/api/fetcher';
import type {
  Freelancer,
  FreelancerProfileResponse,
  FreelancerStatsResponse,
  RegisterFreelancerRequest,
  UpdateFreelancerProfileRequest,
} from '@/types/api';

// Mock mode flag - set to false when backend is ready
const MOCK_MODE = false;

// Mock data generators
const mockFreelancerProfile = (): FreelancerProfileResponse => ({
  id: 'mock-freelancer-id',
  email: 'freelancer@example.com',
  fullName: 'Jane Developer',
  avatar: undefined,
  role: 'FREELANCER',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bio: 'Full-stack developer with 5+ years of experience in web development.',
  hourlyRate: 50,
  availability: 'AVAILABLE',
  totalEarned: 25000,
  completedProjects: 42,
  successRate: 95,
  skills: [
    {
      skillId: '1',
      name: 'React',
      proficiencyLevel: 'EXPERT',
      yearsOfExperience: 5,
    },
    {
      skillId: '2',
      name: 'TypeScript',
      proficiencyLevel: 'ADVANCED',
      yearsOfExperience: 4,
    },
    {
      skillId: '3',
      name: 'Node.js',
      proficiencyLevel: 'ADVANCED',
      yearsOfExperience: 4,
    },
  ],
});

const mockFreelancerStats = (): FreelancerStatsResponse => ({
  freelancerId: 'mock-freelancer-id',
  fullName: 'Jane Developer',
  totalProjects: 50,
  activeProjects: 3,
  completedProjects: 42,
  totalEarned: 25000,
  availableBalance: 5000,
  escrowBalance: 1500,
  averageRating: 4.8,
  totalReviews: 38,
  successRate: 95,
});

export const freelancerService = {
  /**
   * Register as a freelancer (USER -> FREELANCER role upgrade)
   * POST /api/v1/freelancers/register
   */
  async register(data: RegisterFreelancerRequest): Promise<FreelancerProfileResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockFreelancerProfile();
    }

    return fetcher('/freelancers/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current freelancer's profile
   * GET /api/v1/freelancers/profile
   */
  async getProfile(): Promise<FreelancerProfileResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockFreelancerProfile();
    }

    return fetcher('/freelancers/profile');
  },

  /**
   * Update freelancer profile
   * PUT /api/v1/freelancers/profile
   */
  async updateProfile(data: UpdateFreelancerProfileRequest): Promise<FreelancerProfileResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const current = mockFreelancerProfile();
      return { ...current, ...data, skills: data.skills || current.skills };
    }

    return fetcher('/freelancers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get freelancer statistics
   * GET /api/v1/freelancers/stats
   */
  async getStats(): Promise<FreelancerStatsResponse> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockFreelancerStats();
    }

    return fetcher('/freelancers/stats');
  },

  /**
   * Delete freelancer profile
   * DELETE /api/v1/freelancers/profile
   */
  async deleteProfile(): Promise<void> {
    if (MOCK_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }

    return fetcher('/freelancers/profile', {
      method: 'DELETE',
    });
  },

  /**
   * Get freelancer by ID (public view)
   * GET /api/v1/freelancers/{id}
   */
  async getFreelancerById(id: string): Promise<Freelancer> {
    return fetcher(`/freelancers/${id}`);
  },
};
