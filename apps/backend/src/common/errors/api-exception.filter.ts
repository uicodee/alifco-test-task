import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { AppException } from '@/common/errors/app-exception';
import type { ApiErrorResponseBody } from '@/common/errors/api-error.types';
import {
  ApiErrorCode,
  ApiErrorReasonCodeByErrorCode,
} from '@/common/errors/api-error-codes';

const STATUS_CODE_TO_ERROR_CODE: Record<number, ApiErrorCode> = {
  [HttpStatus.BAD_REQUEST]: ApiErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ApiErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ApiErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ApiErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: ApiErrorCode.CONFLICT,
  [HttpStatus.TOO_MANY_REQUESTS]: ApiErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ApiErrorCode.VALIDATION_FAILED,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ApiErrorCode.INTERNAL_ERROR,
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorBody = this.normalizeException(exception, status);
    const responseId = randomUUID();

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const error =
        exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(
        `Exception ${status} ${request.method} ${request.url} (${responseId}): ${error.message}`,
        error.stack,
      );
    }

    response.status(status).json({
      ...errorBody,
      path: request.url,
      timestamp: new Date().toISOString(),
      response_id: responseId,
    } satisfies ApiErrorResponseBody);
  }

  private normalizeException(
    exception: unknown,
    status: number,
  ): ApiErrorResponseBody {
    if (exception instanceof AppException) {
      return exception.getResponse() as ApiErrorResponseBody;
    }

    const code =
      STATUS_CODE_TO_ERROR_CODE[status] ??
      (status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? ApiErrorCode.INTERNAL_ERROR
        : ApiErrorCode.HTTP_ERROR);

    let message: string | undefined;
    if (exception instanceof HttpException && status < 500) {
      const raw = exception.getResponse();
      message =
        typeof raw === 'string'
          ? raw
          : String((raw as { message?: unknown }).message ?? exception.message);
    }

    return {
      statusCode: status,
      code,
      reason: { code: ApiErrorReasonCodeByErrorCode[code] },
      message,
    };
  }
}
