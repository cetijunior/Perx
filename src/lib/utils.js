import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...a) => twMerge(clsx(a))

// Format ALL currency with thin grouping.
export const formatALL = (n) => new Intl.NumberFormat('sq-AL', { maximumFractionDigits: 0 }).format(Math.round(n || 0))

export const cadenceKey = (cadence) => ({ month: 'common.perMonth', once: 'common.once', course: 'common.course', variable: 'common.once' }[cadence] || 'common.once')

// Deterministic gradient for avatars/logo chips, seeded from a string.
const GRADS = [
  ['#FF7A5C', '#F4593B'], ['#F2C879', '#E0A938'], ['#34D399', '#0E9F6E'],
  ['#60A5FA', '#3B82F6'], ['#A78BFA', '#7C3AED'], ['#F472B6', '#DB2777'],
  ['#22D3EE', '#0891B2'], ['#FB923C', '#EA580C'],
]
export function seedGradient(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  const [a, b] = GRADS[h % GRADS.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); return `${d}d ago`
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
