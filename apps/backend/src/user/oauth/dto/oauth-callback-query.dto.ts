import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OAuthCallbackQueryDto {
  @ApiPropertyOptional({ description: 'Authorization code' })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  code?: string;

  @ApiPropertyOptional({ description: 'The state value issued by the start endpoint' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  state?: string;

  @ApiPropertyOptional({ description: 'Set when the user cancelled or the provider refused' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  error?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  error_description?: string;
}
