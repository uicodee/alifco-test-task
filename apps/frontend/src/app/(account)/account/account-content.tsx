'use client';

import { useAuth } from '@/shared/providers';
import { ProfileCard } from '@/widgets/profile-card';
import { SignInMethods } from '@/widgets/sign-in-methods';

export function AccountContent() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <h1 className="sr-only">Ваш аккаунт</h1>
      <ProfileCard user={user} />
      <SignInMethods user={user} />
    </>
  );
}
