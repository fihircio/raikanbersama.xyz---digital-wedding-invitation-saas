import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Publish Reels to Instagram from local footage.
 *
 * Instagram ingests video by public URL, so each clip is uploaded to S3 and
 * served through a short-lived signed URL. Usage:
 *
 *   node publish-ig-reels.mjs katalog hadiah        # specific slots
 *   node publish-ig-reels.mjs --all
 */
const IG_USER_ID = process.env.IG_USER_ID || '17841480083586425';
const GRAPH = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_IG_TOKEN || process.env.ACCESS_TOKEN;
const FOOTAGE = path.resolve('../marketing/footage');
const CAPTIONS = path.resolve('../marketing/meta-ads/ig-captions.json');
const RESULTS = path.resolve('../marketing/meta-ads/ig-published.json');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});
const Bucket = process.env.S3_BUCKET_NAME;

const post = async (p, params) => {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const res = await fetch(`${GRAPH}${p}`, { method: 'POST', body });
  const json = await res.json();
  if (json.error) throw new Error(`${json.error.message}${json.error.error_user_msg ? ' — ' + json.error.error_user_msg : ''}`);
  return json;
};
const get = async (p, params) => {
  const url = new URL(`${GRAPH}${p}`);
  for (const [k, v] of Object.entries({ ...params, access_token: TOKEN })) url.searchParams.set(k, v);
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
};

const waitFor = async (creationId, timeoutMs = 300000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const s = await get(`/${creationId}`, { fields: 'status_code,status' });
    if (s.status_code === 'FINISHED') return true;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
      throw new Error(`container ${s.status_code}: ${s.status || ''}`);
    }
    await new Promise(r => setTimeout(r, 10000));
  }
  throw new Error('timed out waiting for container');
};

const args = process.argv.slice(2);
const all = args.includes('--all');
const slots = all ? null : args.filter(a => !a.startsWith('--'));

if (!TOKEN) { console.error('✗ no token (META_IG_TOKEN / ACCESS_TOKEN)'); process.exit(1); }
if (!slots || !slots.length) { if (!all) { console.error('usage: node publish-ig-reels.mjs <slot...> | --all'); process.exit(1); } }

const captions = JSON.parse(fs.readFileSync(CAPTIONS, 'utf8'));
const results = fs.existsSync(RESULTS) ? JSON.parse(fs.readFileSync(RESULTS, 'utf8')) : { reels: [] };

for (const item of captions) {
  if (slots && !slots.includes(item.slot)) continue;
  const full = path.join(FOOTAGE, item.file);
  if (!fs.existsSync(full)) { console.log(`✗ ${item.slot}: missing ${full}`); continue; }

  const Key = `marketing/ig-reels/${item.slot}.mp4`;
  console.log(`→ ${item.slot}: uploading (${(fs.statSync(full).size / 1048576).toFixed(1)} MB)`);
  await s3.send(new PutObjectCommand({
    Bucket, Key, Body: fs.readFileSync(full), ContentType: 'video/mp4',
  }));

  // Instagram fetches this once at ingestion
  const videoUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key }), { expiresIn: 3600 });

  const { id: creationId } = await post(`/${IG_USER_ID}/media`, {
    media_type: 'REELS',
    video_url: videoUrl,
    caption: item.caption,
    share_to_feed: 'true',
  });
  console.log(`  container ${creationId}, processing…`);
  await waitFor(creationId);

  const { id: mediaId } = await post(`/${IG_USER_ID}/media_publish`, { creation_id: creationId });
  const info = await get(`/${mediaId}`, { fields: 'permalink,media_product_type,timestamp' });
  console.log(`  ✓ published ${mediaId} → ${info.permalink}`);

  results.reels.push({ slot: item.slot, media_id: mediaId, permalink: info.permalink, published_at: info.timestamp });
  fs.writeFileSync(RESULTS, JSON.stringify(results, null, 2));
}

console.log('\ndone');
