import type {
  ApiErrorCode,
  ApiErrorReasonCode,
  ApiErrorReasonCodeByErrorCode,
} from '@/common/errors/api-error-codes';

export type ApiErrorFieldErrors = Record<string, string[]>;

export type ApiErrorReason = {
  code: ApiErrorReasonCode;
} & Record<string, unknown>;

export type ApiErrorReasonForCode<TCode extends ApiErrorCode> = {
  code: (typeof ApiErrorReasonCodeByErrorCode)[TCode];
} & Record<string, unknown>;

export interface ApiErrorResponseBody {
  statusCode: number;
  code: ApiErrorCode;
  reason: ApiErrorReason;
  message?: string;
  params?: Record<string, unknown>;
  fieldErrors?: ApiErrorFieldErrors;
  path?: string;
  timestamp?: string;
  response_id?: string;
}
