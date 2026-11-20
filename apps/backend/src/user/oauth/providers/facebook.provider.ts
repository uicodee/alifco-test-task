import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import type { BackendEnv } from '@/shared/config/env';
import { OAuthProvider } from '@/user/oauth/dto/enums.dto';
import {
  AuthorizationParams,
  ExchangeParams,
  OAuthFlowError,
  OAuthProfile,
  OAuthProviderClient,
} from '@/user/oauth/providers/oauth-provider.interface';

const GRAPH_VERSION = 'v23.0';
const DIALOG_URL = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`;
const GRAPH_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

interface FacebookMe {
  id: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string; is_silhouette?: boolean } };
}

@Injectable()
export class FacebookProvider implements OAuthProviderClient {
  readonly id = OAuthProvider.FACEBOOK;

  constructor(private readonly config: ConfigService<BackendEnv, true>) {}

  private get appId() {
    return this.config.get('FACEBOOK_APP_ID', { infer: true });
  }

  private get appSecret() {
    return this.config.get('FACEBOOK_APP_SECRET', { infer: true });
  }

  isEnabled() {
    return !!this.appId && !!this.appSecret;
  }

  buildAuthorizationUrl(p: AuthorizationParams) {
    const params = new URLSearchParams({
      client_id: this.appId!,
      redirect_uri: p.redirectUri,
      response_type: 'code',
      scope: 'public_profile,email',
      state: p.state,
    });
    return `${DIALOG_URL}?${params}`;
  }

  async exchange(p: ExchangeParams): Promise<OAuthProfile> {
    const tokenUrl = new URL(`${GRAPH_URL}/oauth/access_token`);
    tokenUrl.search = new URLSearchParams({
      client_id: this.appId!,
      client_secret: this.appSecret!,
      redirect_uri: p.redirectUri,
      code: p.code,
    }).toString();
    const tokenRes = await fetch(tokenUrl, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (!tokenRes?.ok) {
      throw new OAuthFlowError('exchange_failed', `Facebook token exchange failed (${tokenRes?.status})`);
    }
    const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
    if (!accessToken) throw new OAuthFlowError('exchange_failed', 'Facebook returned no access_token');

    const meUrl = new URL(`${GRAPH_URL}/me`);
    meUrl.search = new URLSearchParams({
      fields: 'id,name,email,picture.width(256).height(256)',
      access_token: accessToken,
      appsecret_proof: createHmac('sha256', this.appSecret!).update(accessToken).digest('hex'),
    }).toString();
    const meRes = await fetch(meUrl, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (!meRes?.ok) throw new OAuthFlowError('profile_failed', `Facebook /me failed (${meRes?.status})`);
    const me = (await meRes.json()) as FacebookMe;
    if (!me.id) throw new OAuthFlowError('profile_failed', 'Facebook profile has no id');

    const picture = me.picture?.data;
    return {
      providerUserId: me.id,
      email: me.email?.toLowerCase() ?? null,
      emailVerified: !!me.email,
      name: me.name || 'Facebook user',
      avatarUrl: picture?.url && !picture.is_silhouette ? picture.url : null,
    };
  }
}
