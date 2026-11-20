import 'server-only';

import { cookies } from 'next/headers';
import type { AuthProvidersDto, UserDto } from '@/shared/api/model';
import { getServerApiUrl, SESSION_HINT_COOKIE } from '@/shared/config';

async function getCookieHeader() {
  const store = await cookies();
  return store
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

export async function getServerAuthUser(): Promise<UserDto | null | undefined> {
  const store = await cookies();
  if (!store.has(SESSION_HINT_COOKIE)) return null;

  try {
    const res = await fetch(`${getServerApiUrl()}/api/auth/me`, {
      headers: { Cookie: await getCookieHeader() },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return (await res.json()) as UserDto;
    return undefined;
  } catch {
    return undefined;
  }
}

const NO_PROVIDERS: AuthProvidersDto = { google: false, facebook: false, telegram: false };

export async function getServerAuthProviders(): Promise<AuthProvidersDto> {
  try {
    const res = await fetch(`${getServerApiUrl()}/api/auth/providers`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? ((await res.json()) as AuthProvidersDto) : NO_PROVIDERS;
  } catch {
    return NO_PROVIDERS;
  }
}
