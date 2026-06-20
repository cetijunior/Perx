import { Router } from 'express'
import Employee from '../models/Employee.js'
import { requireAuth } from '../lib/auth.js'

const router = Router()

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    let emp = await Employee.findOne({ userId: req.auth.sub })
    if (!emp) emp = await Employee.create({ userId: req.auth.sub })
    res.json({ employee: emp })
  } catch (err) { next(err) }
})

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['activeBenefits', 'cart', 'preferences', 'games', 'bonus']
    const update = {}
    for (const k of allowed) if (k in req.body) update[k] = req.body[k]
    const emp = await Employee.findOneAndUpdate(
      { userId: req.auth.sub },
      { $set: update },
      { new: true, upsert: true },
    )
    res.json({ employee: emp })
  } catch (err) { next(err) }
})

router.post('/me/cart', requireAuth, async (req, res, next) => {
  try {
    const { slug } = req.body
    if (!slug) return res.status(400).json({ error: 'slug_required' })
    const emp = await Employee.findOneAndUpdate(
      { userId: req.auth.sub },
      { $addToSet: { cart: slug } },
      { new: true, upsert: true },
    )
    res.json({ employee: emp })
  } catch (err) { next(err) }
})

router.delete('/me/cart/:slug', requireAuth, async (req, res, next) => {
  try {
    const emp = await Employee.findOneAndUpdate(
      { userId: req.auth.sub },
      { $pull: { cart: req.params.slug } },
      { new: true },
    )
    res.json({ employee: emp })
  } catch (err) { next(err) }
})

export default router
