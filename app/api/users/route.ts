import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET() { return NextResponse.json(await prisma.user.findMany({ where: { active: true }, orderBy: { name: 'asc' } })) }
export async function POST(req: NextRequest) {
  const parsed = z.object({ name:z.string().min(2), email:z.string().email(), role:z.enum(['ADMIN','COLLABORATOR','CLIENT','READ_ONLY']) }).safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Datos de usuario inválidos.' }, { status: 400 })
  try { return NextResponse.json(await prisma.user.create({ data: parsed.data }), { status: 201 }) } catch { return NextResponse.json({ error: 'El email ya existe.' }, { status: 409 }) }
}
