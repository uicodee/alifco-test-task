import { dirname, join } from 'path';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '@/shared/database/data-source';

const distDir = dirname(process.argv[1]);

async function runMigrations(label: string, folder: string): Promise<void> {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [],
    migrations: [join(distDir, 'migrations', folder, '*.js')],
  });

  await dataSource.initialize();
  try {
    await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    const applied = await dataSource.runMigrations({ transaction: 'each' });
    console.log(
      applied.length > 0
        ? `[migrate] ${label}: applied ${applied.map((m) => m.name).join(', ')}`
        : `[migrate] ${label}: no pending migrations`,
    );
  } finally {
    await dataSource.destroy();
  }
}

async function main(): Promise<void> {
  await runMigrations('schema', 'schema');
  await runMigrations('seeds', 'seeds');
}

main().catch((error: unknown) => {
  console.error('[migrate] failed', error);
  process.exit(1);
});
