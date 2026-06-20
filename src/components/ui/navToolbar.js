import { cn } from '@/lib/utils'

/** Outer shell shared by navbar icon chips (theme toggle, language track). */
export const navToolbarChipShellClass =
  'inline-flex h-9 shrink-0 items-center rounded-md border border-line shadow-e1'

/** Interactive navbar chip (theme toggle, menu button). */
export const navToolbarChipClass = cn(
  navToolbarChipShellClass,
  'justify-center bg-bg-elevated text-muted transition-[background,border,color,box-shadow] duration-150 hover:border-faint hover:bg-bg-elevated-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60',
)

export function navToolbarGroupClass(className) {
  return cn('inline-flex shrink-0 items-center gap-1.5', className)
}
