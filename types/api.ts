// ============================================================================
// API Types - FreelancerUp Frontend
// ============================================================================

// ----------------------------------------------------------------------------
// Common Types
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ----------------------------------------------------------------------------
// User & Authentication Types
// ----------------------------------------------------------------------------

export type UserRole = 'USER' | 'CLIENT' | 'FREELANCER';

export interface User {
  id: string; // UUID
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// ----------------------------------------------------------------------------
// Client Types
// ----------------------------------------------------------------------------

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface PaymentMethodDTO {
  type: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  last4?: string;
  expiryDate?: string;
}

export interface Client {
  id: string; // UUID
  companyName: string;
  industry?: string;
  companySize?: CompanySize;
  paymentMethods?: PaymentMethodDTO[];
  totalSpent: number;
  postedProjects: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfileResponse extends User {
  companyName: string;
  industry?: string;
  companySize?: CompanySize;
  paymentMethods?: PaymentMethodDTO[];
  totalSpent: number;
  postedProjects: number;
}

export interface ClientStatsResponse {
  clientId: string;
  companyName: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingEscrow: number;
  averageRating: number;
  totalReviews: number;
}

export interface RegisterClientRequest {
  companyName: string;
  industry?: string;
  companySize?: CompanySize;
  paymentMethods?: PaymentMethodDTO[];
}

export interface UpdateClientProfileRequest {
  companyName?: string;
  industry?: string;
  companySize?: CompanySize;
  paymentMethods?: PaymentMethodDTO[];
}

// ----------------------------------------------------------------------------
// Freelancer Types
// ----------------------------------------------------------------------------

export type Availability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Freelancer {
  id: string; // MongoDB ObjectId
  userId: string; // UUID reference to User
  bio?: string;
  hourlyRate: number;
  availability: Availability;
  totalEarned: number;
  completedProjects: number;
  successRate: number;
  skills: FreelancerSkill[];
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfileResponse extends User {
  bio?: string;
  hourlyRate: number;
  availability: Availability;
  totalEarned: number;
  completedProjects: number;
  successRate: number;
  skills: FreelancerSkill[];
}

export interface FreelancerSkill {
  skillId: string;
  name: string;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience?: number;
}

export interface RegisterFreelancerRequest {
  bio?: string;
  hourlyRate: number;
  availability?: Availability;
  skills: FreelancerSkill[];
}

export interface FreelancerStatsResponse {
  freelancerId: string;
  fullName: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarned: number;
  availableBalance: number;
  escrowBalance: number;
  averageRating: number;
  totalReviews: number;
  successRate: number;
}

export interface UpdateFreelancerProfileRequest {
  bio?: string;
  hourlyRate?: number;
  availability?: Availability;
  skills?: FreelancerSkill[];
}

// ----------------------------------------------------------------------------
// Project Types
// ----------------------------------------------------------------------------

export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProjectType = 'FIXED_PRICE' | 'HOURLY';

export interface ProjectBudget {
  minAmount: number;
  maxAmount: number;
  currency: string;
  isNegotiable: boolean;
}

export interface Project {
  id: string; // MongoDB ObjectId
  clientId: string; // UUID reference to User
  freelancerId?: string; // UUID reference to User (nullable)
  title: string;
  description: string;
  requirements?: string;
  skills: string[];
  budget: ProjectBudget;
  duration?: number; // in days
  status: ProjectStatus;
  type: ProjectType;
  deadline?: string; // ISO datetime
  startedAt?: string;
  completedAt?: string;
  contractId?: string; // UUID reference to Contract
  createdAt: string;
  updatedAt: string;
}

export interface ProjectResponse extends Project {
  client: {
    id: string;
    fullName: string;
    avatar?: string;
    companyName: string;
  };
  freelancer?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface ProjectDetailResponse extends ProjectResponse {
  bidCount?: number;
  clientRating?: number;
  canBid: boolean;
}

export interface ProjectSearchRequest {
  keyword?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  type?: ProjectType;
  statuses?: ProjectStatus[];
  sortBy?: 'createdAt' | 'deadline' | 'budget';
  sortDirection?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  requirements?: string;
  skills: string[];
  budget: ProjectBudget;
  duration?: number;
  type: ProjectType;
  deadline?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  budget?: ProjectBudget;
  duration?: number;
  deadline?: string;
}

// ----------------------------------------------------------------------------
// Bid Types
// ----------------------------------------------------------------------------

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Bid {
  id: string; // MongoDB ObjectId
  projectId: string; // MongoDB ObjectId reference
  freelancerId: string; // UUID reference to User
  proposal: string;
  price: number;
  estimatedDuration?: number; // in days
  status: BidStatus;
  submittedAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BidResponse extends Bid {
  freelancer: {
    id: string;
    fullName: string;
    avatar?: string;
    hourlyRate?: number;
    successRate?: number;
    completedProjects?: number;
  };
}

export interface SubmitBidRequest {
  proposal: string;
  price: number;
  estimatedDuration?: number;
}

// ----------------------------------------------------------------------------
// Wallet & Payment Types
// ----------------------------------------------------------------------------

export interface Wallet {
  id: string; // UUID
  userId: string; // UUID reference to User
  balance: number; // Available balance
  escrowBalance: number; // Held in escrow
  totalEarned: number; // Lifetime earnings
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
  id: string; // UUID
  walletId: string; // UUID reference to Wallet
  userId: string; // UUID reference to User
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description?: string;
  referenceId?: string; // e.g., projectId
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  completedAt?: string;
}

export type PaymentType = 'FINAL' | 'REFUND';
export type PaymentStatus = 'PENDING' | 'ESCROW_HOLD' | 'RELEASED' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
export type PaymentMethodType = 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER' | 'WALLET';

export interface Payment {
  id: string; // UUID
  projectId: string; // MongoDB ObjectId
  fromUserId: string; // UUID (Client)
  toUserId: string; // UUID (Freelancer)
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  fee: number;
  netAmount: number;
  method: PaymentMethodType;
  isEscrow: boolean;
  escrowFundedAt?: string;
  escrowReleasedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface FundEscrowRequest {
  projectId: string;
  amount: number;
  method: PaymentMethodType;
}

export interface ReleasePaymentRequest {
  paymentId: string;
}

// ----------------------------------------------------------------------------
// Contract Types
// ----------------------------------------------------------------------------

export type ContractStatus = 'ACTIVE' | 'COMPLETED';

export interface Contract {
  id: string; // UUID
  projectId: string; // MongoDB ObjectId
  clientId: string; // UUID
  freelancerId: string; // UUID
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContractResponse extends Contract {
  project: {
    id: string;
    title: string;
    budget: ProjectBudget;
  };
  client: {
    id: string;
    fullName: string;
    companyName: string;
  };
  freelancer: {
    id: string;
    fullName: string;
  };
}

// ----------------------------------------------------------------------------
// Chat Types
// ----------------------------------------------------------------------------

export interface Conversation {
  id: string; // UUID
  projectId: string; // MongoDB ObjectId
  participantIds: string[]; // Array of UUIDs
  lastMessageAt?: string;
  lastMessagePreview?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string; // MongoDB ObjectId
  conversationId: string; // UUID reference to Conversation
  projectId: string; // MongoDB ObjectId
  fromUserId: string; // UUID
  toUserId: string; // UUID
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface MessageResponse extends Message {
  fromUser: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

// ----------------------------------------------------------------------------
// Review Types
// ----------------------------------------------------------------------------

export interface Review {
  id: string; // UUID
  projectId: string; // MongoDB ObjectId
  fromUserId: string; // UUID
  toUserId: string; // UUID
  rating: number; // 1-5
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  timelineRating?: number;
  professionalismRating?: number;
  responsivenessRating?: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse extends Review {
  fromUser: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  toUser: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface CreateReviewRequest {
  projectId: string;
  toUserId: string;
  rating: number;
  comment?: string;
  communicationRating?: number;
  qualityRating?: number;
  timelineRating?: number;
  professionalismRating?: number;
  responsivenessRating?: number;
}

// ----------------------------------------------------------------------------
// Authentication Types
// ----------------------------------------------------------------------------

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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
