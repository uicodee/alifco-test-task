import { HttpStatus, ValidationError } from '@nestjs/common';
import { AppException } from '@/common/errors/app-exception';
import type { ApiErrorFieldErrors } from '@/common/errors/api-error.types';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';

function collectFieldErrors(
  errors: ValidationError[],
  parentPath?: string,
): ApiErrorFieldErrors {
  return errors.reduce<ApiErrorFieldErrors>((acc, error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      acc[path] = Object.values(error.constraints);
    }

    if (error.children?.length) {
      Object.assign(acc, collectFieldErrors(error.children, path));
    }

    return acc;
  }, {});
}

export function createValidationException(errors: ValidationError[]) {
  return new AppException({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    code: ApiErrorCode.VALIDATION_FAILED,
    reason: { code: ApiErrorReasonCode.VALIDATION_FAILED },
    fieldErrors: collectFieldErrors(errors),
  });
}
