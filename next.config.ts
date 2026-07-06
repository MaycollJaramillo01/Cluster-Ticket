import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  turbopack: { root: process.cwd() },
  // Permite abrir el dev server desde la IP de red local (p. ej. http://192.168.56.1:3000)
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.*.*', '10.*.*.*', '172.16.*.*']
}
export default nextConfig
