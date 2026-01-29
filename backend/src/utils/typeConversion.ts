import { ApiUser } from '../types/api';
import { User, Invitation } from '../models';

/**
 * Type Conversion Utilities
 * Converts database models to API types by handling Date to string conversions and association transformations
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

/**
 * Converts Invitation model to API response format
 * Handles gallery conversion from objects to string array (URLs)
 */
export const convertInvitationToApi = (invitation: Invitation): any => {
  const json = invitation.toJSON ? invitation.toJSON() : invitation;

  // Handle gallery: Convert from objects to array of string URLs if needed
  if (json.gallery && Array.isArray(json.gallery)) {
    json.gallery = json.gallery.map((item: any) => {
      if (typeof item === 'string') return item;
      return item.image_url || item.url || item;
    });
  }

  // Handle other associations that might need property renaming or cleaning
  if (json.guestWishes) {
    json.wishes = json.guestWishes;
    delete json.guestWishes;
  }

  if (json.contacts) {
    // Ensure contacts are present
  }

  return json;
};

// Array conversion helper
export const convertUsersToApi = (users: User[]): ApiUser[] => users.map(convertUserToApi);
export const convertInvitationsToApi = (invitations: Invitation[]): any[] => invitations.map(convertInvitationToApi);