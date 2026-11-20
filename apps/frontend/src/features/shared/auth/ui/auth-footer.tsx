import Link from 'next/link';
import { getAuthPagePath } from '@/features/shared/auth/model/auth-redirect';

export function AuthFooter({ mode, after }: { mode: 'login' | 'register'; after: string }) {
  const target = mode === 'login' ? 'register' : 'login';
  return (
    <p className="m-0 text-center text-[15px] text-muted-foreground">
      {mode === 'login' ? 'Впервые здесь?' : 'Уже есть аккаунт?'}{' '}
      <Link
        href={getAuthPagePath(target, after)}
        className="rounded-12 font-semibold text-foreground underline-offset-4 hover:underline"
      >
        {mode === 'login' ? 'Создать аккаунт' : 'Войти'}
      </Link>
    </p>
  );
}
