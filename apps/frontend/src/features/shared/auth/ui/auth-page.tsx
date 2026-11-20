import { getEnabledProviders } from '@/features/shared/auth/oauth';
import { LoginForm } from '@/features/shared/auth/login';
import { RegisterForm } from '@/features/shared/auth/register';
import { AlternativeSignIn } from '@/features/shared/auth/ui/alternative-sign-in';
import { AuthFooter } from '@/features/shared/auth/ui/auth-footer';
import { AuthHeader } from '@/features/shared/auth/ui/auth-header';
import type { AuthProvidersDto } from '@/shared/api/model';

const COPY = {
  login: {
    title: 'Вход',
    social: 'Через соцсеть или по email и паролю.',
    email: 'По email и паролю.',
  },
  register: {
    title: 'Создайте аккаунт',
    social: 'В один шаг через соцсеть или по email и паролю.',
    email: 'По email и паролю.',
  },
};

export function AuthPage({
  mode,
  providers,
  after,
  oauthError,
}: {
  mode: 'login' | 'register';
  providers: AuthProvidersDto;
  after: string;
  oauthError?: string | null;
}) {
  const copy = COPY[mode];
  const hasProviders = getEnabledProviders(providers).length > 0;
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-32 bg-background p-6 shadow-card sm:p-8">
      <AuthHeader title={copy.title} description={hasProviders ? copy.social : copy.email} />
      <AlternativeSignIn providers={providers} after={after} mode={mode} error={oauthError} />
      {mode === 'login' ? <LoginForm after={after} /> : <RegisterForm after={after} />}
      <AuthFooter mode={mode} after={after} />
    </div>
  );
}
