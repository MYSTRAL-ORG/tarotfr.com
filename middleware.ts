import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');
  const url = request.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === 'admin' && pwd === '#83@InesAylanAliceLucie') {
      return NextResponse.next();
    }
  }

  url.pathname = '/api/auth/basic';

  return NextResponse.rewrite(url, {
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
    status: 401,
  });
}

export const config = {
  matcher: ['/((?!api/auth/basic).*)'],
};
