export const ApiErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  HTTP_ERROR: 'HTTP_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_TAKEN: 'AUTH_EMAIL_TAKEN',
  AUTH_EMAIL_REQUIRED: 'AUTH_EMAIL_REQUIRED',
  AUTH_CURRENT_PASSWORD_REQUIRED: 'AUTH_CURRENT_PASSWORD_REQUIRED',
  AUTH_CURRENT_PASSWORD_INVALID: 'AUTH_CURRENT_PASSWORD_INVALID',
  AUTH_PROVIDER_DISABLED: 'AUTH_PROVIDER_DISABLED',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export const ApiErrorReasonCode = {
  BAD_REQUEST: 'bad_request',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  TOO_MANY_REQUESTS: 'too_many_requests',
  VALIDATION_FAILED: 'validation_failed',
  INTERNAL_ERROR: 'internal_error',
  HTTP_ERROR: 'http_error',
  USER_NOT_FOUND: 'user_not_found',
  AUTH_TOKEN_INVALID: 'auth_token_invalid',
  AUTH_SESSION_EXPIRED: 'auth_session_expired',
  AUTH_INVALID_CREDENTIALS: 'auth_invalid_credentials',
  AUTH_EMAIL_TAKEN: 'auth_email_taken',
  AUTH_EMAIL_REQUIRED: 'auth_email_required',
  AUTH_CURRENT_PASSWORD_REQUIRED: 'auth_current_password_required',
  AUTH_CURRENT_PASSWORD_INVALID: 'auth_current_password_invalid',
  AUTH_PROVIDER_DISABLED: 'auth_provider_disabled',
} as const;

export type ApiErrorReasonCode =
  (typeof ApiErrorReasonCode)[keyof typeof ApiErrorReasonCode];

export const ApiErrorReasonCodeByErrorCode = {
  [ApiErrorCode.BAD_REQUEST]: ApiErrorReasonCode.BAD_REQUEST,
  [ApiErrorCode.UNAUTHORIZED]: ApiErrorReasonCode.UNAUTHORIZED,
  [ApiErrorCode.FORBIDDEN]: ApiErrorReasonCode.FORBIDDEN,
  [ApiErrorCode.NOT_FOUND]: ApiErrorReasonCode.NOT_FOUND,
  [ApiErrorCode.CONFLICT]: ApiErrorReasonCode.CONFLICT,
  [ApiErrorCode.TOO_MANY_REQUESTS]: ApiErrorReasonCode.TOO_MANY_REQUESTS,
  [ApiErrorCode.VALIDATION_FAILED]: ApiErrorReasonCode.VALIDATION_FAILED,
  [ApiErrorCode.INTERNAL_ERROR]: ApiErrorReasonCode.INTERNAL_ERROR,
  [ApiErrorCode.HTTP_ERROR]: ApiErrorReasonCode.HTTP_ERROR,
  [ApiErrorCode.USER_NOT_FOUND]: ApiErrorReasonCode.USER_NOT_FOUND,
  [ApiErrorCode.AUTH_TOKEN_INVALID]: ApiErrorReasonCode.AUTH_TOKEN_INVALID,
  [ApiErrorCode.AUTH_SESSION_EXPIRED]: ApiErrorReasonCode.AUTH_SESSION_EXPIRED,
  [ApiErrorCode.AUTH_INVALID_CREDENTIALS]:
    ApiErrorReasonCode.AUTH_INVALID_CREDENTIALS,
  [ApiErrorCode.AUTH_EMAIL_TAKEN]: ApiErrorReasonCode.AUTH_EMAIL_TAKEN,
  [ApiErrorCode.AUTH_EMAIL_REQUIRED]: ApiErrorReasonCode.AUTH_EMAIL_REQUIRED,
  [ApiErrorCode.AUTH_CURRENT_PASSWORD_REQUIRED]:
    ApiErrorReasonCode.AUTH_CURRENT_PASSWORD_REQUIRED,
  [ApiErrorCode.AUTH_CURRENT_PASSWORD_INVALID]:
    ApiErrorReasonCode.AUTH_CURRENT_PASSWORD_INVALID,
  [ApiErrorCode.AUTH_PROVIDER_DISABLED]:
    ApiErrorReasonCode.AUTH_PROVIDER_DISABLED,
} as const satisfies Record<ApiErrorCode, ApiErrorReasonCode>;
