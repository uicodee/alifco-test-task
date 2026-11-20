'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { getAuthPagePath } from '@/features/shared/auth/model/auth-redirect';
import { useAuth } from '@/shared/providers';
import { Button, Spinner } from '@/shared/ui';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, error, refetch } = useAuth();
  const signedOut = !isLoading && !error && !user;

  useEffect(() => {
    if (signedOut) router.replace(getAuthPagePath('login', pathname));
  }, [signedOut, router, pathname]);

  if (user) return children;

  if (error) {
    return (
      <section className="flex flex-col items-start gap-4 rounded-32 bg-background p-6 sm:p-8" role="alert">
        <h2 className="m-0 text-section">Не удалось загрузить аккаунт</h2>
        <p className="m-0 text-body text-muted-foreground">
          Сервер не ответил. Проверьте интернет: ваша сессия в порядке.
        </p>
        <Button size="sm" onClick={() => refetch()}>
          Попробовать снова
        </Button>
      </section>
    );
  }

  return (
    <section
      className="flex items-center justify-center gap-3 rounded-32 bg-background p-10 text-muted-foreground"
      aria-live="polite"
    >
      <Spinner /> Загружаем аккаунт…
    </section>
  );
}
