import { verifyPassword, signAdminToken } from './_lib/auth.js'
import { checkLoginRateLimit } from './_lib/rateLimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const identifier =
    req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  const withinLimit = await checkLoginRateLimit(identifier)
  if (!withinLimit) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' })
  }

  const { password } = req.body || {}
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' })
  }

  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET or ADMIN_PASSWORD_HASH environment variables.')
    return res.status(500).json({ error: 'Server is not configured for admin login.' })
  }

  try {
    const valid = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }
    const token = signAdminToken()
    return res.status(200).json({ token })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Authentication failed.' })
  }
}
