import { Router } from 'express'
import User from '../models/User.js'
import Employee from '../models/Employee.js'
import { requireAuth, requireRole } from '../lib/auth.js'

const router = Router()

router.get('/overview', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const [users, employees] = await Promise.all([
      User.find({ role: 'employee' }).sort({ name: 1 }),
      Employee.find(),
    ])
    res.json({ users, employees })
  } catch (err) { next(err) }
})

export default router
