import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { setLang } from '@/lib/store'
import { cn } from '@/lib/utils'
import { navToolbarChipShellClass } from '@/components/ui/navToolbar'

const SPRING = { type: 'spring', stiffness: 380, damping: 30 }

function LangSegment({ lang, active, layoutId, onSelect, animate }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lang)}
      aria-pressed={active}
      className={cn(
        'relative flex h-7 min-w-[2.25rem] items-center justify-center rounded-[5px] px-2.5 text-xs font-semibold uppercase transition-colors duration-150',
        active ? 'text-on-accent' : 'bg-transparent text-muted hover:text-text',
      )}
    >
      {active && animate && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-[5px] bg-ember shadow-sm"
          transition={SPRING}
          aria-hidden
        />
      )}
      {active && !animate && (
        <span className="absolute inset-0 rounded-[5px] bg-ember shadow-sm" aria-hidden />
      )}
      <span className="relative z-10">{lang}</span>
    </button>
  )
}

export default function LanguageToggle({ className, variant = 'default' }) {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('sq') ? 'sq' : 'en'
  const choose = (l) => { i18n.changeLanguage(l); setLang(l) }
  const isNav = variant === 'nav'
  const layoutId = isNav ? 'nav-lang-pill' : 'lang-pill'

  return (
    <div
      className={cn(
        isNav
          ? cn(navToolbarChipShellClass, 'bg-bg-elevated p-0.5')
          : 'inline-flex items-center rounded-full border border-line bg-bg-elevated-2 p-0.5',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {['sq', 'en'].map((l) => (
        <LangSegment
          key={l}
          lang={l}
          active={lang === l}
          layoutId={layoutId}
          onSelect={choose}
          animate={!isNav}
        />
      ))}
    </div>
  )
}
