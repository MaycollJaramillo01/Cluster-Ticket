import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/password'
const prisma = new PrismaClient()

async function main() {
  // Maycoll (ADMIN): recibe y gestiona los tickets.
  await prisma.user.upsert({
    where: { email: 'maycolljaramillo01@gmail.com' },
    update: { name: 'Maycoll Jaramillo', username: 'maycolljaramillo', role: 'ADMIN', active: true, passwordHash: hashPassword('Zap52426;') },
    create: { name: 'Maycoll Jaramillo', email: 'maycolljaramillo01@gmail.com', username: 'maycolljaramillo', role: 'ADMIN', passwordHash: hashPassword('Zap52426;') }
  })
  // Edsel (CLIENT): solicita tickets.
  await prisma.user.upsert({
    where: { email: 'guzmanedsel@gmail.com' },
    update: { name: 'Edsel Guzman', username: 'edsel', role: 'CLIENT', active: true, passwordHash: hashPassword('Cardepot2026!') },
    create: { name: 'Edsel Guzman', email: 'guzmanedsel@gmail.com', username: 'edsel', role: 'CLIENT', passwordHash: hashPassword('Cardepot2026!') }
  })
  await prisma.setting.upsert({ where: { id: 1 }, update: { notificationEmail: 'maycolljaramillo01@gmail.com' }, create: { id: 1, notificationEmail: 'maycolljaramillo01@gmail.com' } })
}
main().finally(() => prisma.$disconnect())
