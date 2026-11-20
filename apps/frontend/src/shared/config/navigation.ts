export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  account: '/account',
} as const;

export const PROTECTED_ROUTES: readonly string[] = [ROUTES.account];

export const GUEST_ROUTES: readonly string[] = [ROUTES.login, ROUTES.register];

export const SESSION_HINT_COOKIE = 'signed_in';
