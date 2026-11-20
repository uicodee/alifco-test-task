import Axios from 'axios';
import type { ApiErrorCode, ApiErrorResponseDto } from '@/shared/api/model';

export type ParsedApiError = {
  statusCode?: number;
  code?: ApiErrorCode;
  message: string;
  fieldErrors: Record<string, string[]>;
  isNetworkError: boolean;
};

export function parseApiError(error: unknown): ParsedApiError {
  if (Axios.isAxiosError<ApiErrorResponseDto>(error)) {
    const data = error.response?.data;
    return {
      statusCode: data?.statusCode ?? error.response?.status,
      code: data?.code,
      message: data?.message ?? error.message ?? 'Request failed',
      fieldErrors: data?.fieldErrors ?? {},
      isNetworkError: !error.response,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'Request failed',
    fieldErrors: {},
    isNetworkError: false,
  };
}

const MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  AUTH_INVALID_CREDENTIALS: 'Неверный email или пароль.',
  AUTH_EMAIL_TAKEN: 'На этот email уже есть аккаунт. Войдите.',
  AUTH_PROVIDER_DISABLED: 'Этот способ входа сейчас недоступен.',
  AUTH_CURRENT_PASSWORD_REQUIRED: 'Введите текущий пароль.',
  AUTH_CURRENT_PASSWORD_INVALID: 'Неверный текущий пароль.',
  AUTH_EMAIL_REQUIRED: 'Чтобы входить по паролю, к аккаунту должен быть привязан email.',
  TOO_MANY_REQUESTS: 'Слишком много попыток. Подождите минуту и попробуйте снова.',
  VALIDATION_FAILED: 'Проверьте выделенные поля.',
};

export function getApiErrorMessage(error: unknown, fallback = 'Что-то пошло не так. Попробуйте снова.'): string {
  const parsed = parseApiError(error);
  if (parsed.isNetworkError) return 'Нет связи с сервером. Проверьте интернет и попробуйте снова.';
  const message = parsed.code && MESSAGES[parsed.code];
  if (message) return message;
  if (parsed.statusCode && parsed.statusCode >= 500) return 'Что-то пошло не так на нашей стороне. Попробуйте чуть позже.';
  return fallback;
}
