import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@/user/auth/auth.module';
import { OAuthAccount } from '@/user/oauth/entities/oauth-account.entity';
import { OAuthAccountService } from '@/user/oauth/oauth-account.service';
import { OAuthStateService } from '@/user/oauth/oauth-state.service';
import { OAuthController } from '@/user/oauth/oauth.controller';
import { OAuthService } from '@/user/oauth/oauth.service';
import { FacebookProvider } from '@/user/oauth/providers/facebook.provider';
import { GoogleProvider } from '@/user/oauth/providers/google.provider';
import { OidcTokenVerifier } from '@/user/oauth/providers/oidc-token.verifier';
import { TelegramProvider } from '@/user/oauth/providers/telegram.provider';
import { UserCoreModule } from '@/user/user/user.module';

@Module({
  imports: [AuthModule, UserCoreModule, TypeOrmModule.forFeature([OAuthAccount])],
  controllers: [OAuthController],
  providers: [
    OAuthService,
    OAuthAccountService,
    OAuthStateService,
    OidcTokenVerifier,
    GoogleProvider,
    FacebookProvider,
    TelegramProvider,
  ],
})
export class OAuthModule {}
