import crypto from 'crypto'

const JWT_SECRET = process.env.ADMIN_PASSWORD || 'nadir-admin-pass-fallback-secret-2026'

export function signToken(): string {
  // 1-day expiration time
  const payload = {
    role: 'admin',
    exp: Date.now() + 24 * 60 * 60 * 1000
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url')
  
  return `${encodedPayload}.${signature}`
}

export function verifyToken(token?: string): boolean {
  if (!token) return false
  
  const parts = token.split('.')
  if (parts.length !== 2) return false
  
  const [encodedPayload, signature] = parts
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url')
  
  // Safe comparison
  if (signature !== expectedSignature) return false
  
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'))
    if (payload.exp < Date.now()) {
      return false // expired
    }
    return payload.role === 'admin'
  } catch (error) {
    return false
  }
}
