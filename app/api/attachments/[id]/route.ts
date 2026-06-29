import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const file = await prisma.attachment.findUnique({ where: { id: Number(id) } })
  if (!file) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 })
  try { await unlink(path.join(process.cwd(), 'public', file.fileUrl)) } catch {}
  await prisma.attachment.delete({ where: { id: file.id } })
  await prisma.activityLog.create({ data: { ticketId: file.ticketId, userId: Number(req.nextUrl.searchParams.get('userId') || 1), action: 'FILE_DELETED', oldValue: file.fileName } })
  return NextResponse.json({ ok: true })
}
