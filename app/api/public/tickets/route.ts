import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicTicketSchema } from '@/lib/validators'
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, TASK_ASSIGNEE } from '@/lib/constants'
import { sendNewTicketEmail } from '@/lib/mail'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// Endpoint sin autenticación: cualquier persona externa puede solicitar un ticket.
// El solicitante se identifica solo con nombre/email; no obtiene acceso al panel interno.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const raw = JSON.parse(String(form.get('ticket') || '{}'))
    const parsed = publicTicketSchema.safeParse(raw)
    if (!parsed.success) return NextResponse.json({ error: 'Revisa los campos obligatorios.', details: parsed.error.flatten() }, { status: 400 })
    const files = form.getAll('files').filter((value): value is File => value instanceof File && value.size > 0)
    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: `${file.name} supera el máximo de 15 MB.` }, { status: 400 })
      if (!ALLOWED_EXTENSIONS.includes(ext)) return NextResponse.json({ error: `El tipo de ${file.name} no está permitido.` }, { status: 400 })
    }
    const { requesterName, requesterEmail, clientProject, ...ticketFields } = parsed.data
    const requester = await prisma.user.upsert({
      where: { email: requesterEmail.trim().toLowerCase() },
      update: { name: requesterName, active: true },
      create: { name: requesterName, email: requesterEmail.trim().toLowerCase(), role: 'CLIENT' }
    })
    const assignee = await prisma.user.upsert({
      where: { email: TASK_ASSIGNEE.email },
      update: { name: TASK_ASSIGNEE.name, role: 'ADMIN', active: true },
      create: { ...TASK_ASSIGNEE, role: 'ADMIN' }
    })
    const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    const ticket = await prisma.ticket.create({
      data: {
        ...ticketFields,
        clientProject: clientProject || requesterName,
        priority: 'MEDIUM',
        status: 'NEW',
        dueAt,
        tags: '[]',
        assignedToId: assignee.id,
        createdById: requester.id,
        activityLog: { create: { userId: requester.id, action: 'TICKET_CREATED', newValue: 'Nuevo' } }
      }
    })
    if (files.length) {
      const dir = path.join(process.cwd(), 'public', 'uploads', String(ticket.id))
      await mkdir(dir, { recursive: true })
      for (const file of files) {
        const safe = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()))
        await prisma.attachment.create({ data: { ticketId: ticket.id, fileName: file.name, fileUrl: `/uploads/${ticket.id}/${safe}`, fileType: file.type || 'application/octet-stream', fileSize: file.size, uploadedById: requester.id } })
      }
      await prisma.activityLog.create({ data: { ticketId: ticket.id, userId: requester.id, action: 'FILES_ATTACHED', newValue: `${files.length} archivo(s)` } })
    }
    const complete = await prisma.ticket.findUniqueOrThrow({ where: { id: ticket.id }, include: { assignedTo: true, createdBy: true, attachments: true } })
    const mail = await sendNewTicketEmail(complete, assignee.email)
    return NextResponse.json({ id: complete.id, emailSent: mail.sent }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'No se pudo crear el ticket.' }, { status: 500 })
  }
}
