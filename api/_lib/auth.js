import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' })
}

export function verifyAdminToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
