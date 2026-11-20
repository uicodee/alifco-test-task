import type { OAuthProvider } from '@/user/oauth/dto/enums.dto';

export interface OAuthProfile {
  providerUserId: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  avatarUrl: string | null;
}

export interface AuthorizationParams {
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}

export interface ExchangeParams {
  code: string;
  redirectUri: string;
  nonce: string;
  codeVerifier: string;
}

export interface OAuthProviderClient {
  readonly id: OAuthProvider;
  isEnabled(): boolean;
  buildAuthorizationUrl(params: AuthorizationParams): string;
  exchange(params: ExchangeParams): Promise<OAuthProfile>;
}

export class OAuthFlowError extends Error {
  constructor(
    readonly code:
      | 'cancelled'
      | 'state_invalid'
      | 'exchange_failed'
      | 'token_invalid'
      | 'profile_failed'
      | 'disabled',
    message?: string,
  ) {
    super(message ?? code);
  }
}
