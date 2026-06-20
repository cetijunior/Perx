import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp } from '@/lib/motion'

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-md', className)} />
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <motion.h1 variants={fadeUp} className="text-2xl font-bold tracking-tight md:text-3xl">{title}</motion.h1>
        {subtitle && <motion.p variants={fadeUp} className="mt-1 text-sm text-muted">{subtitle}</motion.p>}
      </div>
      {action}
    </div>
  )
}

// Single source of truth for every on/off toggle in the app.
// Flex + padding keeps the knob inside the track; rem-based translate scales
// with font size so it can never overflow the way a fixed-px translate could.
export function Switch({ on, onChange, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
        on ? 'bg-grad-ember' : 'bg-line',
        className,
      )}
    >
      <span
        className={cn(
          'h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          on ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-bg-elevated/50 px-6 py-12 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-bg-elevated-2 text-ember">{icon}</div>
      {title && <p className="font-medium">{title}</p>}
      {children && <p className="mt-1 max-w-xs text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Animated progress ring used by the budget meter.
export function Ring({ value = 0, size = 160, stroke = 14, color = 'var(--ember)', track = 'rgb(var(--surface-line))', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c * Math.min(1, Math.max(0, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - dash }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
