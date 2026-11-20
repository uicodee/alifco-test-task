import type { Metadata, Viewport } from 'next';
import { Google_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { getServerAuthUser } from '@/shared/lib/server-auth';
import { Providers } from './providers';
import './global.css';

const fontFamily = Google_Sans({
  variable: '--font-google-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Alifco Auth', template: '%s · Alifco Auth' },
  description: 'Вход через Google, Facebook, Telegram или по email.',
  icons: { icon: 'data:,' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialUser = await getServerAuthUser();
  return (
    <html lang="ru" className={fontFamily.variable} suppressHydrationWarning>
      <body>
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
