'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare2, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) })
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
        <input id="username" className="input" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" autoFocus required /></div>
      <div className="field"><label htmlFor="password">Contraseña</label>
        <input id="password" className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required /></div>
      <button className="btn btn-primary" disabled={loading || !username.trim() || !password}><LogIn size={17} /> {loading ? 'Ingresando…' : 'Ingresar'}</button>
    </form>
  </div>
}
