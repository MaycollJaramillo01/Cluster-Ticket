import { z } from 'zod'
import { CATEGORIES, PRIORITIES, STATUSES } from './constants'

export const ticketSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES).default('NEW'),
  clientProject: z.string().trim().max(120).optional().nullable(),
  dueAt: z.coerce.date(),
  tags: z.array(z.string().trim().max(30)).default([]),
  internalNotes: z.string().max(3000).optional().nullable()
})

// Formulario público (sin sesión): solo lo mínimo que un cliente externo debe decidir.
// Prioridad, vencimiento y notas internas los define el equipo al triar el ticket.
export const publicTicketSchema = z.object({
  requesterName: z.string().trim().min(2).max(120),
  requesterEmail: z.string().trim().email(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5),
  category: z.enum(CATEGORIES),
  clientProject: z.string().trim().max(120).optional().nullable()
})
