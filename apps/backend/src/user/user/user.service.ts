import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppException } from '@/common/errors/app-exception';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';
import { UserDto } from '@/user/user/dto/user.dto';
import { User } from '@/user/user/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  findByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
  }

  async getProfile(id: string): Promise<UserDto> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.oauthAccounts', 'oauthAccount')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new AppException({
        status: HttpStatus.NOT_FOUND,
        code: ApiErrorCode.USER_NOT_FOUND,
        reason: { code: ApiErrorReasonCode.USER_NOT_FOUND },
      });
    }
    return UserDto.from({ ...user, hasPassword: !!user.passwordHash });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.userRepository.update(id, { passwordHash });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}
