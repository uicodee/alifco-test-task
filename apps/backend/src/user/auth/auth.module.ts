import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSessionService } from '@/user/auth/auth-session.service';
import { AuthController } from '@/user/auth/auth.controller';
import { AuthService } from '@/user/auth/auth.service';
import { LoginSession } from '@/user/auth/entities/login-session.entity';
import { JwtRefreshGuard } from '@/user/auth/guards/jwt-refresh.guard';
import { PasswordService } from '@/user/auth/password.service';
import { JwtRefreshStrategy } from '@/user/auth/strategies/jwt-refresh.strategy';
import { JwtStrategy } from '@/user/auth/strategies/jwt.strategy';
import { UserCoreModule } from '@/user/user/user.module';

@Module({
  imports: [
    UserCoreModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([LoginSession]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthSessionService,
    PasswordService,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtRefreshGuard,
  ],
  exports: [AuthService, AuthSessionService, JwtModule],
})
export class AuthModule {}
