import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';
import type { BackendEnv } from '@/shared/config/env';
import type { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import { OAuthFlowError } from '@/user/oauth/providers/oauth-provider.interface';

const TTL_SECONDS = 10 * 60;

interface StatePayload {
  p: OAuthProvider;
  s: string;
  n: string;
  v: string;
  next?: string;
}

export interface StartedFlow {
  state: string;
  nonce: string;
  codeChallenge: string;
}

export interface CompletedFlow {
  nonce: string;
  codeVerifier: string;
  next?: string;
}

@Injectable()
export class OAuthStateService {
  private readonly secure: boolean;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<BackendEnv, true>,
  ) {
    this.secure = this.config.get('NODE_ENV', { infer: true }) === 'production';
  }

  async start(res: Response, provider: OAuthProvider, next?: string): Promise<StartedFlow> {
    const state = randomBytes(24).toString('base64url');
    const nonce = randomBytes(24).toString('base64url');
    const verifier = randomBytes(48).toString('base64url');
    const payload: StatePayload = { p: provider, s: state, n: nonce, v: verifier, next };
    const token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_STATE_SECRET', { infer: true }),
      expiresIn: TTL_SECONDS,
    });
    res.cookie(this.cookieName(provider), token, {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      path: `/api/auth/oauth/${provider}`,
      maxAge: TTL_SECONDS * 1000,
    });
    return {
      state,
      nonce,
      codeChallenge: createHash('sha256').update(verifier).digest('base64url'),
    };
  }

  async complete(
    req: Request,
    res: Response,
    provider: OAuthProvider,
    state: string | undefined,
  ): Promise<CompletedFlow> {
    const name = this.cookieName(provider);
    const token: string | undefined = req.cookies?.[name];
    res.clearCookie(name, { httpOnly: true, secure: this.secure, sameSite: 'lax', path: `/api/auth/oauth/${provider}` });
    if (!token || !state) throw new OAuthFlowError('state_invalid');

    let payload: StatePayload;
    try {
      payload = await this.jwt.verifyAsync<StatePayload>(token, {
        secret: this.config.get('JWT_STATE_SECRET', { infer: true }),
      });
    } catch {
      throw new OAuthFlowError('state_invalid', 'State cookie expired or tampered with');
    }
    const a = Buffer.from(payload.s);
    const b = Buffer.from(state);
    if (payload.p !== provider || a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new OAuthFlowError('state_invalid', 'State mismatch');
    }
    return { nonce: payload.n, codeVerifier: payload.v, next: payload.next };
  }

  private cookieName(provider: OAuthProvider) {
    return `oauth_${provider}`;
  }
}
