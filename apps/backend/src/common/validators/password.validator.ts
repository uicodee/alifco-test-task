import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const IsAccountPassword = (
  description = 'At least 8 characters, with a letter and a digit',
) =>
  applyDecorators(
    ApiProperty({
      minLength: 8,
      maxLength: 128,
      description,
      example: 'correct-horse-7',
    }),
    IsString(),
    MinLength(8),
    MaxLength(128),
    Matches(/(?=.*\p{L})(?=.*\d)/u, {
      message: 'password must contain a letter and a digit',
    }),
  );
