import crypto from 'crypto'

export function generateDiscountCode({ providerSlug, discountPct }) {
  const prefix = providerSlug ? providerSlug.slice(0, 4).toUpperCase() : 'PERX'
  const pct = Math.round((discountPct || 0) * 100)
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `${prefix}${pct}-${rand}`
}

export function newDiscountCode({ label, providerSlug, category, discountPct, source }) {
  const now = new Date()
  return {
    id: crypto.randomBytes(8).toString('hex'),
    code: generateDiscountCode({ providerSlug, discountPct }),
    label,
    providerSlug: providerSlug || null,
    category: category || null,
    discountPct,
    source,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    usedAt: null,
  }
}
