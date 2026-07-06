import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session'

export async function getCurrentUser() {
  const store = await cookies()
  const userId = await verifySessionToken(store.get(SESSION_COOKIE)?.value)
  if (!userId) return null
  return prisma.user.findFirst({ where: { id: userId, active: true }, omit: { passwordHash: true } })
}
