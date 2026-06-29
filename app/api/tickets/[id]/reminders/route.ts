import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { remindAt, type, message, userId = 1 } = await req.json()
  if (!remindAt || !['DESKTOP','EMAIL','BOTH'].includes(type)) return NextResponse.json({ error: 'Recordatorio inválido.' }, { status: 400 })
  const reminder = await prisma.reminder.create({ data: { ticketId: Number(id), remindAt: new Date(remindAt), type, message } })
  await prisma.activityLog.create({ data: { ticketId: Number(id), userId: Number(userId), action: 'REMINDER_CREATED', newValue: new Date(remindAt).toISOString() } })
  return NextResponse.json(reminder, { status: 201 })
}
