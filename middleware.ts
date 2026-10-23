import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_PATH } from '@/constants/routes';

const ACCESS_TOKEN_COOKIE = 'adminAccessToken';
const LOGIN_PATH = '/login';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has(ACCESS_TOKEN_COOKIE);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(DEFAULT_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
