'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarDays, CheckSquare2, Clock3, LayoutDashboard, LogOut, Menu, Plus, Settings, Trello, X } from 'lucide-react'
import { NotificationManager } from './notification-manager'
import { LABELS } from '@/lib/constants'
import type { User } from '@/types'

const nav = [{href:'/',label:'Dashboard',icon:LayoutDashboard},{href:'/tickets',label:'Tickets',icon:CheckSquare2},{href:'/tickets/new',label:'Crear ticket',icon:Plus},{href:'/kanban',label:'Kanban',icon:Trello},{href:'/calendar',label:'Calendario',icon:CalendarDays},{href:'/reminders',label:'Recordatorios',icon:Clock3},{href:'/settings',label:'Configuración',icon:Settings}]
export function AppShell({children}:{children:React.ReactNode}){
 const path=usePathname(); const router=useRouter(); const [open,setOpen]=useState(false); const [user,setUser]=useState<User|null>(null)
 useEffect(()=>{ if(path==='/login'){setUser(null);return} fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(setUser).catch(()=>{}) },[path])
 if(path==='/login') return <>{children}</>
 const title=nav.find(n=>n.href==='/'?path==='/':path.startsWith(n.href))?.label||'TaskFlow Agency'
 const initials=user?user.name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase():'…'
 async function logout(){ await fetch('/api/auth/logout',{method:'POST'}).catch(()=>{}); router.replace('/login'); router.refresh() }
 return <div className="app"><div className={`drawer-backdrop ${open?'open':''}`} onClick={()=>setOpen(false)}/><aside className={`sidebar ${open?'open':''}`}>
  <div className="brand"><div className="brand-mark"><CheckSquare2 size={20}/></div><div><b>TaskFlow</b><span>Agency workspace</span></div><button className="btn btn-ghost btn-icon mobile-menu" onClick={()=>setOpen(false)} aria-label="Cerrar menú"><X/></button></div>
  <nav className="nav">{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} onClick={()=>setOpen(false)} className={(href==='/'?path==='/':path.startsWith(href))?'active':''}><Icon/>{label}</Link>)}</nav>
  <div className="sidebar-foot"><div className="avatar">{initials}</div><div style={{flex:1,minWidth:0}}><b>{user?.name||'Cargando…'}</b><span>{user?LABELS[user.role]||user.role:''}</span></div><button className="btn btn-ghost btn-icon" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión" style={{color:'#98a2b3'}}><LogOut size={18}/></button></div>
 </aside><main className="main"><header className="topbar"><div style={{display:'flex',alignItems:'center',gap:10}}><button className="btn btn-ghost btn-icon mobile-menu" onClick={()=>setOpen(true)} aria-label="Abrir menú"><Menu/></button><h1>{title}</h1></div><div className="top-actions"><NotificationManager/><Link className="btn btn-primary desktop-only" href="/tickets/new"><Plus size={17}/> Nuevo ticket</Link></div></header><div className="content">{children}</div></main></div>
}
