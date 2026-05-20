import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });
dotenv.config({ path: '.env.railway.local', override: true });

type CatalogRow = {
  id: string;
  name: string;
  category: string;
  theme: string | null;
  created_at: Date;
};

const args = new Set(process.argv.slice(2));
const shouldApply = args.has('--apply');

const databaseUrl =
  process.env.CATALOG_DATABASE_URL ||
  process.env.RAILWAY_DATABASE_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    'Missing database URL. Set CATALOG_DATABASE_URL to the Railway Postgres public connection string.'
  );
  process.exit(1);
}

const pad = (value: number): string => value.toString().padStart(2, '0');

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const main = async () => {
  await client.connect();

  const result = await client.query<CatalogRow>(`
    SELECT id, name, category, theme, created_at
    FROM background_images
    ORDER BY category ASC, created_at ASC, name ASC
  `);

  const rows = result.rows;
  const counters = new Map<string, number>();
  const changes = rows.map((row) => {
    const next = (counters.get(row.category) || 0) + 1;
    counters.set(row.category, next);

    return {
      ...row,
      newName: `${row.category} ${pad(next)}`,
    };
  });

  console.log(`Catalog rows found: ${rows.length}`);
  console.log(shouldApply ? 'Mode: APPLY' : 'Mode: DRY RUN');
  console.log('');

  console.log('Category counts / next numbers:');
  for (const [category, count] of [...counters.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`- ${category}: ${count} existing, next ${pad(count + 1)}`);
  }
  console.log('');

  console.log('Rename plan:');
  for (const change of changes) {
    const marker = change.name === change.newName ? '=' : '>';
    console.log(`${marker} [${change.category}] ${change.name} -> ${change.newName}`);
  }

  if (!shouldApply) {
    console.log('');
    console.log('Dry run only. Re-run with --apply to update production names.');
    return;
  }

  await client.query('BEGIN');
  try {
    for (const change of changes) {
      if (change.name === change.newName) continue;

      await client.query(
        'UPDATE background_images SET name = $1, updated_at = NOW() WHERE id = $2',
        [change.newName, change.id]
      );
    }

    await client.query('COMMIT');
    console.log('');
    console.log('Catalog names updated successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

main()
  .catch((error) => {
    console.error('Failed to standardize catalog names:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => undefined);
  });
