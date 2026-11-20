import type { ReactNode } from 'react';
import { cn } from './utils';

export function Alert({
  children,
  variant = 'error',
  className,
}: {
  children: ReactNode;
  variant?: 'error' | 'success';
  className?: string;
}) {
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'm-0 animate-fade-in rounded-16 px-4 py-3 text-[15px] leading-[21px]',
        variant === 'error' ? 'bg-danger-bg text-danger-fg' : 'bg-success-bg text-success-fg',
        className,
      )}
    >
      {children}
    </p>
  );
}
