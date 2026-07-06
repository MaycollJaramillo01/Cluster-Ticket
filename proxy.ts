import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/api/auth')) return NextResponse.next()
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

// Protege todo excepto login, assets estáticos y archivos subidos.
export const config = { matcher: ['/((?!api/auth|_next|uploads|favicon\\.ico|.*\\.[\\w]+$).*)', '/api/:path*'] }
