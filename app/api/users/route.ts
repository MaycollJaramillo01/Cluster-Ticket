import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { z } from 'zod'

export async function GET() { return NextResponse.json(await prisma.user.findMany({ where: { active: true }, orderBy: { name: 'asc' }, omit: { passwordHash: true } })) }
export async function POST(req: NextRequest) {
  const parsed = z.object({ name:z.string().min(2), email:z.string().email(), role:z.enum(['ADMIN','COLLABORATOR','CLIENT','READ_ONLY']), password:z.string().min(6) }).safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos de usuario inválidos. La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
  const { password, ...data } = parsed.data
  try {
    const user = await prisma.user.create({ data: { ...data, passwordHash: hashPassword(password) }, omit: { passwordHash: true } })
    return NextResponse.json(user, { status: 201 })
  } catch { return NextResponse.json({ error: 'El email ya existe.' }, { status: 409 }) }
}
