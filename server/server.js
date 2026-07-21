import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, 'content.json')
const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

// Fail fast with a clear message instead of letting every login attempt
// 500 with a cryptic jsonwebtoken error because setup was never finished.
if (!JWT_SECRET || !ADMIN_PASSWORD_HASH) {
  console.error(
    'Missing JWT_SECRET or ADMIN_PASSWORD_HASH.\n' +
      'Copy server/.env.example to server/.env and fill in both values ' +
      '(see the README\'s "Admin content editor" section for the exact commands).'
  )
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Slows down password guessing against /api/login.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
})

// Middleware: verify JWT from Authorization header
function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET)
    req.user = verified
    next()
  } catch {
    res.status(400).json({ error: 'Invalid or expired token.' })
  }
}

// POST /api/login — authenticate with password, receive JWT
app.post('/api/login', loginLimiter, async (req, res) => {
  const { password } = req.body
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' })
  }

  try {
    const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' })
    res.json({ token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Authentication failed.' })
  }
})

// GET /api/content — public, read all content
app.get('/api/content', (_req, res) => {
  fs.readFile(DATA_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read content:', err)
      return res.status(500).json({ error: 'Failed to read content data.' })
    }
    try {
      res.json(JSON.parse(data))
    } catch (parseErr) {
      console.error('Failed to parse content:', parseErr)
      res.status(500).json({ error: 'Content file is corrupted.' })
    }
  })
})

// POST /api/content — protected, overwrite all content
app.post('/api/content', verifyAdmin, (req, res) => {
  const newContent = req.body
  if (!newContent || typeof newContent !== 'object') {
    return res.status(400).json({ error: 'Invalid content payload.' })
  }

  fs.writeFile(DATA_PATH, JSON.stringify(newContent, null, 2), (err) => {
    if (err) {
      console.error('Failed to save content:', err)
      return res.status(500).json({ error: 'Failed to save updated content.' })
    }
    res.json({ success: true })
  })
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`WhitmHack admin server running on http://localhost:${PORT}`)
})