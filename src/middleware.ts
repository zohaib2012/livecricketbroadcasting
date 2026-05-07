import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;
  
  const isAdminPath = pathname.startsWith('/admin');
  const isScorerPath = pathname.startsWith('/scorer');
  
  const role = (session?.user as any)?.role;
  
  if (isAdminPath && !['ADMIN','SUPER_ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isScorerPath && !['SCORER','ADMIN','SUPER_ADMIN'].includes(role)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/scorer/:path*'],
};
