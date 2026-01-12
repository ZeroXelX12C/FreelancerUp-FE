// middleware.ts (đặt ở root project - cùng cấp src/)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Danh sách route cần bảo vệ
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
  // thêm các route khác cần bảo vệ
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Vì đang dùng localStorage → middleware KHÔNG đọc được token
  // → chỉ redirect cơ bản (không phải giải pháp an toàn tuyệt đối)
  if (isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // thêm matcher cho các route protected khác
  ],
};