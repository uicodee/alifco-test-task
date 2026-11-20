import { getEnabledProviders, OAuthButtons } from '@/features/shared/auth/oauth';
import type { AuthProvidersDto } from '@/shared/api/model';
import { Alert, Separator } from '@/shared/ui';

export function AlternativeSignIn({
  providers,
  after,
  mode,
  error,
}: {
  providers: AuthProvidersDto;
  after: string;
  mode: 'login' | 'register';
  error?: string | null;
}) {
  const hasProviders = getEnabledProviders(providers).length > 0;
  if (!hasProviders && !error) return null;
  return (
    <div className="flex flex-col gap-4">
      <OAuthButtons providers={providers} after={after} mode={mode} />
      {error && <Alert>{error}</Alert>}
      {hasProviders && <Separator>или по email</Separator>}
    </div>
  );
}
