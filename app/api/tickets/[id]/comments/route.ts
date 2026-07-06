import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const { comment } = await req.json()
  if (!comment?.trim()) return NextResponse.json({ error: 'Escribe un comentario.' }, { status: 400 })
  const result = await prisma.comment.create({ data: { ticketId: Number(id), userId: user.id, comment: comment.trim() }, include: { user: true, attachments: true } })
  await prisma.activityLog.create({ data: { ticketId: Number(id), userId: user.id, action: 'COMMENT_ADDED' } })
  return NextResponse.json(result, { status: 201 })
}
