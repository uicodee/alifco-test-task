import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES, SESSION_HINT_COOKIE } from '@/shared/config';

export default async function HomePage() {
  const signedIn = (await cookies()).has(SESSION_HINT_COOKIE);
  redirect(signedIn ? ROUTES.account : ROUTES.login);
}
