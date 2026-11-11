import config from '../config';
import fileStorageService from '../services/fileStorageService';
import logger from '../utils/logger';

/**
 * S3 asset cleanup helpers.
 *
 * Uploads create a main object plus three thumbnails per image. Until now nothing
 * deleted the previous object when a user replaced an asset, and deleting an
 * invitation left every uploaded object behind. Both are unbounded growth vectors
 * that bill forever while nobody looks at the files.
 *
 * Safety rules:
 *  - Only keys that resolve into this user's own folder (`<folder>/<userId>/...`) are
 *    ever deleted, so catalog/shared assets and other users' files are never touched.
 *  - Keys are only collected from explicitly tracked custom asset fields and
 *    association URLs, never from arbitrary settings values.
 */

const ASSET_KEY_FOLDERS = [
  'background',
  'background-thumb-small',
  'background-thumb-medium',
  'background-thumb-large',
  'gallery-image',
  'gallery-image-thumb-small',
  'gallery-image-thumb-medium',
  'gallery-image-thumb-large',
  'qr-code',
  'qr-code-thumb-small',
  'qr-code-thumb-medium',
  'qr-code-thumb-large',
];

/**
 * Resolve an S3 object key from a stored asset URL, or null when the URL is not
 * hosted on our bucket (e.g. a catalog image, an external URL, a data: URI).
 */
export function keyFromAssetUrl(url: unknown): string | null {
  if (typeof url !== 'string' || url === '') return null;

  const publicDomain = (config.s3PublicDomain || '').replace(/\/+$/, '');
  const candidates = [
    publicDomain ? `${publicDomain}/` : null,
    `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/`,
    `https://${config.s3BucketName}.s3.amazonaws.com/`,
    `https://s3.${config.awsRegion}.amazonaws.com/${config.s3BucketName}/`,
  ].filter(Boolean) as string[];

  for (const prefix of candidates) {
    if (url.startsWith(prefix)) {
      const key = url.slice(prefix.length).split('?')[0];
      return key || null;
    }
  }
  return null;
}

/**
 * True when the key belongs to this user's own upload folder.
 */
export function isOwnedAssetKey(key: string | null, userId: string): key is string {
  if (!key || !userId) return false;
  const parts = key.split('/');
  if (parts.length < 3) return false;
  return ASSET_KEY_FOLDERS.includes(parts[0]) && parts[1] === userId;
}

interface InvitationLike {
  user_id?: string;
  settings?: Record<string, any> | null;
  gallery?: Array<{ image_url?: string }> | null;
  money_gift_details?: { qr_url?: string } | null;
  wishlist_details?: { items?: Array<{ url?: string }> } | null;
}

/**
 * Collect every S3 key that belongs to this invitation and this user.
 */
export function collectInvitationAssetKeys(invitation: InvitationLike, userId: string): string[] {
  const keys = new Set<string>();
  const settings = (invitation.settings || {}) as Record<string, any>;

  // Values arrive either as a raw S3 key (custom_*_key fields) or as a full URL
  // (gallery rows, QR, wishlist items). Normalise both to a key first.
  const add = (candidate: unknown) => {
    if (typeof candidate !== 'string' || candidate === '') return;
    const key = /^https?:/i.test(candidate) || candidate.startsWith('/') ? keyFromAssetUrl(candidate) : candidate;
    if (isOwnedAssetKey(key, userId)) keys.add(key);
  };

  // Explicitly tracked custom uploads (main object + thumbnails).
  for (const [field, value] of Object.entries(settings)) {
    if (field.startsWith('custom_') && field.endsWith('_key') && typeof value === 'string') {
      add(value);
    }
    if (field.startsWith('custom_') && field.endsWith('_thumb_keys') && Array.isArray(value)) {
      value.forEach(add);
    }
  }

  // Gallery thumbnail keys recorded at upload time (main object comes from the row).
  const galleryThumbKeys = settings.gallery_thumb_keys;
  if (galleryThumbKeys && typeof galleryThumbKeys === 'object' && !Array.isArray(galleryThumbKeys)) {
    Object.values(galleryThumbKeys).forEach(list => {
      if (Array.isArray(list)) list.forEach(add);
    });
  }

  // Association-hosted assets.
  (invitation.gallery || []).forEach(item => add(item?.image_url));
  add(invitation.money_gift_details?.qr_url);
  (invitation.wishlist_details?.items || []).forEach(item => add(item?.url));

  return Array.from(keys);
}

/**
 * Delete keys, logging a compact summary. Never throws.
 */
export async function deleteAssetKeys(keys: string[], context: string): Promise<{ deleted: number; failed: number }> {
  if (keys.length === 0) return { deleted: 0, failed: 0 };

  const result = await fileStorageService.deleteMultipleFiles(keys);
  if (result.success > 0 || result.failed > 0) {
    logger.info(`S3 cleanup (${context}): deleted ${result.success}, failed ${result.failed}`);
  }
  return { deleted: result.success, failed: result.failed };
}

/**
 * Remove objects that a new upload has just replaced (previous main + thumbnails).
 */
export async function cleanupReplacedAssets(previousKeys: unknown[], userId: string, context: string): Promise<void> {
  const keys = previousKeys
    .map(candidate => (typeof candidate === 'string' ? candidate : keyFromAssetUrl(candidate)))
    .filter((key): key is string => isOwnedAssetKey(key, userId));
  if (keys.length === 0) return;
  await deleteAssetKeys(keys, context).catch(error => {
    logger.warn(`S3 cleanup failed (${context}): ${error instanceof Error ? error.message : error}`);
  });
}

/**
 * Remove every object owned by this invitation's user for this invitation.
 */
export async function cleanupInvitationAssets(
  invitation: InvitationLike,
  userId: string
): Promise<{ deleted: number; failed: number }> {
  const keys = collectInvitationAssetKeys(invitation, userId);
  return deleteAssetKeys(keys, `invitation ${(invitation as any).id || 'unknown'} deleted`).catch(error => {
    logger.warn(`S3 cleanup failed for deleted invitation: ${error instanceof Error ? error.message : error}`);
    return { deleted: 0, failed: keys.length };
  });
}
