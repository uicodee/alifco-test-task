import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class OAuthStartQueryDto {
  @ApiPropertyOptional({
    description: 'Same-site path to return to after signing in',
    example: '/account',
    maxLength: 512,
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  @Matches(/^\/(?![/\\])[^\s\\]*$/, { message: 'next must be a same-site path' })
  next?: string;
}
