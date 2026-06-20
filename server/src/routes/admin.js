import { Router } from 'express'
import User from '../models/User.js'
import Employee from '../models/Employee.js'
import Redemption from '../models/Redemption.js'
import Provider from '../models/Provider.js'
import { requireAuth, requireRole, verifyCardToken } from '../lib/auth.js'

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

// Decode a scanned card QR token and return the employee + their redeemable benefits.
// Does not consume the token — call /redeem to actually log a redemption.
router.post('/card/lookup', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'token_required' })
    let payload
    try { payload = verifyCardToken(token) } catch {
      return res.status(400).json({ error: 'invalid_or_expired_token' })
    }
    const [user, emp] = await Promise.all([
      User.findById(payload.sub),
      Employee.findById(payload.employeeId),
    ])
    if (!user || !emp) return res.status(404).json({ error: 'employee_not_found' })
    const alreadyUsed = await Redemption.exists({ jti: payload.jti })
    if (alreadyUsed) return res.status(409).json({ error: 'token_already_used' })

    const slugs = payload.providerSlug
      ? [payload.providerSlug]
      : emp.activeBenefits

    if (payload.providerSlug && !emp.activeBenefits.includes(payload.providerSlug)) {
      return res.status(403).json({ error: 'benefit_not_active_for_employee' })
    }

    const benefits = await Provider.find({ slug: { $in: slugs } })
    res.json({
      employee: { name: user.name, department: user.department, employeeId: emp.id.slice(-8).toUpperCase() },
      benefits: benefits.map((b) => ({ slug: b.slug, name: b.name, category: b.category })),
      lockedBenefit: payload.providerSlug || null,
    })
  } catch (err) { next(err) }
})

// Consume a card token to log a discount redemption for a specific benefit.
router.post('/card/redeem', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { token, providerSlug: bodySlug } = req.body
    if (!token) return res.status(400).json({ error: 'token_required' })
    let payload
    try { payload = verifyCardToken(token) } catch {
      return res.status(400).json({ error: 'invalid_or_expired_token' })
    }
    const providerSlug = payload.providerSlug || bodySlug
    if (!providerSlug) return res.status(400).json({ error: 'providerSlug_required' })
    if (payload.providerSlug && bodySlug && payload.providerSlug !== bodySlug) {
      return res.status(400).json({ error: 'token_benefit_mismatch' })
    }
    const emp = await Employee.findById(payload.employeeId)
    if (!emp) return res.status(404).json({ error: 'employee_not_found' })
    if (!emp.activeBenefits.includes(providerSlug)) {
      return res.status(403).json({ error: 'benefit_not_active_for_employee' })
    }
    const redemption = await Redemption.create({
      jti: payload.jti,
      employeeId: emp.id,
      userId: payload.sub,
      providerSlug,
      redeemedBy: req.auth.sub,
    })
    res.json({ redemption })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'token_already_used' })
    next(err)
  }
})

export default router
