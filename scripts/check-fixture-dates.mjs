#!/usr/bin/env node
/**
 * Guard against stale fixture dates — in code and in seeded data.
 *
 * Background: demo/catalog/sample data once used hardcoded literals such as
 * 2025-12-25 and 2025-12-31, and the sample seeder skipped rows that already
 * existed. Catalog previews kept rendering a past date and seeded sample cards
 * drifted into the past, while the data still looked identical across
 * environments (fixtures are the same source in every environment).
 *
 * This check fails when:
 *   - a user-visible fixture date is hardcoded in the past, or a preview hardcodes
 *     a formatted date string instead of formatting the derived date;
 *   - a sample invitation row in the database has a past event_date;
 *   - a seeded demo account has an expired membership while on a paid tier.
 *
 *   node scripts/check-fixture-dates.mjs            # code + database
 *   node scripts/check-fixture-dates.mjs --skip-db  # code only
 */

import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

const FILES = [
  'components/Catalog/BackgroundCard.tsx',
  'src/pages/EditorPage.tsx',
  'src/pages/PublicInvitationPage.tsx',
  'backend/src/services/mockDataService.ts',
  'backend/src/seeders/sampleInvitations.ts',
  'backend/src/seeders/index.ts',
];

const DATE_FIELDS = ['event_date', 'membership_expires_at'];
// Postgres date columns arrive as Date objects at local midnight; ISO would shift
// the day backwards for UTC+8, so format from local components instead.
const dateOnly = date => {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const currentYear = new Date().getFullYear();
const skipDb = process.argv.includes('--skip-db');
const problems = [];

// ---------------------------------------------------------------------------
// 1. Code-level check
// ---------------------------------------------------------------------------

for (const file of FILES) {
  if (!existsSync(file)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, index) => {
    const location = `${file}:${index + 1}`;
    const trimmed = line.trim();

    // A hardcoded formatted date string bypasses the shared formatter.
    if (/formattedDate=["'][^"']*\d/.test(line)) {
      problems.push(`${location} hardcodes a formatted date: ${trimmed}`);
    }

    for (const field of DATE_FIELDS) {
      if (!trimmed.includes(field)) continue;
      const years = trimmed.match(/20\d\d/g);
      if (!years) continue;
      // Allow relative-date expressions (Date.now(), demoEventDate(), etc.).
      if (/new Date\(\s*$/.test(trimmed) || trimmed.includes('demoEventDate') || trimmed.includes('futureDate')) {
        continue;
      }
      for (const year of years) {
        if (Number(year) < currentYear) {
          problems.push(`${location} ${field} uses a past year (${year}): ${trimmed}`);
        }
      }
    }
  });
}

// ---------------------------------------------------------------------------
// 2. Database-level check (seeded rows drift too)
// ---------------------------------------------------------------------------

function readDatabaseUrl() {
  const envPath = 'backend/.env';
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf8');
  const match = content.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m);
  if (!match) return null;
  return match[1].replace(/^["']|["']$/g, '');
}

async function checkDatabaseFixtureDates() {
  if (skipDb) {
    console.log('Database fixture check: skipped (--skip-db).');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL || readDatabaseUrl();
  if (!databaseUrl) {
    console.log('Database fixture check: skipped (no DATABASE_URL / backend/.env).');
    return;
  }

  const backendRequire = createRequire(new URL('../backend/package.json', import.meta.url));
  let Client;
  try {
    ({ Client } = backendRequire('pg'));
  } catch {
    console.log('Database fixture check: skipped (pg not installed in backend).');
    return;
  }

  const client = new Client({ connectionString: databaseUrl, ssl: false });
  try {
    await client.connect();

    const samples = await client.query(
      "SELECT slug, event_date::date AS event_date FROM invitations WHERE slug LIKE 'sample-%' AND event_date < CURRENT_DATE ORDER BY slug"
    );
    samples.rows.forEach(row => {
      problems.push(
        `database: sample invitation ${row.slug} has a past event_date (${dateOnly(row.event_date)})`
      );
    });

    const expiredDemos = await client.query(
      `SELECT email, membership_tier, membership_expires_at::date AS expires
         FROM users
        WHERE email LIKE '%@example.com'
          AND membership_tier IN ('lite','pro','elite')
          AND membership_expires_at IS NOT NULL
          AND membership_expires_at < NOW()
        ORDER BY email`
    );
    expiredDemos.rows.forEach(row => {
      problems.push(
        `database: seeded demo account ${row.email} (${row.membership_tier}) expired on ${dateOnly(row.expires)}`
      );
    });

    console.log(
      `Database fixture check: ${samples.rows.length} stale sample card(s), ${expiredDemos.rows.length} expired demo account(s).`
    );
  } finally {
    await client.end().catch(() => {});
  }
}

await checkDatabaseFixtureDates();

if (problems.length > 0) {
  console.error('\nFixture date check FAILED:\n');
  problems.forEach(problem => console.error(`  - ${problem}`));
  console.error(
    '\nCode: use the shared helpers (demoEventDate / futureDate) instead of literals.' +
      '\nData: refresh seeds (npm run seed in backend) or update the affected rows.'
  );
  process.exit(1);
}

console.log(`Fixture date check passed (current year ${currentYear}, ${FILES.length} files scanned).`);
