'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { ContrastIcon, cn } from '@/shared/ui';

const noop = () => () => {};

const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export function ThemeSwitcher({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className={cn(
        'flex size-11 items-center justify-center rounded-pill text-muted-foreground pressable hover:bg-background/60 hover:text-foreground',
        className,
      )}
      aria-label={mounted ? (next === 'dark' ? 'Включить тёмную тему' : 'Включить светлую тему') : 'Сменить тему'}
      onClick={() => setTheme(next)}
    >
      <ContrastIcon size={22} />
    </button>
  );
}
