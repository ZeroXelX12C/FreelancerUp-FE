// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'USER' | 'CLIENT' | 'FREELANCER';
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  totalSpent: number;
  postedProjects: number;
}

export interface Freelancer {
  id: string;
  userId: string;
  bio?: string;
  hourlyRate: number;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  totalEarned: number;
  completedProjects: number;
  successRate: number;
  skills: FreelancerSkill[];
}

export interface FreelancerSkill {
  skillId: string;
  name: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience?: number;
}

export interface FreelancerExperience {
  id: string;
  freelancerId: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description?: string;
}

export interface FreelancerEducation {
  id: string;
  freelancerId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  currentlyStudying: boolean;
  gpa?: number;
}

// Project types
export interface Project {
  id: string;
  clientId: string;
  freelancerId?: string;
  title: string;
  description: string;
  requirements?: string;
  skills: string[];
  budget: ProjectBudget;
  duration?: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  type: 'FIXED_PRICE' | 'HOURLY';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudget {
  minAmount: number;
  maxAmount: number;
  currency: string;
  isNegotiable: boolean;
}

// Bid types
export interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  proposal: string;
  price: number;
  estimatedDuration?: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  submittedAt: string;
  respondedAt?: string;
}

// Payment types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  totalEarned: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  amount: number;
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'PENDING' | 'ESCROW_HOLD' | 'RELEASED' | 'COMPLETED' | 'REFUNDED';
  isEscrow: boolean;
  createdAt: string;
}

// Chat types
export interface Message {
  id: string;
  conversationId: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  participantIds: string[];
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isActive: boolean;
}

// Review types
export interface Review {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  isVisible: boolean;
  createdAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Stats types
export interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingBids: number;
}

export interface FreelancerStats {
  totalBids: number;
  acceptedBids: number;
  completedProjects: number;
  totalEarned: number;
  successRate: number;
}
