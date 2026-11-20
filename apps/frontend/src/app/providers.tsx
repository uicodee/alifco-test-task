'use client';

import type { ReactNode } from 'react';
import type { UserDto } from '@/shared/api/model';
import { AuthProvider, QueryProvider, ThemeProvider } from '@/shared/providers';

export function Providers({ children, initialUser }: { children: ReactNode; initialUser?: UserDto | null }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
