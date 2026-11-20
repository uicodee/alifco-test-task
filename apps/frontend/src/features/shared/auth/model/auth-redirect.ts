import { ROUTES } from '@/shared/config';

const SAME_SITE_PATH = /^\/(?![/\\])[^\s\\]*$/;

export function getSafeAuthAfter(next: string | string[] | null | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  return value && SAME_SITE_PATH.test(value) ? value : ROUTES.account;
}

export function getAuthPagePath(mode: 'login' | 'register', after: string): string {
  const path = mode === 'login' ? ROUTES.login : ROUTES.register;
  return after === ROUTES.account ? path : `${path}?next=${encodeURIComponent(after)}`;
}
