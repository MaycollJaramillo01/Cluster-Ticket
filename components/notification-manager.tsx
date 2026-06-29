'use client'
import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Ticket } from '@/types'
import toast from 'react-hot-toast'

export function NotificationManager(){
 const [permission,setPermission]=useState<NotificationPermission>('default')
 useEffect(()=>{ if('Notification' in window){ const current=Notification.permission; (current==='default'?Notification.requestPermission():Promise.resolve(current)).then(setPermission) }
  const timer=setInterval(async()=>{ fetch('/api/reminders/process',{method:'POST'}).catch(()=>{}); if(!('Notification' in window)||Notification.permission!=='granted') return; const enabled=localStorage.getItem('desktop-notifications')!=='false'; if(!enabled)return
   const tickets:Ticket[]=await fetch('/api/tickets').then(r=>r.json()).catch(()=>[]); const now=Date.now()
   tickets.forEach(t=>{if(['COMPLETED','CANCELLED'].includes(t.status))return; const due=new Date(t.dueAt).getTime(); const reminder=t.reminders.find(r=>!r.sent&&new Date(r.remindAt).getTime()<=now); const key=`notified-${t.id}-${reminder?.id||'due'}`
    if((reminder||due<=now|| (t.priority==='URGENT'&&due-now<3600000))&&!sessionStorage.getItem(key)){ const n=new Notification(t.priority==='URGENT'?'Recordatorio de ticket urgente':'Recordatorio de ticket',{body:reminder?.message||`${t.title} ${due<=now?'está vencido':'está próximo a vencer'}`,tag:key}); n.onclick=()=>{window.focus();location.href=`/tickets/${t.id}`};sessionStorage.setItem(key,'1') }
   })
  },60000); return()=>clearInterval(timer)
 },[])
 async function request(){ if(!('Notification' in window)) return toast.error('Este navegador no soporta notificaciones.'); setPermission(await Notification.requestPermission()) }
 return <button className="btn btn-ghost btn-icon" onClick={request} aria-label={permission==='granted'?'Notificaciones activas':'Activar notificaciones'} title="Notificaciones"><Bell size={19}/>{permission!=='granted'&&<span style={{position:'absolute',width:7,height:7,borderRadius:9,background:'#dc2626',margin:'-17px 0 0 16px'}}/>}</button>
}
