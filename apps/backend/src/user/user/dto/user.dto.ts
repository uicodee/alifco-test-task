import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance, Transform } from 'class-transformer';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import type { User } from '@/user/user/entities/user.entity';

export class UserDto {
  @Expose()
  @ApiProperty({ format: 'uuid' })
  id: string;

  @Expose()
  @ApiProperty({
    type: String,
    nullable: true,
    format: 'email',
    example: 'ada@example.com',
  })
  email: string | null;

  @Expose()
  @ApiProperty()
  emailVerified: boolean;

  @Expose()
  @ApiProperty({ example: 'Ada Lovelace' })
  name: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true, format: 'uri' })
  avatarUrl: string | null;

  @Expose()
  @ApiProperty({ description: 'Whether email + password sign-in is set up' })
  hasPassword: boolean;

  @Expose()
  @Transform(({ obj }: { obj: User }) =>
    (obj.oauthAccounts ?? []).map((account) => account.provider),
  )
  @ApiProperty({
    enum: OAuthProvider,
    enumName: 'OAuthProvider',
    isArray: true,
    description: 'Social accounts linked to this user',
  })
  providers: OAuthProvider[];

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  static from(user: User & { hasPassword: boolean }): UserDto {
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }
}
