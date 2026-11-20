import type { ReactNode } from 'react';
import { Logo } from '@/shared/ui';

export function AuthHeader({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Logo />
      <h1 className="m-0 text-[28px] leading-8 font-medium tracking-xl sm:text-title">{title}</h1>
      <p className="m-0 text-body text-muted-foreground">{description}</p>
    </div>
  );
}
