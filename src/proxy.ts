import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = [
  '/dashboard',
  '/members',
  '/newcomers',
  '/follow-up',
  '/attendance',
  '/finances',
  '/departments',
  '/messages',
  '/reports',
  '/settings',
  '/wallet',
  '/ai-assistant',
];

const AUTH_PATHS = ['/login', '/signup'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inject country header for pricing page (provider-specific geo)
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    'US';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-country', country);

  const session = request.cookies.get('session');

  // Block unauthenticated users from protected routes → redirect to /login
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent logged-in users from accessing /login or /signup → redirect to /dashboard
  if (AUTH_PATHS.includes(pathname) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};

