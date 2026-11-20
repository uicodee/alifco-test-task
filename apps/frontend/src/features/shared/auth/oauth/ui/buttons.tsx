'use client';

import { useEffect, useState } from 'react';
import {
  getEnabledProviders,
  getOAuthStartUrl,
} from '@/features/shared/auth/oauth/model/providers';
import type { AuthProvidersDto } from '@/shared/api/model';
import { buttonVariants, cn, Spinner } from '@/shared/ui';

export function OAuthButtons({
  providers,
  after,
  mode,
}: {
  providers: AuthProvidersDto;
  after: string;
  mode: 'login' | 'register';
}) {
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setPending(null);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const list = getEnabledProviders(providers);
  if (!list.length) return null;

  const verb = mode === 'register' ? 'Зарегистрироваться' : 'Войти';
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-3">
      {list.map(({ id, label, Logo }) => (
        <a
          key={id}
          href={getOAuthStartUrl(id, after)}
          aria-label={`${verb} через ${label}`}
          aria-disabled={(pending !== null && pending !== id) || undefined}
          onClick={() => setPending(id)}
          className={cn(buttonVariants({ variant: 'outline', size: 'md' }), 'min-w-0 gap-1.5 px-2')}
        >
          {pending === id ? <Spinner size={20} /> : <Logo size={20} />}
          <span className="hidden truncate sm:inline">{label}</span>
        </a>
      ))}
    </div>
  );
}
