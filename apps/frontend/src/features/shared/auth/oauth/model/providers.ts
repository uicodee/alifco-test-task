import type { ComponentType } from 'react';
import { OAuthProvider, type AuthProvidersDto } from '@/shared/api/model';
import { FacebookLogo, GoogleLogo, TelegramLogo, type IconProps } from '@/shared/ui/icon';

export interface OAuthProviderMeta {
  id: OAuthProvider;
  label: string;
  Logo: ComponentType<IconProps>;
}

export const OAUTH_PROVIDERS: OAuthProviderMeta[] = [
  { id: OAuthProvider.google, label: 'Google', Logo: GoogleLogo },
  { id: OAuthProvider.facebook, label: 'Facebook', Logo: FacebookLogo },
  { id: OAuthProvider.telegram, label: 'Telegram', Logo: TelegramLogo },
];

export const getEnabledProviders = (enabled: AuthProvidersDto) => OAUTH_PROVIDERS.filter((p) => enabled[p.id]);

export function getOAuthStartUrl(provider: OAuthProvider, after: string): string {
  return `/api/auth/oauth/${provider}?${new URLSearchParams({ next: after })}`;
}

export function getOAuthErrorMessage(code: string | undefined, provider: string | undefined): string | null {
  if (!code) return null;
  const name = OAUTH_PROVIDERS.find((p) => p.id === provider)?.label ?? 'соцсеть';
  switch (code) {
    case 'cancelled':
      return `Вход через ${name} отменён.`;
    case 'state_invalid':
      return `Вход через ${name} занял слишком много времени или был открыт в другом браузере. Попробуйте снова.`;
    case 'disabled':
      return `Вход через ${name} сейчас недоступен.`;
    default:
      return `Не удалось войти через ${name}. Попробуйте снова или войдите по email.`;
  }
}
