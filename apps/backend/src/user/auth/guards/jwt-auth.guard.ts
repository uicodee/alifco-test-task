import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AppException } from '@/common/errors/app-exception';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';
import { IS_PUBLIC_KEY } from '@/user/auth/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser>(error: unknown, user: TUser): TUser {
    if (error instanceof AppException) {
      throw error;
    }
    if (error || !user) {
      throw new AppException({
        status: HttpStatus.UNAUTHORIZED,
        code: ApiErrorCode.UNAUTHORIZED,
        reason: { code: ApiErrorReasonCode.UNAUTHORIZED },
      });
    }
    return user;
  }
}
