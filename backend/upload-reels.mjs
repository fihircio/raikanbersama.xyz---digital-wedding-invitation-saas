import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});
const Bucket = process.env.S3_BUCKET_NAME;
const FOOTAGE = path.resolve('../marketing/footage');
const files = [
  ['01_invite_reveal.mp4', 'marketing/ig-reels/reveal.mp4'],
  ['02_catalog_filter.mp4', 'marketing/ig-reels/katalog.mp4'],
  ['04_elite_hadiah_qr.mp4', 'marketing/ig-reels/hadiah.mp4'],
  ['06_rsvp_flow.mp4', 'marketing/ig-reels/rsvp.mp4'],
];
const out = {};
for (const [src, Key] of files) {
  const full = path.join(FOOTAGE, src);
  if (!fs.existsSync(full)) { console.log('missing', full); continue; }
  await s3.send(new PutObjectCommand({
    Bucket, Key, Body: fs.readFileSync(full), ContentType: 'video/mp4',
  }));
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key }), {});
  const getUrl = await getSignedUrl(
    s3,
    (await import('@aws-sdk/client-s3')).GetObjectCommand ? new (await import('@aws-sdk/client-s3')).GetObjectCommand({ Bucket, Key }) : null,
    { expiresIn: 21600 }
  );
  out[Key] = getUrl;
  console.log('✓', src, '→', Key);
}
fs.writeFileSync('/tmp/ig-urls.json', JSON.stringify(out, null, 2));
console.log('\nURLs written to /tmp/ig-urls.json');
