import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  ACCESS_TOKEN_COOKIE,
  AuthSessionService,
} from '@/user/auth/auth-session.service';
import type {
  AuthenticatedUser,
  JwtPayload,
} from '@/user/auth/dto/tokens.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.[ACCESS_TOKEN_COOKIE] || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    await this.authSessionService.assertActiveSession(payload.sub, payload.sid);
    return { id: payload.sub, sessionId: payload.sid };
  }
}
