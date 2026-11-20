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

const ISSUER = 'https://oauth.telegram.org';
const AUTH_URL = `${ISSUER}/auth`;
const TOKEN_URL = `${ISSUER}/token`;
const JWKS_URL = `${ISSUER}/.well-known/jwks.json`;

@Injectable()
export class TelegramProvider implements OAuthProviderClient {
  readonly id = OAuthProvider.TELEGRAM;

  constructor(
    private readonly config: ConfigService<BackendEnv, true>,
    private readonly verifier: OidcTokenVerifier,
  ) {}

  private get clientId() {
    return this.config.get('TELEGRAM_CLIENT_ID', { infer: true });
  }

  private get clientSecret() {
    return this.config.get('TELEGRAM_CLIENT_SECRET', { infer: true });
  }

  isEnabled() {
    return !!this.clientId && !!this.clientSecret;
  }

  buildAuthorizationUrl(p: AuthorizationParams) {
    const params = new URLSearchParams({
      client_id: this.clientId!,
      redirect_uri: p.redirectUri,
      response_type: 'code',
      scope: 'openid profile',
      state: p.state,
      nonce: p.nonce,
      code_challenge: p.codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${AUTH_URL}?${params}`;
  }

  async exchange(p: ExchangeParams): Promise<OAuthProfile> {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const tokens = await postTokenRequest<{ id_token?: string }>(
      TOKEN_URL,
      {
        grant_type: 'authorization_code',
        code: p.code,
        redirect_uri: p.redirectUri,
        client_id: this.clientId!,
        code_verifier: p.codeVerifier,
      },
      { Authorization: `Basic ${credentials}` },
    );
    if (!tokens.id_token) throw new OAuthFlowError('exchange_failed', 'Telegram returned no id_token');

    const claims = await this.verifier.verify(tokens.id_token, {
      jwksUrl: JWKS_URL,
      issuers: [ISSUER],
      audience: this.clientId!,
      nonce: p.nonce,
    });

    const fullName = [claims.given_name, claims.family_name].filter(Boolean).join(' ');
    return {
      providerUserId: claims.sub,
      email: null,
      emailVerified: false,
      name: claims.name || fullName || claims.preferred_username || 'Telegram user',
      avatarUrl: claims.picture ?? null,
    };
  }
}
