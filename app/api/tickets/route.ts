import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ticketSchema } from '@/lib/validators'
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/constants'
import { sendNewTicketEmail } from '@/lib/mail'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  const tickets = await prisma.ticket.findMany({
    where: { deletedAt: null, ...(q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }, { clientProject: { contains: q } }] } : {}) },
    include: { assignedTo: true, createdBy: true, attachments: true, comments: { include: { user: true } }, reminders: true, activityLog: { include: { user: true }, orderBy: { createdAt: 'desc' } } },
    orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }]
  })
  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const raw = JSON.parse(String(form.get('ticket') || '{}'))
    const parsed = ticketSchema.safeParse(raw)
    if (!parsed.success) return NextResponse.json({ error: 'Revisa los campos obligatorios.', details: parsed.error.flatten() }, { status: 400 })
    const files = form.getAll('files').filter((value): value is File => value instanceof File && value.size > 0)
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `${file.name} supera el máximo de 15 MB.` }, { status: 400 })
      if (!ALLOWED_EXTENSIONS.includes(ext)) return NextResponse.json({ error: `El tipo de ${file.name} no está permitido.` }, { status: 400 })
    }
    const ticket = await prisma.ticket.create({ data: { ...parsed.data, tags: JSON.stringify(parsed.data.tags), activityLog: { create: { userId: parsed.data.createdById, action: 'TICKET_CREATED', newValue: 'Nuevo' } } } })
    if (files.length) {
      const dir = path.join(process.cwd(), 'public', 'uploads', String(ticket.id))
      await mkdir(dir, { recursive: true })
      for (const file of files) {
        const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()))
        await prisma.attachment.create({ data: { ticketId: ticket.id, fileName: file.name, fileUrl: `/uploads/${ticket.id}/${safe}`, fileType: file.type || 'application/octet-stream', fileSize: file.size, uploadedById: parsed.data.createdById } })
      }
      await prisma.activityLog.create({ data: { ticketId: ticket.id, userId: parsed.data.createdById, action: 'FILES_ATTACHED', newValue: `${files.length} archivo(s)` } })
    }
    const complete = await prisma.ticket.findUniqueOrThrow({ where: { id: ticket.id }, include: { assignedTo: true, createdBy: true, attachments: true } })
    const setting = await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
    const mail = await sendNewTicketEmail(complete, setting.notificationEmail)
    return NextResponse.json({ ticket: complete, emailSent: mail.sent }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'No se pudo crear el ticket.' }, { status: 500 })
  }
}
