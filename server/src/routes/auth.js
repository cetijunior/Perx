import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import User from '../models/User.js'
import Employee from '../models/Employee.js'
import { signToken, requireAuth } from '../lib/auth.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ error: 'invalid_credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
    const token = signToken(user)
    res.json({ token, user: user.toJSON() })
  } catch (err) { next(err) }
})

const registerSchema = loginSchema.extend({
  name: z.string().min(1),
  role: z.enum(['employee', 'admin']).default('employee'),
  company: z.string().optional(),
  department: z.string().optional(),
})

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const exists = await User.findOne({ email: body.email.toLowerCase() })
    if (exists) return res.status(409).json({ error: 'email_taken' })
    const passwordHash = await bcrypt.hash(body.password, 10)
    const user = await User.create({ ...body, passwordHash })
    if (user.role === 'employee') {
      await Employee.create({ userId: user._id })
    }
    const token = signToken(user)
    res.status(201).json({ token, user: user.toJSON() })
  } catch (err) { next(err) }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.sub)
    if (!user) return res.status(404).json({ error: 'not_found' })
    res.json({ user: user.toJSON() })
  } catch (err) { next(err) }
})

export default router
