import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rotas públicas que não precisam de autenticação
  const publicPaths = ['/login', '/'];
  const { pathname } = request.nextUrl;

  // Se for rota pública, permite acesso
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Para rotas protegidas, verifica autenticação no client-side
  // (middleware não tem acesso ao localStorage, então a verificação real acontece no client)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg|lasy-bridge.js).*)'],
};
