import { Moon, SunMedium } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { navToolbarChipClass } from '@/components/ui/navToolbar'

export default function ThemeToggle({ className, variant = 'default' }) {
  const { isDark, toggleTheme } = useTheme()
  const isNav = variant === 'nav'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        isNav
          ? cn(navToolbarChipClass, 'w-9 px-0 text-text')
          : 'inline-flex items-center gap-2 rounded-full border border-line bg-bg-elevated-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-faint transition-colors hover:text-text',
        className,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {!isNav && <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  )
}
