import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { createSessionToken, SESSION_COOKIE, SESSION_DAYS } from '@/lib/session'
import { z } from 'zod'

export async function POST(req: NextRequest) {
  const parsed = z.object({ username: z.string().min(1), password: z.string().min(1) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Ingresa usuario y contraseña.' }, { status: 400 })
  const { password } = parsed.data
  const username = parsed.data.username.trim().toLowerCase()
  const user = await prisma.user.findFirst({ where: { active: true, OR: [{ username }, { email: username }] } })
  // Tolera espacios accidentales alrededor de la contraseña (autofill / teclado móvil).
  if (!user || !(verifyPassword(password, user.passwordHash) || verifyPassword(password.trim(), user.passwordHash))) return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })
  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  // secure solo bajo HTTPS: la app se sirve por http en la red local y una cookie "secure" sería descartada.
  res.cookies.set(SESSION_COOKIE, await createSessionToken(user.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 24 * 60 * 60, secure: (process.env.APP_URL || '').startsWith('https') })
  return res
}
