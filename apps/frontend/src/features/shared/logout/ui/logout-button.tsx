'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/shared/api/generated/auth/auth';
import { ROUTES } from '@/shared/config';
import { Button, Spinner } from '@/shared/ui';

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useMutation({
    mutationFn: () => getAuth().authLogout(),
    onSettled: () => {
      queryClient.clear();
      router.replace(ROUTES.login);
      router.refresh();
    },
  });

  return (
    <Button variant="secondary" size="sm" disabled={logout.isPending} onClick={() => logout.mutate()}>
      {logout.isPending && <Spinner size={16} />}
      Выйти
    </Button>
  );
}
