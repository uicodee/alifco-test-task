import type { Metadata } from 'next';
import { AuthPage, getSafeAuthAfter } from '@/features/shared/auth';
import { getServerAuthProviders } from '@/shared/lib/server-auth';

export const metadata: Metadata = { title: 'Регистрация' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <AuthPage mode="register" providers={await getServerAuthProviders()} after={getSafeAuthAfter(params.next)} />
  );
}
