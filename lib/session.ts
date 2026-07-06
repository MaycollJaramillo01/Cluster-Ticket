// Tokens de sesión firmados con HMAC vía Web Crypto para poder verificarlos también en el middleware (edge).
export const SESSION_COOKIE = 'taskflow_session'
export const SESSION_DAYS = 30

const encoder = new TextEncoder()

async function sign(payload: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(process.env.AUTH_SECRET || 'taskflow-dev-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function createSessionToken(userId: number) {
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  const payload = `${userId}.${expiresAt}`
  return `${payload}.${await sign(payload)}`
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null
  const [userId, expiresAt, signature] = token.split('.')
  if (!userId || !expiresAt || !signature) return null
  if (await sign(`${userId}.${expiresAt}`) !== signature) return null
  if (Number(expiresAt) < Date.now()) return null
  return Number(userId)
}
