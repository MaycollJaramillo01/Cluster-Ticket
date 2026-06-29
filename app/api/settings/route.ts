import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { TASK_ASSIGNEE } from '@/lib/constants'

export async function GET() { return NextResponse.json(await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })) }
export async function PATCH(req: NextRequest) {
  const parsed = z.object({ notificationEmail:z.string().email(), desktopNotificationsEnabled:z.boolean(), defaultReminderMinutes:z.number().int().min(0).max(10080) }).safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Configuración inválida.' }, { status: 400 })
  const data = { ...parsed.data, notificationEmail: TASK_ASSIGNEE.email }
  return NextResponse.json(await prisma.setting.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } }))
}
