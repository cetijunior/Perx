import { cn } from '@/lib/utils'

export default function Logo({ className, showWord = true, size = 28 }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display', className)}>
      <img
        src="/Logo.svg"
        alt="PERX"
        width={size}
        height={size}
        className="shrink-0 rounded-md"
        style={{ width: size, height: size }}
      />
      {showWord && <span className="text-xl font-bold tracking-tight text-text">PERX</span>}
    </span>
  )
}
