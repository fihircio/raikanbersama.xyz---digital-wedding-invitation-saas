#!/usr/bin/env node
/**
 * Guard against stale fixture dates.
 *
 * Background: demo/catalog/sample data once used hardcoded literals such as
 * 2025-12-25 and 2025-12-31. They kept showing a past date on the catalog
 * preview and seeded expired memberships, and they made it impossible to tell
 * an environment apart by looking at the data (both environments rendered the
 * same literal).
 *
 * This check fails when a user-visible fixture date is hardcoded in the past,
 * or when a preview hardcodes a formatted date string instead of formatting the
 * derived date. Run it in CI or before recording marketing material.
 *
 *   node scripts/check-fixture-dates.mjs
 */

import { readFileSync, existsSync } from 'node:fs';

const FILES = [
  'components/Catalog/BackgroundCard.tsx',
  'src/pages/EditorPage.tsx',
  'src/pages/PublicInvitationPage.tsx',
  'backend/src/services/mockDataService.ts',
  'backend/src/seeders/sampleInvitations.ts',
  'backend/src/seeders/index.ts',
];

const DATE_FIELDS = ['event_date', 'membership_expires_at'];
const currentYear = new Date().getFullYear();
const problems = [];

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

if (problems.length > 0) {
  console.error('Fixture date check FAILED:\n');
  problems.forEach(problem => console.error(`  - ${problem}`));
  console.error('\nUse the shared fixture helpers (demoEventDate / futureDate) instead of literals.');
  process.exit(1);
}

console.log(`Fixture date check passed (current year ${currentYear}, ${FILES.length} files scanned).`);
