import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createPublicKey, type JsonWebKey } from 'crypto';
import { OAuthFlowError } from '@/user/oauth/providers/oauth-provider.interface';

interface Jwk extends JsonWebKey {
  kid?: string;
  kty: string;
}

export interface IdTokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  nonce?: string;
  email?: string;
  email_verified?: boolean | 'true' | 'false';
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
}

const JWKS_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OidcTokenVerifier {
  private readonly cache = new Map<string, { keys: Jwk[]; expiresAt: number }>();

  constructor(private readonly jwt: JwtService) {}

  async verify(
    idToken: string,
    opts: { jwksUrl: string; issuers: string[]; audience: string; nonce: string },
  ): Promise<IdTokenClaims> {
    const [headerPart] = idToken.split('.');
    let header: { alg?: string; kid?: string };
    try {
      header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
    } catch {
      throw new OAuthFlowError('token_invalid', 'Malformed ID token');
    }
    if (header.alg !== 'RS256') {
      throw new OAuthFlowError('token_invalid', `Unsupported ID token algorithm ${header.alg}`);
    }

    const jwk = await this.findKey(opts.jwksUrl, header.kid);
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' })
      .export({ type: 'spki', format: 'pem' })
      .toString();

    let claims: IdTokenClaims;
    try {
      claims = await this.jwt.verifyAsync<IdTokenClaims>(idToken, {
        secret: publicKey,
        algorithms: ['RS256'],
        issuer: opts.issuers as [string, ...string[]],
        audience: opts.audience,
      });
    } catch (e) {
      throw new OAuthFlowError('token_invalid', `ID token rejected: ${(e as Error).message}`);
    }
    if (!claims.sub || claims.nonce !== opts.nonce) {
      throw new OAuthFlowError('token_invalid', 'ID token nonce mismatch');
    }
    return claims;
  }

  private async findKey(url: string, kid?: string): Promise<Jwk> {
    let keys = await this.keys(url);
    let key = kid ? keys.find((k) => k.kid === kid) : keys[0];
    if (!key && kid) {
      keys = await this.keys(url, true);
      key = keys.find((k) => k.kid === kid);
    }
    if (!key) throw new OAuthFlowError('token_invalid', `No signing key ${kid}`);
    return key;
  }

  private async keys(url: string, force = false): Promise<Jwk[]> {
    const cached = this.cache.get(url);
    if (!force && cached && cached.expiresAt > Date.now()) return cached.keys;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (!res?.ok) throw new OAuthFlowError('token_invalid', 'Could not fetch signing keys');
    const body = (await res.json()) as { keys?: Jwk[] };
    const keys = body.keys ?? [];
    this.cache.set(url, { keys, expiresAt: Date.now() + JWKS_TTL_MS });
    return keys;
  }
}

export async function postTokenRequest<T>(
  url: string,
  body: Record<string, string>,
  headers: Record<string, string> = {},
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', ...headers },
    body: new URLSearchParams(body),
  }).catch(() => null);
  if (!res) throw new OAuthFlowError('exchange_failed', `Token endpoint unreachable: ${url}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new OAuthFlowError('exchange_failed', `Token endpoint ${res.status}: ${text.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}
