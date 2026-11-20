import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthGuard } from '@/features/shared/auth';
import { Header } from '@/widgets/header';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted">
      <Header />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 px-4 pt-6 pb-12 sm:px-5">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}
