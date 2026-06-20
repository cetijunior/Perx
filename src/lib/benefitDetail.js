import { PACKAGES, SEASONAL, PROVIDERS, providerById } from './catalog'
import { scoreProvider } from './recommend'
import { getState, budgetFor } from './store'

export function packagesForProvider(slug) {
  return PACKAGES.filter((pkg) => pkg.items.includes(slug))
}

export function dealsForProvider(slug) {
  return SEASONAL.filter((d) => d.providerId === slug)
}

export function pendingRequestForProvider(slug, requests) {
  return requests.find((r) => r.status === 'pending' && r.items?.includes(slug))
}

export function providerDescription(t, provider) {
  const base = `catalog.providers.${provider.id}`
  return t(`${base}.description`, {
    defaultValue: t(`${base}.blurb`, { defaultValue: provider.blurb || '' }),
  })
}

export function cadenceLabel(t, cadence) {
  const key = `detail.cadence.${cadence}`
  const translated = t(key, { defaultValue: '' })
  if (translated) return translated
  return t(`common.${cadence}`, { defaultValue: cadence })
}

export function relatedProviders(slug, userId, { limit = 3 } = {}) {
  const current = providerById(slug)
  if (!current) return []
  const s = getState()
  const emp = s.employees[userId]
  if (!emp) return []
  const b = budgetFor(userId)
  const ctx = { prefs: emp.preferences, remaining: b.remaining }
  return PROVIDERS
    .filter((p) => p.id !== slug && p.category === current.category)
    .map((p) => ({ ...p, score: scoreProvider(p, ctx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function codesForProvider(slug, codes = []) {
  return (codes || []).filter((c) => !c.usedAt && (!c.providerSlug || c.providerSlug === slug))
}
