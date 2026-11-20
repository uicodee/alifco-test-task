import type { Metadata } from 'next';
import { AccountContent } from './account-content';

export const metadata: Metadata = { title: 'Аккаунт' };

export default function AccountPage() {
  return <AccountContent />;
}
