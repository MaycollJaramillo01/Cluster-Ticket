import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({ where: { email: 'maycolljaramillo01@gmail.com' }, update: {}, create: { name: 'Maycoll Jaramillo', email: 'maycolljaramillo01@gmail.com', role: 'ADMIN' } })
  await prisma.user.upsert({ where: { email: 'colaborador@taskflow.local' }, update: {}, create: { name: 'Equipo Operaciones', email: 'colaborador@taskflow.local', role: 'COLLABORATOR' } })
  await prisma.setting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
}
main().finally(() => prisma.$disconnect())
