import config from '../config';
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
    role: user.role,
    membership_tier: user.membership_tier,
    membership_expires_at: user.membership_expires_at?.toISOString() || undefined,
    phone_number: user.phone_number,
    email_verified: user.email_verified,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString()
  };
};

/**
 * Converts Invitation model to API response format
 * Handles gallery conversion from objects to string array (URLs)
 */
const assetUrlFromKey = (key: string): string | null => {
  if (!key) return null;
  const publicDomain = (config.s3PublicDomain || '').replace(/\/+$/, '');
  if (publicDomain) return `${publicDomain}/${key}`;
  if (config.s3BucketName && config.awsRegion) {
    return `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/${key}`;
  }
  return null;
};

export const convertInvitationToApi = (invitation: Invitation): any => {
  const json = invitation.toJSON ? invitation.toJSON() : invitation;

  // Older gallery uploads recorded thumbnail *keys* but not URLs. Derive the URLs
  // so the guest grid can serve a 300px thumbnail instead of the full photo.
  const settings = json.settings as Record<string, any> | undefined;
  if (settings?.gallery_thumb_keys && typeof settings.gallery_thumb_keys === 'object') {
    const urls = { ...(settings.gallery_thumb_urls || {}) };
    for (const [imageUrl, keys] of Object.entries(settings.gallery_thumb_keys)) {
      if (urls[imageUrl]?.medium) continue;
      if (!Array.isArray(keys) || keys.length === 0) continue;
      const built = keys.map(key => assetUrlFromKey(String(key))).filter(Boolean);
      if (built.length === 0) continue;
      urls[imageUrl] = {
        small: built[0] || undefined,
        medium: built[1] || built[0] || undefined,
        large: built[2] || built[1] || undefined
      };
    }
    settings.gallery_thumb_urls = urls;
  }

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