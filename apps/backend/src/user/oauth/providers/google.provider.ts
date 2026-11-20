import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BackendEnv } from '@/shared/config/env';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import {
  AuthorizationParams,
  ExchangeParams,
  OAuthFlowError,
  OAuthProfile,
  OAuthProviderClient,
} from '@/user/oauth/providers/oauth-provider.interface';
import { OidcTokenVerifier, postTokenRequest } from '@/user/oauth/providers/oidc-token.verifier';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

@Injectable()
export class GoogleProvider implements OAuthProviderClient {
  readonly id = OAuthProvider.GOOGLE;

  constructor(
    private readonly config: ConfigService<BackendEnv, true>,
    private readonly verifier: OidcTokenVerifier,
  ) {}

  private get clientId() {
    return this.config.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  private get clientSecret() {
    return this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });
  }

  isEnabled() {
    return !!this.clientId && !!this.clientSecret;
  }

  buildAuthorizationUrl(p: AuthorizationParams) {
    const params = new URLSearchParams({
      client_id: this.clientId!,
      redirect_uri: p.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: p.state,
      nonce: p.nonce,
      code_challenge: p.codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    });
    return `${AUTH_URL}?${params}`;
  }

  async exchange(p: ExchangeParams): Promise<OAuthProfile> {
    const tokens = await postTokenRequest<{ id_token?: string }>(TOKEN_URL, {
      grant_type: 'authorization_code',
      code: p.code,
      redirect_uri: p.redirectUri,
      client_id: this.clientId!,
      client_secret: this.clientSecret!,
      code_verifier: p.codeVerifier,
    });
    if (!tokens.id_token) throw new OAuthFlowError('exchange_failed', 'Google returned no id_token');

    const claims = await this.verifier.verify(tokens.id_token, {
      jwksUrl: JWKS_URL,
      issuers: ISSUERS,
      audience: this.clientId!,
      nonce: p.nonce,
    });

    return {
      providerUserId: claims.sub,
      email: claims.email?.toLowerCase() ?? null,
      emailVerified: claims.email_verified === true || claims.email_verified === 'true',
      name: claims.name || claims.given_name || claims.email?.split('@')[0] || 'Google user',
      avatarUrl: claims.picture ?? null,
    };
  }
}
