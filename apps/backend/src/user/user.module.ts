import { Module } from '@nestjs/common';
import { AuthModule } from '@/user/auth/auth.module';
import { OAuthModule } from '@/user/oauth/oauth.module';
import { UserCoreModule } from '@/user/user/user.module';

@Module({
  imports: [AuthModule, OAuthModule, UserCoreModule],
  exports: [AuthModule, UserCoreModule],
})
export class UserDomainModule {}
