import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ApiExceptionFilter } from '@/common/errors/api-exception.filter';
import { createValidationException } from '@/common/errors/validation-exception.factory';

export const API_PREFIX = 'api';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  (app as NestExpressApplication).set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cookieParser());
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: createValidationException,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Alifco Auth API')
    .setDescription(
      'Email + password and social (Google, Facebook, Telegram) sign-in. ' +
        'Sessions live in httpOnly cookies: `access_token` (short-lived JWT) and `refresh_token` (rotated on every refresh).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token (the `access_token` cookie value)',
      },
      'bearer',
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Set by the login, register and OAuth callback endpoints',
    })
    .addCookieAuth('refresh_token', { type: 'apiKey', in: 'cookie' }, 'refresh_token')
    .build();

  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey.replace(/Controller$/, '')}${methodKey[0].toUpperCase()}${methodKey.slice(1)}`.replace(
        /^./,
        (c) => c.toLowerCase(),
      ),
  });
}
