import { describe, it, expect, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { verifyPassword, signAdminToken, verifyAdminToken } from './auth.js'

describe('auth helpers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
  })

  it('verifies a correct password against its bcrypt hash', async () => {
    const hash = bcrypt.hashSync('correct-horse', 10)
    await expect(verifyPassword('correct-horse', hash)).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const hash = bcrypt.hashSync('correct-horse', 10)
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false)
  })

  it('signs a token that verifies back to the admin role', () => {
    const token = signAdminToken()
    const payload = verifyAdminToken(token)
    expect(payload.role).toBe('admin')
  })

  it('throws when verifying a tampered token', () => {
    const token = signAdminToken()
    expect(() => verifyAdminToken(`${token}x`)).toThrow()
  })

  it('throws when verifying a token signed with a different secret', () => {
    const token = signAdminToken()
    process.env.JWT_SECRET = 'a-different-secret'
    expect(() => verifyAdminToken(token)).toThrow()
  })
})
