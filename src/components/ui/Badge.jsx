import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/catalog'
import Icon from './Icon'

export function CategoryChip({ category, withIcon = true, className }) {
  const cat = CATEGORIES.find((c) => c.id === category)
  if (!cat) return null
  const c = `var(--cat-${cat.color})`
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium', className)}
      style={{ color: c, background: `rgb(var(--cat-${cat.color}) / 0.14)` }}
    >
      {withIcon ? <Icon name={cat.icon} size={12} /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />}
      {cat.label}
    </span>
  )
}

const STATUS = {
  pending: { c: 'var(--warning)', label: 'common.pending' },
  approved: { c: 'var(--success)', label: 'common.approved' },
  rejected: { c: 'var(--danger)', label: 'common.rejected' },
}
export function StatusChip({ status, t }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium"
      style={{ color: s.c, background: `color-mix(in srgb, ${s.c} 14%, transparent)` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
      {t ? t(s.label) : status}
    </span>
  )
}

export function RewardBadge({ children, className }) {
  return (
    <span className={cn('relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-grad-gold px-2.5 py-1 text-[0.7rem] font-semibold text-[#1A1206]', className)}>
      <span className="pointer-events-none absolute inset-0 -skew-x-12 bg-white/40 blur-md animate-sweep" style={{ width: '30%' }} />
      {children}
    </span>
  )
}

// Live countdown pill. expiresAt = timestamp ms.
export function Countdown({ expiresAt, label }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i) }, [])
  const left = Math.max(0, expiresAt - now)
  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-grad-ember px-2.5 py-1 text-[0.7rem] font-semibold text-on-accent tnum">
      <span className="w-1.5 h-1.5 rounded-full bg-on-accent/80 animate-pulsedot" />
      {label ? `${label} ` : ''}{h}h {String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
    </span>
  )
}
