import { z } from 'zod';

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const requiredString = (name: string) =>
  z.preprocess(emptyToUndefined, z.string().min(1, `${name} is required`));

const secret = (name: string) =>
  z.preprocess(
    emptyToUndefined,
    z.string().min(32, `${name} must be at least 32 characters`),
  );

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const duration = z
  .string()
  .regex(/^\d+[smhd]$/, 'use a duration like 15m, 12h or 30d');

const backendEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_URL: z.string().url(),
  POSTGRES_HOST: requiredString('POSTGRES_HOST'),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  POSTGRES_USER: requiredString('POSTGRES_USER'),
  POSTGRES_PASSWORD: z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z.string(),
  ),
  POSTGRES_DB: requiredString('POSTGRES_DB'),
  POSTGRES_SSL: optionalString,
  JWT_ACCESS_SECRET: secret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: secret('JWT_REFRESH_SECRET'),
  JWT_STATE_SECRET: secret('JWT_STATE_SECRET'),
  JWT_ACCESS_EXPIRATION: duration.default('15m'),
  JWT_REFRESH_EXPIRATION: duration.default('30d'),
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  FACEBOOK_APP_ID: optionalString,
  FACEBOOK_APP_SECRET: optionalString,
  TELEGRAM_CLIENT_ID: optionalString,
  TELEGRAM_CLIENT_SECRET: optionalString,
  SWAGGER_ENABLED: optionalString,
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

export function validateBackendEnv(config: Record<string, unknown>): BackendEnv {
  const result = backendEnvSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment:\n${details}`);
  }
  return result.data;
}
