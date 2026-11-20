import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { NestFactory } from '@nestjs/core';
import {
  configureApp,
  createSwaggerDocument,
} from '@/shared/config/app.setup';

const PLACEHOLDERS: Record<string, string> = {
  FRONTEND_URL: 'http://localhost:3000',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_USER: 'openapi',
  POSTGRES_DB: 'openapi',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  JWT_REFRESH_SECRET: 'x'.repeat(32),
  JWT_STATE_SECRET: 'x'.repeat(32),
};

async function main() {
  for (const [key, value] of Object.entries(PLACEHOLDERS)) {
    process.env[key] ??= value;
  }
  const { AppModule } = await import('@/app.module');
  const app = await NestFactory.create(AppModule, {
    preview: true,
    logger: ['error'],
  });
  configureApp(app);
  const document = createSwaggerDocument(app);
  const out = resolve(process.cwd(), 'openapi.json');
  writeFileSync(out, JSON.stringify(document, null, 2) + '\n');
  await app.close();
  console.log(`OpenAPI written to ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
