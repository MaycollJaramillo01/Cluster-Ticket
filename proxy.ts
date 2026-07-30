import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Formulario público de solicitud de tickets: sin sesión, abierto a cualquier persona.
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/public') || pathname === '/solicitud') return NextResponse.next()
  const userId = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  if (pathname === '/login') {
    return userId ? NextResponse.redirect(new URL('/', req.url)) : NextResponse.next()
  }
  if (!userId) {
    if (pathname.startsWith('/api')) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

// Protege todo excepto login, la solicitud pública de tickets, assets estáticos y archivos subidos.
export const config = { matcher: ['/((?!api/auth|api/public|solicitud|_next|uploads|favicon\\.ico|.*\\.[\\w]+$).*)', '/api/:path*'] }
