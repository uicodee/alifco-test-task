import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ApiErrorResponseDto } from '@/common/errors/api-error-response.dto';
import { Public } from '@/user/auth/decorators/public.decorator';
import {
  ApiOAuthCallbackQuery,
  OAuthCallbackQuery,
} from '@/user/oauth/decorators/oauth-callback-query.decorator';
import { AuthProvidersDto } from '@/user/oauth/dto/auth-providers.dto';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import { OAuthCallbackQueryDto } from '@/user/oauth/dto/oauth-callback-query.dto';
import { OAuthStartQueryDto } from '@/user/oauth/dto/oauth-start-query.dto';
import { OAuthService } from '@/user/oauth/oauth.service';

const OAUTH_LIMIT = { default: { limit: 20, ttl: 60 * 1000 } };

const ProviderParam = () =>
  ApiParam({ name: 'provider', enum: OAuthProvider, enumName: 'OAuthProvider' });

@ApiTags('oauth')
@Public()
@Controller('auth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Which social sign-in providers are configured' })
  @ApiOkResponse({ type: AuthProvidersDto })
  providers(): AuthProvidersDto {
    return this.oauthService.enabledProviders();
  }

  @Get('oauth/:provider')
  @UseGuards(ThrottlerGuard)
  @Throttle(OAUTH_LIMIT)
  @ProviderParam()
  @ApiOperation({ summary: 'Start social sign-in: redirects to the provider' })
  @ApiFoundResponse({ description: "Redirect to the provider's consent page" })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'AUTH_PROVIDER_DISABLED' })
  async start(
    @Param('provider', new ParseEnumPipe(OAuthProvider)) provider: OAuthProvider,
    @Query() query: OAuthStartQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    response.redirect(302, await this.oauthService.start(provider, response, query.next));
  }

  @Get('oauth/:provider/callback')
  @UseGuards(ThrottlerGuard)
  @Throttle(OAUTH_LIMIT)
  @ProviderParam()
  @ApiOAuthCallbackQuery()
  @ApiOperation({ summary: 'Provider redirect target: signs in and redirects to the app' })
  @ApiFoundResponse({
    description: 'Redirect to the app, or to /login?error=<code>&provider=<provider>',
  })
  async callback(
    @Param('provider', new ParseEnumPipe(OAuthProvider)) provider: OAuthProvider,
    @OAuthCallbackQuery() query: OAuthCallbackQueryDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    response.redirect(
      302,
      await this.oauthService.callback(provider, query, request, response),
    );
  }
}
