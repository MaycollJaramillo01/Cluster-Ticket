import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { comment, userId = 1 } = await req.json()
  if (!comment?.trim()) return NextResponse.json({ error: 'Escribe un comentario.' }, { status: 400 })
  const result = await prisma.comment.create({ data: { ticketId: Number(id), userId: Number(userId), comment: comment.trim() }, include: { user: true, attachments: true } })
  await prisma.activityLog.create({ data: { ticketId: Number(id), userId: Number(userId), action: 'COMMENT_ADDED' } })
  return NextResponse.json(result, { status: 201 })
}
