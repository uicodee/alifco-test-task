import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '@/user/user/dto/user.dto';

export class AuthResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;
}
