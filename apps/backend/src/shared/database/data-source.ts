import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { validateBackendEnv } from '@/shared/config/env';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const env = validateBackendEnv(process.env);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  entities: ['src/**/**/*.entity{.ts,.js}'],
  migrations: ['src/shared/database/migrations/schema/*{.ts,.js}'],
  synchronize: false,
  migrationsTransactionMode: 'each',
  logging: env.NODE_ENV === 'development',
  ssl:
    env.POSTGRES_SSL === 'false'
      ? false
      : env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
