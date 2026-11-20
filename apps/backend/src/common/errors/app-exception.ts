import { HttpException, HttpStatus } from '@nestjs/common';
import type {
  ApiErrorFieldErrors,
  ApiErrorReasonForCode,
  ApiErrorResponseBody,
} from '@/common/errors/api-error.types';
import type { ApiErrorCode } from '@/common/errors/api-error-codes';

type AppExceptionOptions = {
  [TCode in ApiErrorCode]: {
    status: HttpStatus;
    code: TCode;
    reason: ApiErrorReasonForCode<TCode>;
    params?: Record<string, unknown>;
    fieldErrors?: ApiErrorFieldErrors;
  };
}[ApiErrorCode];

export class AppException extends HttpException {
  readonly code: ApiErrorCode;
  readonly reason: ApiErrorResponseBody['reason'];
  readonly params?: Record<string, unknown>;
  readonly fieldErrors?: ApiErrorFieldErrors;

  constructor(options: AppExceptionOptions) {
    const body: ApiErrorResponseBody = {
      statusCode: options.status,
      code: options.code,
      reason: options.reason,
      params: options.params,
      fieldErrors: options.fieldErrors,
    };

    super(body, options.status);
    this.code = options.code;
    this.reason = options.reason;
    this.params = options.params;
    this.fieldErrors = options.fieldErrors;
  }
}
