import { applyDecorators, createParamDecorator, ExecutionContext, ValidationPipe } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { createValidationException } from '@/common/errors/validation-exception.factory';
import { OAuthCallbackQueryDto } from '@/user/oauth/dto/oauth-callback-query.dto';

const rawQuery = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest<Request>().query;
});

export const OAuthCallbackQuery = () =>
  rawQuery(
    new ValidationPipe({
      expectedType: OAuthCallbackQueryDto,
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: createValidationException,
    }),
  );

export const ApiOAuthCallbackQuery = () =>
  applyDecorators(
    ApiQuery({ name: 'code', required: false, type: String, description: 'Authorization code' }),
    ApiQuery({ name: 'state', required: false, type: String, description: 'State issued by the start endpoint' }),
    ApiQuery({ name: 'error', required: false, type: String, description: 'Set when the user cancelled' }),
    ApiQuery({ name: 'error_description', required: false, type: String }),
  );
