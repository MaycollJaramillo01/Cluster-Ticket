import { z } from 'zod'
import { CATEGORIES, PRIORITIES, STATUSES } from './constants'

export const ticketSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES).default('NEW'),
  clientProject: z.string().trim().max(120).optional().nullable(),
  assignedToId: z.coerce.number().int().positive().optional().nullable(),
  dueAt: z.coerce.date(),
  tags: z.array(z.string().trim().max(30)).default([]),
  internalNotes: z.string().max(3000).optional().nullable(),
  createdById: z.coerce.number().int().positive().default(1)
})
