'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, CheckSquare2, Clock3, LayoutDashboard, Menu, Plus, Settings, Trello, X } from 'lucide-react'
import { NotificationManager } from './notification-manager'

const nav = [{href:'/',label:'Dashboard',icon:LayoutDashboard},{href:'/tickets',label:'Tickets',icon:CheckSquare2},{href:'/tickets/new',label:'Crear ticket',icon:Plus},{href:'/kanban',label:'Kanban',icon:Trello},{href:'/calendar',label:'Calendario',icon:CalendarDays},{href:'/reminders',label:'Recordatorios',icon:Clock3},{href:'/settings',label:'Configuración',icon:Settings}]
export function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname(); const [open,setOpen]=useState(false)
 const title=nav.find(n=>n.href==='/'?path==='/':path.startsWith(n.href))?.label||'TaskFlow Agency'
 return <div className="app"><div className={`drawer-backdrop ${open?'open':''}`} onClick={()=>setOpen(false)}/><aside className={`sidebar ${open?'open':''}`}>
  <div className="brand"><div className="brand-mark"><CheckSquare2 size={20}/></div><div><b>TaskFlow</b><span>Agency workspace</span></div><button className="btn btn-ghost btn-icon mobile-menu" onClick={()=>setOpen(false)} aria-label="Cerrar menú"><X/></button></div>
  <nav className="nav">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} onClick={()=>setOpen(false)} className={(href==='/'?path==='/':path.startsWith(href))?'active':''}><Icon/>{label}</Link>)}</nav>
  <div className="sidebar-foot"><div className="avatar">MJ</div><div><b>Maycoll Jaramillo</b><span>Administrador</span></div></div>
 </aside><main className="main"><header className="topbar"><div style={{display:'flex',alignItems:'center',gap:10}}><button className="btn btn-ghost btn-icon mobile-menu" onClick={()=>setOpen(true)} aria-label="Abrir menú"><Menu/></button><h1>{title}</h1></div><div className="top-actions"><NotificationManager/><Link className="btn btn-primary desktop-only" href="/tickets/new"><Plus size={17}/> Nuevo ticket</Link></div></header><div className="content">{children}</div></main></div>
}
