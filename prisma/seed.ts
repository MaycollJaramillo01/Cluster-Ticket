import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({ where: { email: 'maycolljaramillo01@gmail.com' }, update: { name: 'Maycoll Jaramillo', role: 'ADMIN', active: true }, create: { name: 'Maycoll Jaramillo', email: 'maycolljaramillo01@gmail.com', role: 'ADMIN' } })
  await prisma.setting.upsert({ where: { id: 1 }, update: { notificationEmail: 'maycolljaramillo01@gmail.com' }, create: { id: 1, notificationEmail: 'maycolljaramillo01@gmail.com' } })
}
main().finally(() => prisma.$disconnect())
