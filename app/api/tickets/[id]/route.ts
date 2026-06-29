import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ticketSchema } from '@/lib/validators'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
const include = { assignedTo: true, createdBy: true, attachments: true, comments: { include: { user: true, attachments: true }, orderBy: { createdAt: 'desc' as const } }, reminders: { orderBy: { remindAt: 'asc' as const } }, activityLog: { include: { user: true }, orderBy: { createdAt: 'desc' as const } } }

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await prisma.ticket.findFirst({ where: { id: Number(id), deletedAt: null }, include })
  return ticket ? NextResponse.json(ticket) : NextResponse.json({ error: 'Ticket no encontrado.' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticketId = Number(id)
  const current = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!current || current.deletedAt) return NextResponse.json({ error: 'Ticket no encontrado.' }, { status: 404 })
  const body = await req.json()
  const partial = ticketSchema.partial().safeParse(body)
  if (!partial.success) return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
  const changes = partial.data
  const activity: { action:string; oldValue?:string; newValue?:string; userId:number }[] = []
  const actor = Number(body.actorId || 1)
  if (changes.status && changes.status !== current.status) activity.push({ action: changes.status === 'COMPLETED' ? 'TICKET_COMPLETED' : 'STATUS_CHANGED', oldValue: current.status, newValue: changes.status, userId: actor })
  if (changes.priority && changes.priority !== current.priority) activity.push({ action: 'PRIORITY_CHANGED', oldValue: current.priority, newValue: changes.priority, userId: actor })
  if (changes.assignedToId !== undefined && changes.assignedToId !== current.assignedToId) activity.push({ action: 'ASSIGNEE_CHANGED', oldValue: String(current.assignedToId || ''), newValue: String(changes.assignedToId || ''), userId: actor })
  const data: Prisma.TicketUncheckedUpdateInput = {}
  if (changes.title !== undefined) data.title = changes.title
  if (changes.description !== undefined) data.description = changes.description
  if (changes.category !== undefined) data.category = changes.category
  if (changes.priority !== undefined) data.priority = changes.priority
  if (changes.status !== undefined) data.status = changes.status
  if (changes.clientProject !== undefined) data.clientProject = changes.clientProject
  if (changes.assignedToId !== undefined) data.assignedToId = changes.assignedToId
  if (changes.dueAt !== undefined) data.dueAt = changes.dueAt
  if (changes.tags !== undefined) data.tags = JSON.stringify(changes.tags)
  if (changes.internalNotes !== undefined) data.internalNotes = changes.internalNotes
  if (changes.status) data.completedAt = changes.status === 'COMPLETED' ? new Date() : null
  data.activityLog = { create: activity }
  const ticket = await prisma.ticket.update({ where: { id: ticketId }, data, include })
  return NextResponse.json(ticket)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const actorId = Number(req.nextUrl.searchParams.get('actorId') || 1)
  await prisma.ticket.update({ where: { id: Number(id) }, data: { deletedAt: new Date(), activityLog: { create: { userId: actorId, action: 'TICKET_DELETED' } } } })
  return NextResponse.json({ ok: true })
}
