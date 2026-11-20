import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_COOKIE } from '@/user/auth/auth-session.service';
import type {
  JwtRefreshPayload,
  RefreshAuthenticatedUser,
} from '@/user/auth/dto/tokens.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[REFRESH_TOKEN_COOKIE] || null,
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(
    request: Request,
    payload: JwtRefreshPayload,
  ): RefreshAuthenticatedUser {
    return {
      id: payload.sub,
      sessionId: payload.sid,
      refreshToken: request.cookies[REFRESH_TOKEN_COOKIE],
    };
  }
}
