'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare2, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const username = String(form.get('username') || '').trim()
    const password = String(form.get('password') || '')
    if (!username || !password) { toast.error('Ingresa usuario y contraseña.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error || 'No se pudo iniciar sesión.'); return }
      toast.success(`Bienvenido, ${data.name}`)
      router.replace('/')
      router.refresh()
    } finally { setLoading(false) }
  }

  return <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
    <form onSubmit={submit} className="panel" style={{ width: '100%', maxWidth: 380, padding: 30, display: 'grid', gap: 17 }}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
        <div className="brand-mark" style={{ color: '#fff' }}><CheckSquare2 size={20} /></div>
        <div><b style={{ fontSize: 16 }}>TaskFlow</b><span className="subtle" style={{ display: 'block' }}>Agency workspace</span></div>
      </div>
      <p style={{ margin: 0, color: 'var(--muted)' }}>Inicia sesión para gestionar tus tickets.</p>
      <div className="field"><label htmlFor="username">Usuario o email</label>
        <input id="username" name="username" className="input" autoComplete="username" autoFocus required /></div>
      <div className="field"><label htmlFor="password">Contraseña</label>
        <input id="password" name="password" className="input" type="password" autoComplete="current-password" required /></div>
      <button className="btn btn-primary" disabled={loading}><LogIn size={17} /> {loading ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  </div>
}
