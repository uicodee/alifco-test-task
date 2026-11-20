import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsAccountPassword } from '@/common/validators/password.validator';

export class SetPasswordDto {
  @ApiPropertyOptional({
    maxLength: 128,
    description: 'Required when the account already has a password',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  currentPassword?: string;

  @IsAccountPassword(
    'The new password: at least 8 characters, with a letter and a digit',
  )
  newPassword: string;
}
