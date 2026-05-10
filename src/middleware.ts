import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const tierCookie = request.cookies.get('user_tier');
  const tier = tierCookie?.value;
  const path = request.nextUrl.pathname;

  // Paths that don't need protection
  if (path.startsWith('/login') || path.startsWith('/onboarding') || path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) {
    return NextResponse.next();
  }

  // If no tier cookie
  if (!tier) {
    // Allow /app routes through — local mode users use these without a cookie
    if (path.startsWith('/app')) {
      return NextResponse.next();
    }
    // Redirect everything else (root, /dashboard) to login
    if (path === '/' || path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle Root Path
  if (path === '/') {
    if (tier === 'nu') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  // Handle Protected Paths
  if (path.startsWith('/dashboard') && tier !== 'nu') {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  if (path.startsWith('/app') && tier === 'nu') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect legacy root-level paths to tiered paths (e.g., /todo -> /dashboard/todo)
  if (!path.startsWith('/dashboard') && !path.startsWith('/app') && tier) {
    const prefix = tier === 'nu' ? '/dashboard' : '/app';
    return NextResponse.redirect(new URL(`${prefix}${path}${request.nextUrl.search}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
