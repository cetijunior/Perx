import { Router } from 'express'
import Request from '../models/Request.js'
import Provider from '../models/Provider.js'
import Employee from '../models/Employee.js'
import { requireAuth, requireRole } from '../lib/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const q = req.auth.role === 'admin' ? {} : { userId: req.auth.sub }
    const requests = await Request.find(q).sort({ createdAt: -1 })
    res.json({ requests })
  } catch (err) { next(err) }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items_required' })
    }
    const providers = await Provider.find({ slug: { $in: items } })
    const total = providers.reduce((s, p) => s + p.cost, 0)
    const r = await Request.create({ userId: req.auth.sub, items, total })
    res.status(201).json({ request: r })
  } catch (err) { next(err) }
})

router.post('/:id/decide', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { decision } = req.body
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'bad_decision' })
    }
    const r = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: { status: decision, decidedAt: new Date() } },
      { new: true },
    )
    if (!r) return res.status(404).json({ error: 'not_found' })
    if (decision === 'approved') {
      await Employee.updateOne(
        { userId: r.userId },
        { $addToSet: { activeBenefits: { $each: r.items } }, $pull: { cart: { $in: r.items } } },
      )
    }
    res.json({ request: r })
  } catch (err) { next(err) }
})

export default router
