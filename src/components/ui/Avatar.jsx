import { cn } from '@/lib/utils'
import { seedGradient, initials } from '@/lib/utils'

export default function Avatar({ name = '', size = 40, ring = false, className }) {
  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center rounded-full font-semibold text-white', ring && 'ring-2 ring-gold ring-offset-2 ring-offset-bg', className)}
      style={{ width: size, height: size, background: seedGradient(name), fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  )
}

// Monogram logo chip for providers (no grey placeholder boxes, ever).
export function LogoChip({ name = '', size = 40, rounded = 'rounded-md', className }) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center font-bold text-white', rounded, className)}
      style={{ width: size, height: size, background: seedGradient(name), fontSize: size * 0.4 }}
    >
      {name.replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase() || '?'}
    </div>
  )
}
