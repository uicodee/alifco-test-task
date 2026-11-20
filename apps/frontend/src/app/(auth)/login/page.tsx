import type { Metadata } from 'next';
import { AuthPage, getOAuthErrorMessage, getSafeAuthAfter } from '@/features/shared/auth';
import { getServerAuthProviders } from '@/shared/lib/server-auth';

export const metadata: Metadata = { title: 'Вход' };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <AuthPage
      mode="login"
      providers={await getServerAuthProviders()}
      after={getSafeAuthAfter(params.next)}
      oauthError={getOAuthErrorMessage(first(params.error), first(params.provider))}
    />
  );
}
