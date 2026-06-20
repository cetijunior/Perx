import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth, requireRole } from '../lib/auth.js'

const router = Router()

router.get('/', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ users })
  } catch (err) { next(err) }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'not_found' })
    res.json({ user })
  } catch (err) { next(err) }
})

export default router
