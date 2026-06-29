import nodemailer from 'nodemailer'
import { LABELS } from './constants'

type MailTicket = { id:number; title:string; category:string; priority:string; status:string; clientProject:string|null; dueAt:Date; description:string; assignedTo?:{name:string}|null; attachments?:unknown[] }
export async function sendNewTicketEmail(ticket: MailTicket, to: string) {
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/tickets/${ticket.id}`
  const subject = `Nuevo ticket creado: ${ticket.title} - ${LABELS[ticket.priority]}`
  const text = `Se ha creado un nuevo ticket en el sistema.\n\nTítulo: ${ticket.title}\nCategoría: ${LABELS[ticket.category]}\nPrioridad: ${LABELS[ticket.priority]}\nEstado: ${LABELS[ticket.status]}\nCliente/Proyecto: ${ticket.clientProject || 'Sin especificar'}\nResponsable: ${ticket.assignedTo?.name || 'Sin asignar'}\nVencimiento: ${ticket.dueAt.toLocaleString('es-HN')}\n\nDescripción:\n${ticket.description}\n\nArchivos adjuntos: ${ticket.attachments?.length ? 'Sí' : 'No'}\n\nAbrir ticket:\n${url}`
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.info('[TaskFlow email pendiente de SMTP]', { to, subject, text })
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }
  }
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  await transport.sendMail({ from: process.env.SMTP_FROM, to, subject, text })
  return { sent: true }
}

export async function sendReminderEmail(ticket: MailTicket, to: string, message?: string | null) {
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/tickets/${ticket.id}`
  const subject = `Recordatorio: ${ticket.title} - ${LABELS[ticket.priority]}`
  const text = `${message || 'Tienes un ticket próximo a vencer.'}\n\nTicket: ${ticket.title}\nPrioridad: ${LABELS[ticket.priority]}\nVencimiento: ${ticket.dueAt.toLocaleString('es-HN')}\n\nAbrir ticket:\n${url}`
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.info('[TaskFlow recordatorio pendiente de SMTP]', { to, subject })
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' }
  }
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  await transport.sendMail({ from: process.env.SMTP_FROM, to, subject, text })
  return { sent: true }
}
