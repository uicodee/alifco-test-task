import { ApiProperty } from '@nestjs/swagger';

export class AuthProvidersDto {
  @ApiProperty({ description: 'Google sign-in is configured' })
  google: boolean;

  @ApiProperty({ description: 'Facebook sign-in is configured' })
  facebook: boolean;

  @ApiProperty({ description: 'Telegram sign-in is configured' })
  telegram: boolean;
}
