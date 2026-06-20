import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { setLang } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function LanguageToggle({ className }) {
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('sq') ? 'sq' : 'en'
  const choose = (l) => { i18n.changeLanguage(l); setLang(l) }
  return (
    <div className={cn('relative inline-flex items-center rounded-full border border-line bg-bg-elevated-2 p-0.5', className)}>
      {['sq', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => choose(l)}
          className={cn('relative z-10 rounded-full px-3 py-1 text-xs font-semibold uppercase transition-colors', lang === l ? 'text-on-accent' : 'text-faint hover:text-text')}
        >
          {lang === l && (
            <motion.span layoutId="langpill" className="absolute inset-0 -z-10 rounded-full bg-grad-ember" transition={{ type: 'spring', stiffness: 300, damping: 26 }} />
          )}
          {l}
        </button>
      ))}
    </div>
  )
}
