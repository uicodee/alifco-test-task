import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ApiErrorResponseDto } from '@/common/errors/api-error-response.dto';
import {
  AuthSessionService,
  REFRESH_TOKEN_COOKIE,
} from '@/user/auth/auth-session.service';
import { AuthService } from '@/user/auth/auth.service';
import { CurrentUser } from '@/user/auth/decorators/current-user.decorator';
import { Public } from '@/user/auth/decorators/public.decorator';
import { AuthResponseDto } from '@/user/auth/dto/auth-response.dto';
import { LoginDto } from '@/user/auth/dto/login.dto';
import { RegisterDto } from '@/user/auth/dto/register.dto';
import { SetPasswordDto } from '@/user/auth/dto/set-password.dto';
import type {
  AuthenticatedUser,
  RefreshAuthenticatedUser,
} from '@/user/auth/dto/tokens.dto';
import { JwtRefreshGuard } from '@/user/auth/guards/jwt-refresh.guard';
import { UserDto } from '@/user/user/dto/user.dto';
import { UserService } from '@/user/user/user.service';

const STRICT_LIMIT = { default: { limit: 10, ttl: 60 * 1000 } };

@ApiTags('auth')
@ApiCookieAuth('access_token')
@ApiTooManyRequestsResponse({ type: ApiErrorResponseDto })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authSessionService: AuthSessionService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle(STRICT_LIMIT)
  @ApiOperation({ summary: 'Create an account with email and password, and sign in' })
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Signed in: session cookies are set' })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'VALIDATION_FAILED' })
  @ApiConflictResponse({ type: ApiErrorResponseDto, description: 'AUTH_EMAIL_TAKEN' })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.register(dto);
    return this.signIn(user.id, request, response);
  }

  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle(STRICT_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'Signed in: session cookies are set' })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'VALIDATION_FAILED' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto, description: 'AUTH_INVALID_CREDENTIALS' })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.login(dto);
    return this.signIn(user.id, request, response);
  }

  @Public()
  @Post('refresh')
  @UseGuards(ThrottlerGuard, JwtRefreshGuard)
  @Throttle({ default: { limit: 30, ttl: 60 * 1000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  @ApiNoContentResponse({ description: 'New session cookies are set' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto, description: 'AUTH_SESSION_EXPIRED' })
  async refresh(
    @CurrentUser() user: RefreshAuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    try {
      const tokens = await this.authSessionService.rotateSession(
        user.id,
        user.sessionId,
        user.refreshToken,
      );
      this.authSessionService.setAuthCookies(response, tokens);
    } catch (error) {
      this.authSessionService.clearAuthCookies(response);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sign out on this device' })
  @ApiNoContentResponse({ description: 'Session revoked and cookies cleared' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authSessionService.revokeByRefreshToken(
      request.cookies?.[REFRESH_TOKEN_COOKIE],
    );
    this.authSessionService.clearAuthCookies(response);
  }

  @Get('me')
  @ApiOperation({ summary: 'The signed-in user' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto, description: 'UNAUTHORIZED' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserDto> {
    return this.userService.getProfile(user.id);
  }

  @Post('password')
  @UseGuards(ThrottlerGuard)
  @Throttle(STRICT_LIMIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set a password on the account, or change it',
    description:
      'Accounts created with Google or Facebook have no password: this adds one, so they can also sign in ' +
      'with email and password. Changing an existing password requires `currentPassword`. ' +
      'Every other session of the user is ended; this device stays signed in.',
  })
  @ApiOkResponse({ type: UserDto, description: 'The user, now with `hasPassword: true`' })
  @ApiUnprocessableEntityResponse({ type: ApiErrorResponseDto, description: 'VALIDATION_FAILED' })
  @ApiBadRequestResponse({
    type: ApiErrorResponseDto,
    description:
      'AUTH_CURRENT_PASSWORD_REQUIRED, AUTH_CURRENT_PASSWORD_INVALID or AUTH_EMAIL_REQUIRED',
  })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto, description: 'UNAUTHORIZED' })
  async setPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetPasswordDto,
  ): Promise<UserDto> {
    await this.authService.setPassword(user.id, user.sessionId, dto);
    return this.userService.getProfile(user.id);
  }

  private async signIn(
    userId: string,
    request: Request,
    response: Response,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authSessionService.createSession(userId, request);
    this.authSessionService.setAuthCookies(response, tokens);
    await this.userService.updateLastLogin(userId);
    return { user: await this.userService.getProfile(userId) };
  }
}
