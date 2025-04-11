// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/cadastro') ||
    request.nextUrl.pathname.startsWith('/api/auth');

  // Rotas públicas acessíveis sem autenticação
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/receita') ||
    request.nextUrl.pathname.startsWith('/rastrear') ||
    request.nextUrl.pathname.startsWith('/desconto');

  if (!token && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se está autenticado e tenta acessar login/cadastro, redirecionar para o dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cadastro',
    '/login',
    '/achepoint/:path*',
    '/achepoint/:path*',
    '/desconto/:path*',
    '/historico/:path*',
    '/pacientes/:path*',
    '/prescricao/:path*',
    '/rastrear/:path*',
    '/receita/:path*',
  ],
};
