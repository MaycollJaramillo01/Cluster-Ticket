import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/mail'
import { TASK_ASSIGNEE } from '@/lib/constants'

export async function POST() {
  const due = await prisma.reminder.findMany({ where: { sent: false, remindAt: { lte: new Date() }, type: { in: ['EMAIL','BOTH'] } }, include: { ticket: { include: { assignedTo: true, attachments: true } } }, take: 25 })
  let sent = 0
  for (const reminder of due) {
    const result = await sendReminderEmail(reminder.ticket, reminder.ticket.assignedTo?.email || TASK_ASSIGNEE.email, reminder.message)
    if (result.sent) { await prisma.reminder.update({ where: { id: reminder.id }, data: { sent: true } }); sent++ }
  }
  return NextResponse.json({ processed: due.length, sent })
}
