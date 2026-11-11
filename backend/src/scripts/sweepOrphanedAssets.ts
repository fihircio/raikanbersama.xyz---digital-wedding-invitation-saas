/**
 * One-time sweep for orphaned S3 assets.
 *
 * Storage bills per GB-month for every object that exists, whether or not any
 * invitation still points at it. Before upload keys were tracked, replacing an
 * image left the previous object (and its three thumbnails) behind forever.
 * This script finds those leftovers.
 *
 * Safety model:
 *  - Default mode is a DRY RUN: it only lists candidates and writes a report.
 *  - Deletion requires --delete explicitly.
 *  - An object is a candidate only when NO invitation references it anywhere:
 *    every string value in settings, money gift details, wishlist items and
 *    gallery rows is scanned, not just the custom_* key fields.
 *  - Only the known upload folders are walked, and only objects older than
 *    --min-age-hours (default 24) are eligible, so an upload that has not been
 *    persisted yet can never be swept.
 *  - Shared/catalog assets are never candidates. Catalog rows
 *    (background_images) are part of the reference scan, and keys whose owner
 *    segment is not a UUID (e.g. the seeded `background/admin/...` catalog
 *    folder) are skipped outright. Catalog images are shown on the catalog page
 *    for users to pick from, so deleting them would empty the design catalog.
 *  - Referenced objects and non-upload keys are never touched.
 *
 * Usage:
 *   ts-node src/scripts/sweepOrphanedAssets.ts                 # dry run, writes report
 *   ts-node src/scripts/sweepOrphanedAssets.ts --delete        # delete confirmed orphans
 *   ts-node src/scripts/sweepOrphanedAssets.ts --min-age-hours=1 --report=/tmp/report.json
 */

import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Client } from 'pg';
import config from '../config';
import fileStorageService from '../services/fileStorageService';
import logger from '../utils/logger';

// Catalog/shared assets are seeded under `<folder>/admin/...`; user uploads always
// live under `<folder>/<user-uuid>/`. Anything that is not a user folder is shared
// and must never be swept.
const USER_FOLDER_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUserOwnedKey(key: string): boolean {
  const parts = key.split('/');
  return parts.length >= 3 && USER_FOLDER_PATTERN.test(parts[1]);
}

const ASSET_FOLDERS = [
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
  'qr-code-thumb-large'
];

interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  folder: string;
}

function parseArgs(argv: string[]) {
  const options = {
    delete: false,
    minAgeHours: 24,
    report: 'tmp/orphan-asset-report.json',
  };
  for (const arg of argv) {
    if (arg === '--delete') options.delete = true;
    else if (arg.startsWith('--min-age-hours=')) options.minAgeHours = Number(arg.split('=')[1]);
    else if (arg.startsWith('--report=')) options.report = arg.split('=')[1];
  }
  return options;
}

/**
 * Resolve a stored URL (or raw key) to an S3 key, when it points at our bucket.
 */
function keyFromUrl(url: unknown): string | null {
  if (typeof url !== 'string' || url === '') return null;

  const publicDomain = (config.s3PublicDomain || '').replace(/\/+$/, '');
  const prefixes = [
    publicDomain ? `${publicDomain}/` : null,
    `https://${config.s3BucketName}.s3.${config.awsRegion}.amazonaws.com/`,
    `https://${config.s3BucketName}.s3.amazonaws.com/`,
    `https://s3.${config.awsRegion}.amazonaws.com/${config.s3BucketName}/`
  ].filter(Boolean) as string[];

  for (const prefix of prefixes) {
    if (url.startsWith(prefix)) return url.slice(prefix.length).split('?')[0] || null;
  }
  if (url.startsWith('/')) return url.slice(1); // relative asset path
  return null;
}

/**
 * Walk any settings/JSON value and collect every S3 key mentioned in a string.
 */
function collectKeysFromValue(value: unknown, into: Set<string>): void {
  if (typeof value === 'string') {
    const key = keyFromUrl(value);
    if (key && key.split('/').length >= 3) into.add(key);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectKeysFromValue(item, into));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach(item => collectKeysFromValue(item, into));
  }
}

async function listObjects(): Promise<S3Object[]> {
  const client = new S3Client({
    region: config.awsRegion,
    ...(config.s3Endpoint ? { endpoint: config.s3Endpoint } : {}),
    forcePathStyle: !!config.s3Endpoint,
    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey
    }
  });

  const objects: S3Object[] = [];
  for (const folder of ASSET_FOLDERS) {
    let token: string | undefined;
    do {
      const response = await client.send(
        new ListObjectsV2Command({
          Bucket: config.s3BucketName,
          Prefix: `${folder}/`,
          ContinuationToken: token
        })
      );
      (response.Contents || []).forEach(item => {
        if (!item.Key) return;
        objects.push({
          key: item.Key,
          size: item.Size || 0,
          lastModified: item.LastModified || new Date(0),
          folder
        });
      });
      token = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (token);
  }
  return objects;
}

