import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AppException } from '@/common/errors/app-exception';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';
import { AuthSessionService } from '@/user/auth/auth-session.service';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private readonly authSessionService: AuthSessionService) {
    super();
  }

  override handleRequest<TUser>(
    error: unknown,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (error || !user) {
      this.authSessionService.clearAuthCookies(
        context.switchToHttp().getResponse<Response>(),
      );
      throw new AppException({
        status: HttpStatus.UNAUTHORIZED,
        code: ApiErrorCode.AUTH_SESSION_EXPIRED,
        reason: { code: ApiErrorReasonCode.AUTH_SESSION_EXPIRED },
      });
    }
    return user;
  }
}
