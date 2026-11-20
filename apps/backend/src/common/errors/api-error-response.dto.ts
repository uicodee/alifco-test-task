import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApiErrorCode,
  ApiErrorReasonCode,
} from '@/common/errors/api-error-codes';

export class ApiErrorReasonDto {
  @ApiProperty({
    enum: Object.values(ApiErrorReasonCode),
    enumName: 'ApiErrorReasonCode',
  })
  code: ApiErrorReasonCode;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ enum: Object.values(ApiErrorCode), enumName: 'ApiErrorCode' })
  code: ApiErrorCode;

  @ApiProperty({ type: ApiErrorReasonDto })
  reason: ApiErrorReasonDto;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
    example: { email: ['email must be an email'] },
  })
  fieldErrors?: Record<string, string[]>;

  @ApiPropertyOptional({ example: '/api/auth/login' })
  path?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  timestamp?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  response_id?: string;
}