async function collectReferencedKeys(): Promise<Set<string>> {
  const pg = new Client({ connectionString: process.env.DATABASE_URL });
  await pg.connect();
  try {
    const invitations = await pg.query(
      'SELECT settings, money_gift_details, wishlist_details FROM invitations'
    );
    const gallery = await pg.query('SELECT image_url FROM gallery');
    // Catalog designs are shared assets shown on the catalog page. They must be
    // part of the reference set or every non-selected design looks orphaned.
    const catalog = await pg.query('SELECT url, thumbnail FROM background_images');

    const referenced = new Set<string>();
    for (const row of invitations.rows) {
      collectKeysFromValue(row.settings || {}, referenced);
      collectKeysFromValue(row.money_gift_details || {}, referenced);
      collectKeysFromValue(row.wishlist_details || {}, referenced);
    }
    gallery.rows.forEach(row => collectKeysFromValue(row.image_url, referenced));
    catalog.rows.forEach(row => {
      collectKeysFromValue(row.url, referenced);
      collectKeysFromValue(row.thumbnail, referenced);
    });
    return referenced;
  } finally {
    await pg.end();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const mode = options.delete ? 'DELETE' : 'DRY RUN';

  logger.info(`Asset sweep starting (${mode}), minimum age ${options.minAgeHours}h`);

  const [objects, referenced] = await Promise.all([listObjects(), collectReferencedKeys()]);
  const cutoff = Date.now() - options.minAgeHours * 60 * 60 * 1000;

  const unreferenced = objects.filter(
    object => !referenced.has(object.key) && object.lastModified.getTime() < cutoff
  );

  // Shared/catalog assets are reported but never deleted.
  const skippedShared = unreferenced.filter(object => !isUserOwnedKey(object.key));
  const candidates = unreferenced.filter(object => isUserOwnedKey(object.key));

  const totalBytes = objects.reduce((sum, object) => sum + object.size, 0);
  const candidateBytes = candidates.reduce((sum, object) => sum + object.size, 0);

  const byFolder = ASSET_FOLDERS.map(folder => {
    const all = objects.filter(object => object.folder === folder);
    const orphaned = candidates.filter(object => object.folder === folder);
    return {
      folder,
      objects: all.length,
      orphaned: orphaned.length,
      orphanedBytes: orphaned.reduce((sum, object) => sum + object.size, 0)
    };
  }).filter(entry => entry.objects > 0);

  const report = {
      mode,
      generatedAt: new Date().toISOString(),
      bucket: config.s3BucketName,
      region: config.awsRegion,
      minAgeHours: options.minAgeHours,
      totals: {
        objects: objects.length,
        referenced: objects.length - unreferenced.length,
        orphaned: candidates.length,
        bytes: totalBytes,
        orphanedBytes: candidateBytes,
        skippedSharedAssets: skippedShared.length,
        skippedSharedBytes: skippedShared.reduce((sum, object) => sum + object.size, 0)
      },
      byFolder,
      candidates: candidates.map(object => ({
        key: object.key,
        size: object.size,
        lastModified: object.lastModified.toISOString()
      }))
  };

  const fs = require('fs');
  const path = require('path');
  fs.mkdirSync(path.dirname(options.report), { recursive: true });
  fs.writeFileSync(options.report, JSON.stringify(report, null, 2));

  console.log(`\n=== Asset sweep (${mode}) ===`);
  console.log(`Objects: ${objects.length} (${(totalBytes / 1048576).toFixed(1)} MB)`);
  console.log(`References found: ${objects.length - candidates.length}`);
  console.log(`Orphan candidates: ${candidates.length} (${(candidateBytes / 1048576).toFixed(1)} MB)`);
  console.log(
    `Skipped shared/catalog assets: ${skippedShared.length} ` +
      `(${(skippedShared.reduce((sum, object) => sum + object.size, 0) / 1048576).toFixed(1)} MB, never deleted)`
  );
  console.table(byFolder.map(entry => ({
    folder: entry.folder,
    objects: entry.objects,
    orphaned: entry.orphaned,
    'orphaned MB': (entry.orphanedBytes / 1048576).toFixed(1)
  })));
  console.log(`Report written: ${options.report}`);

  if (!options.delete) {
    console.log('\nDRY RUN: nothing deleted. Re-run with --delete to remove the listed candidates.');
    return;
  }

  console.log('\nDeleting candidates...');
  const result = await fileStorageService.deleteMultipleFiles(candidates.map(object => object.key));
  console.log(`Deleted ${result.success}, failed ${result.failed}.`);
  logger.info(`Asset sweep finished: deleted ${result.success}, failed ${result.failed}`);
}

main().catch(error => {
  console.error('Asset sweep failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
