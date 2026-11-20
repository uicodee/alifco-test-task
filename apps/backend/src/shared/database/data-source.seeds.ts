import { DataSource } from 'typeorm';
import { dataSourceOptions } from '@/shared/database/data-source';

export const SeedsDataSource = new DataSource({
  ...dataSourceOptions,
  migrations: ['src/shared/database/migrations/seeds/*{.ts,.js}'],
});
