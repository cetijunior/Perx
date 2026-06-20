import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { setLang } from '@/lib/store'
import { cn } from '@/lib/utils'
import { navToolbarChipClass } from '@/components/ui/navToolbar'

export default function LanguageToggle({ className, variant = 'default' }) {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('sq') ? 'sq' : 'en'
  const choose = (l) => { i18n.changeLanguage(l); setLang(l) }
  const isNav = variant === 'nav'

  return (
    <div
      className={cn(
        isNav
          ? cn(navToolbarChipClass, 'gap-0 p-0.5')
          : 'relative inline-flex items-center rounded-full border border-line bg-bg-elevated-2 p-0.5',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {['sq', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          className={cn(
            'relative rounded-[5px] px-2.5 text-xs font-semibold uppercase transition-colors',
            isNav ? 'h-7 min-w-[2.25rem]' : 'rounded-full px-3 py-1',
            lang === l ? 'text-on-accent' : 'text-faint hover:text-text',
          )}
        >
          {lang === l && (
            <motion.span
              layoutId={isNav ? 'nav-lang-pill' : 'langpill'}
              className="absolute inset-0 -z-10 rounded-[5px] bg-grad-ember"
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            />
          )}
          {l}
        </button>
      ))}
    </div>
  )
}
