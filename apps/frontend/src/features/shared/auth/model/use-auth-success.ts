'use client';

import { useRouter } from 'next/navigation';
import type { AuthResponseDto } from '@/shared/api/model';
import { useAuth } from '@/shared/providers';

export function useAuthSuccess(after: string) {
  const router = useRouter();
  const { setUser } = useAuth();
  return ({ user }: AuthResponseDto) => {
    setUser(user);
    router.replace(after);
    router.refresh();
  };
}
