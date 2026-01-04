import { ApiUser } from '../types/api';
import { User } from '../models';

/**
 * Type Conversion Utilities
 * Converts database models to API types by handling Date to string conversions
 */

export const convertUserToApi = (user: User): ApiUser => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    membership_tier: user.membership_tier,
    membership_expires_at: user.membership_expires_at?.toISOString() || undefined,
    email_verified: user.email_verified,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString()
  };
};

// Array conversion helper
export const convertUsersToApi = (users: User[]): ApiUser[] => users.map(convertUserToApi);