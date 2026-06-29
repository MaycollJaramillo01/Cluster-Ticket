import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/app-shell'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = { title: 'TaskFlow Agency', description: 'Sistema interno de tickets y tareas' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body><AppShell>{children}</AppShell><Toaster position="bottom-right" toastOptions={{ duration: 4000 }} /></body></html>
}
