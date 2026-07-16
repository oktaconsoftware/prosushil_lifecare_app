import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // 1. Check cookies instead of localStorage
  const employeeId = request.cookies.get('employeeId')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // 2. Protect Sales Routes
  if (path.startsWith('/sales')) {
    if (!employeeId) {
      // Not logged in? Instant redirect from the server.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. Protect Admin Routes
  if (path.startsWith('/admin')) {
    if (userRole !== 'ADMIN') {
      // Not an admin? Instant redirect.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// 4. Tell Next.js exactly which folders to lock down
export const config = {
  matcher: ['/sales/:path*', '/admin/:path*'],
};