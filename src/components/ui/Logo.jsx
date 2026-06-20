import { cn } from '@/lib/utils'

export default function Logo({ className, showWord = true, size = 28 }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display', className)}>
      <span
        className="grid place-items-center rounded-md bg-grad-ember text-on-accent font-bold shadow-glow"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        P
      </span>
      {showWord && <span className="text-xl font-bold tracking-tight">PERX</span>}
    </span>
  )
}
