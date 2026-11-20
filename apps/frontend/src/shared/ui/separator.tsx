import type { ReactNode } from 'react';

export function Separator({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[15px] text-muted-foreground" role="separator">
      <span aria-hidden className="h-px flex-1 bg-border" />
      {children}
      {children && <span aria-hidden className="h-px flex-1 bg-border" />}
    </div>
  );
}
