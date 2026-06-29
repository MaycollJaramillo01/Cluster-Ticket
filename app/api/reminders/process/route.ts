import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/mail'

export async function POST() {
  const setting = await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
  const due = await prisma.reminder.findMany({ where: { sent: false, remindAt: { lte: new Date() }, type: { in: ['EMAIL','BOTH'] } }, include: { ticket: { include: { assignedTo: true, attachments: true } } }, take: 25 })
  let sent = 0
  for (const reminder of due) {
    const result = await sendReminderEmail(reminder.ticket, setting.notificationEmail, reminder.message)
    if (result.sent) { await prisma.reminder.update({ where: { id: reminder.id }, data: { sent: true } }); sent++ }
  }
  return NextResponse.json({ processed: due.length, sent })
}
