import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  primary: 'bg-grad-ember text-on-accent shadow-glow hover:brightness-110 active:brightness-95',
  secondary: 'bg-bg-elevated-2 text-text border border-line hover:border-faint hover:bg-line/40',
  ghost: 'bg-transparent text-muted hover:bg-bg-elevated-2 hover:text-text',
  gold: 'bg-grad-gold text-[#1A1206] shadow-gold hover:brightness-105',
  danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger/10',
}
const SIZES = {
  sm: 'h-9 px-3 text-sm rounded-md gap-1.5',
  md: 'h-11 px-4 text-sm rounded-md gap-2',
  lg: 'h-13 px-6 text-base rounded-md gap-2 min-h-[52px]',
  icon: 'h-11 w-11 rounded-md',
}

// Polymorphic button. Tap feedback via CSS active:scale (works for any element).
export default function Button({
  variant = 'primary', size = 'md', className, children, loading, disabled, as: Cmp = 'button', ...props
}) {
  const isNative = Cmp === 'button'
  return (
    <Cmp
      {...(isNative ? { disabled: disabled || loading } : {})}
      aria-disabled={disabled || loading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center font-medium select-none',
        'transition-[filter,background,border,color,transform] duration-150 outline-none',
        'active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ember/60',
        (disabled || loading) && 'opacity-50 pointer-events-none',
        VARIANTS[variant], SIZES[size], className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-80')}>{children}</span>
    </Cmp>
  )
}
