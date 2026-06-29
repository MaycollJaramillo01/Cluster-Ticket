'use client'
import { useEffect,useState } from 'react'
import Link from 'next/link'
import { BellRing,Clock3 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Ticket } from '@/types'
import { LABELS } from '@/lib/constants'
export default function RemindersPage(){const [tickets,setTickets]=useState<Ticket[]>([]);useEffect(()=>{fetch('/api/tickets').then(r=>r.json()).then(setTickets)},[]);const reminders=tickets.flatMap(t=>t.reminders.map(r=>({...r,ticket:t}))).sort((a,b)=>+new Date(a.remindAt)-+new Date(b.remindAt));return <><div className="page-head"><div><h2>Recordatorios</h2><p>Alertas programadas para no perder vencimientos importantes.</p></div></div><div className="panel"><div className="table-wrap"><table className="table" style={{minWidth:700}}><thead><tr><th>Ticket</th><th>Fecha y hora</th><th>Canal</th><th>Mensaje</th><th>Estado</th></tr></thead><tbody>{reminders.map(r=><tr key={r.id}><td><Link className="ticket-link" href={`/tickets/${r.ticket.id}`}>TF-{String(r.ticket.id).padStart(4,'0')} · {r.ticket.title}</Link></td><td><span className="category"><Clock3 size={15}/>{format(new Date(r.remindAt),"dd MMM yyyy, h:mm a",{locale:es})}</span></td><td>{LABELS[r.type]}</td><td>{r.message||'Recordatorio de vencimiento'}</td><td><span className={`badge ${r.sent?'badge-completed':'badge-pending'}`}>{r.sent?'Enviado':'Programado'}</span></td></tr>)}</tbody></table>{!reminders.length&&<div className="empty"><BellRing/><div>No hay recordatorios configurados.</div><p>Abre un ticket para programar el primero.</p></div>}</div></div></>}
