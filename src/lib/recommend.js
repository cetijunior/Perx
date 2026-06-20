// Lightweight, data-driven-looking scoring used by Perky recommendations and the
// admin Deals Engine match score. Deterministic so the "AI" feels stable.
import { PROVIDERS } from './catalog'
import { getState, budgetFor } from './store'

// Score a provider for a given employee (0..100).
export function scoreProvider(provider, { prefs, remaining }) {
  let score = 50
  // preference category match — the biggest lever
  if (prefs?.categories?.includes(provider.category)) score += 26
  // rating contribution
  score += (provider.rating - 4) * 14
  // budget fit: reward things comfortably affordable, penalize over-budget
  if (remaining != null) {
    if (provider.cost <= remaining * 0.4) score += 10
    else if (provider.cost <= remaining) score += 4
    else score -= 24
  }
  // dietary nudge: vegan/healthy tags
  if (prefs?.dietary?.includes('vegan') && provider.tags?.includes('vegan')) score += 6
  if (prefs?.dietary?.includes('active') && ['sport'].includes(provider.category)) score += 5
  return Math.max(8, Math.min(99, Math.round(score)))
}

export function recommendForUser(userId, { limit = 6, excludeActive = true } = {}) {
  const s = getState()
  const emp = s.employees[userId]
  if (!emp) return []
  const b = budgetFor(userId)
  const ctx = { prefs: emp.preferences, remaining: b.remaining }
  return PROVIDERS
    .filter((p) => !(excludeActive && emp.activeBenefits.includes(p.id)))
    .map((p) => ({ ...p, score: scoreProvider(p, ctx) }))
    .sort((a, b2) => b2.score - a.score)
    .slice(0, limit)
}

// Aggregate team preference weights for the Deals Engine (what the whole company wants).
export function teamCategoryWeights() {
  const s = getState()
  const weights = {}
  Object.values(s.employees).forEach((e) => {
    e.preferences?.categories?.forEach((c) => { weights[c] = (weights[c] || 0) + 1 })
    e.activeBenefits?.forEach((id) => {
      const p = PROVIDERS.find((x) => x.id === id)
      if (p) weights[p.category] = (weights[p.category] || 0) + 0.5
    })
  })
  return weights
}
