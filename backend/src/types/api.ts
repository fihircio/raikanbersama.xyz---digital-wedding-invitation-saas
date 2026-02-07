import { Request } from 'express';
import {
  Invitation,
  RSVP,
  GuestWish,
  ItineraryItem,
  ContactPerson,
  BackgroundImage,
  MembershipTier,
  UserRole,
  Plan
} from './models';

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Filter parameters
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// User types (with password for bcrypt comparison)
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string | null; // Hashed - nullable for OAuth users, optional for general request compatibility
  role: UserRole;
  membership_tier: MembershipTier;
  membership_expires_at?: string;
  phone_number?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// User type for API responses (without password)
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  membership_tier: MembershipTier;
  membership_expires_at?: string;
  phone_number?: string;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// API Request types with pagination and filters
export interface InvitationRequest extends PaginationParams, FilterParams {
  user_id?: string;
  event_type?: string;
  is_published?: boolean;
}

export interface RSVPRequest extends PaginationParams, FilterParams {
  invitation_id?: string;
  is_attending?: boolean;
}

export interface GuestWishRequest extends PaginationParams {
  invitation_id?: string;
}

export interface ItineraryItemRequest {
  invitation_id: string;
  time: string;
  activity: string;
}

export interface ContactPersonRequest {
  invitation_id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface GalleryImageRequest {
  invitation_id: string;
  url: string;
}

export interface MoneyGiftDetailsRequest {
  invitation_id: string;
  enabled: boolean;
  bank_name: string;
  account_no: string;
  account_holder: string;
  qr_url: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: ApiUser;
    token: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Express Request with authenticated user
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      membership_tier: MembershipTier;
      created_at?: string;
      updated_at?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Validation schemas
export interface ValidationSchema {
  [key: string]: {
    type: string;
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean | string;
  };
}