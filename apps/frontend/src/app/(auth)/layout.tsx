import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeSwitcher } from '@/features/shared/theme-switcher';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-muted px-4 pt-18 pb-10 sm:px-5 sm:py-10">
      <ThemeSwitcher className="absolute top-4 right-4" />
      {children}
    </main>
  );
}
