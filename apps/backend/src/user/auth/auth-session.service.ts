import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { CookieOptions, Request, Response } from 'express';
import { IsNull, Not, Repository } from 'typeorm';
import { AppException } from '@/common/errors/app-exception';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';
import {
  durationToMs,
  durationToSeconds,
} from '@/shared/common/utils/duration';
import type {
  JwtPayload,
  JwtRefreshPayload,
  SessionTokens,
} from '@/user/auth/dto/tokens.dto';
import { LoginSession } from '@/user/auth/entities/login-session.entity';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const SESSION_HINT_COOKIE = 'signed_in';
const REFRESH_TOKEN_COOKIE_PATH = '/api/auth';
const ROTATION_GRACE_MS = 30_000;

const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

const sameHash = (a: string, b: string) =>
  timingSafeEqual(Buffer.from(a), Buffer.from(b));

@Injectable()
export class AuthSessionService {
  constructor(
    @InjectRepository(LoginSession)
    private readonly sessionRepository: Repository<LoginSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(userId: string, request: Request): Promise<SessionTokens> {
    const session = await this.sessionRepository.save(
      this.sessionRepository.create({
        userId,
        refreshTokenHash: sha256(randomBytes(32).toString('hex')),
        userAgent: request.headers['user-agent']?.slice(0, 512) ?? null,
        ipAddress: request.ip?.slice(0, 64) ?? null,
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      }),
    );
    const refreshToken = await this.signRefreshToken(userId, session.id);
    await this.sessionRepository.update(session.id, {
      refreshTokenHash: sha256(refreshToken),
    });
    return {
      accessToken: await this.signAccessToken(userId, session.id),
      refreshToken,
    };
  }

  async rotateSession(
    userId: string,
    sessionId: string,
    refreshToken: string,
  ): Promise<SessionTokens> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now()
    ) {
      throw this.sessionExpired();
    }

    const presented = sha256(refreshToken);
    if (!sameHash(presented, session.refreshTokenHash)) {
      const rotatedRecently =
        session.previousRefreshTokenHash &&
        sameHash(presented, session.previousRefreshTokenHash) &&
        session.rotatedAt &&
        Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS;
      if (rotatedRecently) {
        return { accessToken: await this.signAccessToken(userId, session.id) };
      }
      await this.sessionRepository.update(session.id, { revokedAt: new Date() });
      throw this.sessionExpired();
    }

    const nextRefreshToken = await this.signRefreshToken(userId, session.id);
    const result = await this.sessionRepository.update(
      {
        id: session.id,
        refreshTokenHash: session.refreshTokenHash,
        revokedAt: IsNull(),
      },
      {
        refreshTokenHash: sha256(nextRefreshToken),
        previousRefreshTokenHash: session.refreshTokenHash,
        rotatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
      },
    );
    if (!result.affected) {
      return { accessToken: await this.signAccessToken(userId, session.id) };
    }
    return {
      accessToken: await this.signAccessToken(userId, session.id),
      refreshToken: nextRefreshToken,
    };
  }

  async assertActiveSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
      select: ['id', 'revokedAt', 'expiresAt'],
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() < Date.now()
    ) {
      throw new AppException({
        status: HttpStatus.UNAUTHORIZED,
        code: ApiErrorCode.AUTH_TOKEN_INVALID,
        reason: { code: ApiErrorReasonCode.AUTH_TOKEN_INVALID },
      });
    }
  }

  async revokeByRefreshToken(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          ignoreExpiration: true,
        },
      );
      await this.sessionRepository.update(
        { id: payload.sid, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    } catch {
      return;
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeOtherSessions(userId: string, keepSessionId: string): Promise<void> {
    await this.sessionRepository.update(
      { userId, revokedAt: IsNull(), id: Not(keepSessionId) },
      { revokedAt: new Date() },
    );
  }

  setAuthCookies(response: Response, tokens: SessionTokens): void {
    const options = this.cookieOptions();
    response.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...options,
      path: '/',
      maxAge: durationToMs(this.configService.getOrThrow('JWT_ACCESS_EXPIRATION')),
    });
    if (tokens.refreshToken) {
      response.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
        ...options,
        path: REFRESH_TOKEN_COOKIE_PATH,
        maxAge: this.refreshTtlMs,
      });
      response.cookie(SESSION_HINT_COOKIE, '1', {
        ...options,
        httpOnly: false,
        path: '/',
        maxAge: this.refreshTtlMs,
      });
    }
  }

  clearAuthCookies(response: Response): void {
    const options = this.cookieOptions();
    response.clearCookie(ACCESS_TOKEN_COOKIE, { ...options, path: '/' });
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...options,
      path: REFRESH_TOKEN_COOKIE_PATH,
    });
    response.clearCookie(SESSION_HINT_COOKIE, {
      ...options,
      httpOnly: false,
      path: '/',
    });
  }

  private get refreshTtlMs(): number {
    return durationToMs(this.configService.getOrThrow('JWT_REFRESH_EXPIRATION'));
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      sameSite: 'lax',
    };
  }

  private signAccessToken(userId: string, sessionId: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, sid: sessionId };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: durationToSeconds(
        this.configService.getOrThrow('JWT_ACCESS_EXPIRATION'),
      ),
    });
  }

  private signRefreshToken(userId: string, sessionId: string): Promise<string> {
    const payload: JwtRefreshPayload = {
      sub: userId,
      sid: sessionId,
      jti: randomBytes(16).toString('hex'),
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: durationToSeconds(
        this.configService.getOrThrow('JWT_REFRESH_EXPIRATION'),
      ),
    });
  }

  private sessionExpired() {
    return new AppException({
      status: HttpStatus.UNAUTHORIZED,
      code: ApiErrorCode.AUTH_SESSION_EXPIRED,
      reason: { code: ApiErrorReasonCode.AUTH_SESSION_EXPIRED },
    });
  }
}
