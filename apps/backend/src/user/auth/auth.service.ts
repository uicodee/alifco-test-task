import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/common/errors/app-exception';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';
import { AuthSessionService } from '@/user/auth/auth-session.service';
import type { LoginDto } from '@/user/auth/dto/login.dto';
import type { RegisterDto } from '@/user/auth/dto/register.dto';
import type { SetPasswordDto } from '@/user/auth/dto/set-password.dto';
import { PasswordService } from '@/user/auth/password.service';
import { User } from '@/user/user/entities/user.entity';
import { UserService } from '@/user/user/user.service';

const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    if (await this.userService.findByEmail(dto.email)) {
      throw this.emailTaken();
    }
    const passwordHash = await this.passwordService.hash(dto.password);
    try {
      return await this.userRepository.save(
        this.userRepository.create({
          email: dto.email,
          emailVerified: false,
          name: dto.name,
          passwordHash,
          avatarUrl: null,
        }),
      );
    } catch (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw this.emailTaken();
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<User> {
    const user = await this.userService.findByEmailWithPassword(dto.email);
    const valid = await this.passwordService.verify(
      dto.password,
      user?.passwordHash,
    );
    if (!user || !valid) {
      throw new AppException({
        status: HttpStatus.UNAUTHORIZED,
        code: ApiErrorCode.AUTH_INVALID_CREDENTIALS,
        reason: { code: ApiErrorReasonCode.AUTH_INVALID_CREDENTIALS },
      });
    }
    return user;
  }

  async setPassword(
    userId: string,
    sessionId: string,
    dto: SetPasswordDto,
  ): Promise<void> {
    const user = await this.userService.findByIdWithPassword(userId);
    if (!user) {
      throw new AppException({
        status: HttpStatus.NOT_FOUND,
        code: ApiErrorCode.USER_NOT_FOUND,
        reason: { code: ApiErrorReasonCode.USER_NOT_FOUND },
      });
    }
    if (!user.email) {
      throw new AppException({
        status: HttpStatus.BAD_REQUEST,
        code: ApiErrorCode.AUTH_EMAIL_REQUIRED,
        reason: { code: ApiErrorReasonCode.AUTH_EMAIL_REQUIRED },
      });
    }
    if (user.passwordHash) {
      if (!dto.currentPassword) {
        throw new AppException({
          status: HttpStatus.BAD_REQUEST,
          code: ApiErrorCode.AUTH_CURRENT_PASSWORD_REQUIRED,
          reason: { code: ApiErrorReasonCode.AUTH_CURRENT_PASSWORD_REQUIRED },
        });
      }
      const valid = await this.passwordService.verify(
        dto.currentPassword,
        user.passwordHash,
      );
      if (!valid) {
        throw new AppException({
          status: HttpStatus.BAD_REQUEST,
          code: ApiErrorCode.AUTH_CURRENT_PASSWORD_INVALID,
          reason: { code: ApiErrorReasonCode.AUTH_CURRENT_PASSWORD_INVALID },
        });
      }
    }

    await this.userService.updatePasswordHash(
      user.id,
      await this.passwordService.hash(dto.newPassword),
    );
    await this.authSessionService.revokeOtherSessions(user.id, sessionId);
  }

  private emailTaken() {
    return new AppException({
      status: HttpStatus.CONFLICT,
      code: ApiErrorCode.AUTH_EMAIL_TAKEN,
      reason: { code: ApiErrorReasonCode.AUTH_EMAIL_TAKEN },
    });
  }
}
