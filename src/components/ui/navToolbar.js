import { cn } from '@/lib/utils'

/** Shared chrome for navbar toolbar controls (theme, language, auth). */
export const navToolbarChipClass =
  'inline-flex h-9 items-center justify-center rounded-md border border-line bg-bg-elevated text-muted shadow-e1 transition-[background,border,color,box-shadow] duration-150 hover:border-faint hover:bg-bg-elevated-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60'

export function navToolbarGroupClass(className) {
  return cn('inline-flex shrink-0 items-center gap-1.5', className)
}
