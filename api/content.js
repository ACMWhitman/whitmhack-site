import { redis } from './_lib/redis.js'
import { verifyAdminToken } from './_lib/auth.js'

const CONTENT_KEY = 'site-content'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const stored = await redis.get(CONTENT_KEY)
      // null tells the client to keep its bundled siteContent.js defaults —
      // that's expected until an admin saves something for the first time.
      return res.status(200).json(stored || null)
    } catch (err) {
      console.error('Failed to read content:', err)
      return res.status(500).json({ error: 'Failed to read content data.' })
    }
  }

  if (req.method === 'POST') {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }
    try {
      verifyAdminToken(token)
    } catch {
      return res.status(400).json({ error: 'Invalid or expired token.' })
    }

    const newContent = req.body
    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ error: 'Invalid content payload.' })
    }

    try {
      await redis.set(CONTENT_KEY, newContent)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Failed to save content:', err)
      return res.status(500).json({ error: 'Failed to save updated content.' })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed.' })
}
