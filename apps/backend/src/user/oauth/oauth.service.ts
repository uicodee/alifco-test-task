import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AppException } from '@/common/errors/app-exception';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';
import type { BackendEnv } from '@/shared/config/env';
import { AuthSessionService } from '@/user/auth/auth-session.service';
import type { AuthProvidersDto } from '@/user/oauth/dto/auth-providers.dto';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import type { OAuthCallbackQueryDto } from '@/user/oauth/dto/oauth-callback-query.dto';
import { OAuthAccountService } from '@/user/oauth/oauth-account.service';
import { OAuthStateService } from '@/user/oauth/oauth-state.service';
import { FacebookProvider } from '@/user/oauth/providers/facebook.provider';
import { GoogleProvider } from '@/user/oauth/providers/google.provider';
import {
  OAuthFlowError,
  type OAuthProviderClient,
} from '@/user/oauth/providers/oauth-provider.interface';
import { TelegramProvider } from '@/user/oauth/providers/telegram.provider';
import { UserService } from '@/user/user/user.service';

const DEFAULT_NEXT = '/account';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly clients: Record<OAuthProvider, OAuthProviderClient>;
  private readonly frontendUrl: string;

  constructor(
    google: GoogleProvider,
    facebook: FacebookProvider,
    telegram: TelegramProvider,
    configService: ConfigService<BackendEnv, true>,
    private readonly oauthStateService: OAuthStateService,
    private readonly oauthAccountService: OAuthAccountService,
    private readonly authSessionService: AuthSessionService,
    private readonly userService: UserService,
  ) {
    this.clients = { google, facebook, telegram };
    this.frontendUrl = configService
      .get('FRONTEND_URL', { infer: true })
      .replace(/\/$/, '');
  }

  enabledProviders(): AuthProvidersDto {
    return {
      google: this.clients.google.isEnabled(),
      facebook: this.clients.facebook.isEnabled(),
      telegram: this.clients.telegram.isEnabled(),
    };
  }

  async start(
    provider: OAuthProvider,
    response: Response,
    next?: string,
  ): Promise<string> {
    const client = this.client(provider);
    const flow = await this.oauthStateService.start(response, provider, next);
    return client.buildAuthorizationUrl({
      ...flow,
      redirectUri: this.redirectUri(provider),
    });
  }

  async callback(
    provider: OAuthProvider,
    query: OAuthCallbackQueryDto,
    request: Request,
    response: Response,
  ): Promise<string> {
    try {
      const client = this.client(provider);
      const flow = await this.oauthStateService.complete(
        request,
        response,
        provider,
        query.state,
      );
      if (query.error) {
        throw new OAuthFlowError(
          'cancelled',
          query.error_description ?? query.error,
        );
      }
      if (!query.code) {
        throw new OAuthFlowError('exchange_failed', 'No authorization code');
      }

      const profile = await client.exchange({
        code: query.code,
        redirectUri: this.redirectUri(provider),
        nonce: flow.nonce,
        codeVerifier: flow.codeVerifier,
      });
      const user = await this.oauthAccountService.resolveUser(provider, profile);
      this.authSessionService.setAuthCookies(
        response,
        await this.authSessionService.createSession(user.id, request),
      );
      await this.userService.updateLastLogin(user.id);
      return `${this.frontendUrl}${flow.next ?? DEFAULT_NEXT}`;
    } catch (error) {
      const code =
        error instanceof OAuthFlowError ? error.code : 'exchange_failed';
      if (code !== 'cancelled') {
        this.logger.warn(
          `${provider} sign-in failed: ${(error as Error).message}`,
        );
      }
      const params = new URLSearchParams({ error: code, provider });
      return `${this.frontendUrl}/login?${params}`;
    }
  }

  private client(provider: OAuthProvider): OAuthProviderClient {
    const client = this.clients[provider];
    if (!client.isEnabled()) {
      throw new AppException({
        status: HttpStatus.NOT_FOUND,
        code: ApiErrorCode.AUTH_PROVIDER_DISABLED,
        reason: { code: ApiErrorReasonCode.AUTH_PROVIDER_DISABLED, provider },
      });
    }
    return client;
  }

  private redirectUri(provider: OAuthProvider): string {
    return `${this.frontendUrl}/api/auth/oauth/${provider}/callback`;
  }
}
