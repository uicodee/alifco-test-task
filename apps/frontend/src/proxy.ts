import { NextResponse, type NextRequest } from 'next/server';
import { GUEST_ROUTES, PROTECTED_ROUTES, ROUTES, SESSION_HINT_COOKIE } from '@/shared/config';

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const signedIn = req.cookies.has(SESSION_HINT_COOKIE);
  const matches = (list: readonly string[]) => list.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!signedIn && matches(PROTECTED_ROUTES)) {
    const url = new URL(ROUTES.login, req.url);
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  if (signedIn && matches(GUEST_ROUTES) && !req.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(new URL(ROUTES.account, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/login', '/register'],
};
