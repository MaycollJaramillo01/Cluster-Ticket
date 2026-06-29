'use client'
import { useCallback,useEffect,useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Ticket } from '@/types'
import { TicketTable } from '@/components/ticket-table'
export default function TicketsPage(){const [tickets,setTickets]=useState<Ticket[]>([]);const load=useCallback(()=>{fetch('/api/tickets').then(r=>r.json()).then(setTickets)},[]);useEffect(load,[load]);return <><div className="page-head"><div><h2>Todos los tickets</h2><p>Consulta, filtra y actualiza el trabajo del equipo.</p></div><Link href="/tickets/new" className="btn btn-primary"><Plus size={17}/>Crear ticket</Link></div><TicketTable tickets={tickets} onRefresh={load}/></>}
