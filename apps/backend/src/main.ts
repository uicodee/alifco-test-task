import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import {
  API_PREFIX,
  configureApp,
  createSwaggerDocument,
} from '@/shared/config/app.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const swaggerEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.SWAGGER_ENABLED === 'true';
  if (swaggerEnabled) {
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, () => createSwaggerDocument(app), {
      jsonDocumentUrl: `${API_PREFIX}/swagger`,
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'method',
      },
    });
  }

  const port = process.env.APP_PORT || 4000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`Application is running on: http://localhost:${port}/${API_PREFIX}`);
}

bootstrap().catch((error: unknown) => {
  const fatalError = error instanceof Error ? error : new Error(String(error));
  Logger.error(
    `Backend bootstrap failed: ${fatalError.message}`,
    fatalError.stack,
    'Bootstrap',
  );
  process.exit(1);
});
