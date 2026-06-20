import { Router } from 'express'
import Employee from '../models/Employee.js'
import User from '../models/User.js'
import Provider from '../models/Provider.js'
import { requireAuth, signCardToken } from '../lib/auth.js'
import { newDiscountCode } from '../lib/discountCodes.js'

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
    const allowed = ['activeBenefits', 'cart', 'preferences', 'games', 'bonus', 'discountCodes']
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

// Membership card profile (no QR — request a per-benefit token via POST /me/card/qr).
router.get('/me/card', requireAuth, async (req, res, next) => {
  try {
    const [user, emp] = await Promise.all([
      User.findById(req.auth.sub),
      Employee.findOneAndUpdate({ userId: req.auth.sub }, {}, { new: true, upsert: true }),
    ])
    if (!user) return res.status(404).json({ error: 'user_not_found' })
    const providers = await Provider.find({ slug: { $in: emp.activeBenefits } })
    res.json({
      card: {
        cardId: emp.id.slice(-8).toUpperCase(),
        name: user.name,
        company: user.company,
        department: user.department,
        activeBenefits: emp.activeBenefits,
        benefits: providers.map((b) => ({ slug: b.slug, name: b.name, category: b.category })),
        discountCodes: (emp.discountCodes || [])
          .filter((c) => !c.usedAt && new Date(c.expiresAt) > new Date())
          .map((c) => ({
            id: c.id,
            code: c.code,
            label: c.label,
            providerSlug: c.providerSlug,
            category: c.category,
            discountPct: c.discountPct,
            source: c.source,
            expiresAt: c.expiresAt,
            createdAt: c.createdAt,
          })),
        expiresInSeconds: 180,
      },
    })
  } catch (err) { next(err) }
})

// Issue a single-use, short-lived QR token locked to one active benefit.
router.post('/me/card/qr', requireAuth, async (req, res, next) => {
  try {
    const { providerSlug } = req.body
    if (!providerSlug) return res.status(400).json({ error: 'providerSlug_required' })
    const [user, emp] = await Promise.all([
      User.findById(req.auth.sub),
      Employee.findOne({ userId: req.auth.sub }),
    ])
    if (!user || !emp) return res.status(404).json({ error: 'employee_not_found' })
    if (!emp.activeBenefits.includes(providerSlug)) {
      return res.status(403).json({ error: 'benefit_not_active_for_employee' })
    }
    const provider = await Provider.findOne({ slug: providerSlug })
    if (!provider) return res.status(404).json({ error: 'provider_not_found' })
    const { token } = signCardToken(user, emp.id, providerSlug)
    res.json({
      qrToken: token,
      expiresInSeconds: 180,
      benefit: { slug: provider.slug, name: provider.name, category: provider.category },
    })
  } catch (err) { next(err) }
})

// Claim a one-time discount code from a minigame win.
router.post('/me/games/reward', requireAuth, async (req, res, next) => {
  try {
    const { source, label, providerSlug, category, discountPct } = req.body
    if (!source || !label || typeof discountPct !== 'number' || discountPct <= 0 || discountPct > 1) {
      return res.status(400).json({ error: 'invalid_reward' })
    }
    const discountCode = newDiscountCode({ source, label, providerSlug, category, discountPct })
    const emp = await Employee.findOneAndUpdate(
      { userId: req.auth.sub },
      { $push: { discountCodes: discountCode } },
      { new: true, upsert: true },
    )
    res.json({ discountCode, employee: emp })
  } catch (err) { next(err) }
})

// Mark a discount code as used (single-use at partner).
router.patch('/me/discount-codes/:id/use', requireAuth, async (req, res, next) => {
  try {
    const emp = await Employee.findOneAndUpdate(
      {
        userId: req.auth.sub,
        discountCodes: { $elemMatch: { id: req.params.id, usedAt: null } },
      },
      { $set: { 'discountCodes.$.usedAt': new Date() } },
      { new: true },
    )
    if (!emp) return res.status(404).json({ error: 'code_not_found' })
    res.json({ employee: emp })
  } catch (err) { next(err) }
})

export default router
