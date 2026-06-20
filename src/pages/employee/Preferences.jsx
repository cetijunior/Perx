import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useCurrentUser, useStore, getState, setPreferences } from '@/lib/store'
import { CATEGORIES } from '@/lib/catalog'
import { fadeUp, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { PageHeader, SectionTitle, Switch } from '@/components/ui/Misc'
import Icon from '@/components/ui/Icon'
import LanguageToggle from '@/components/ui/LanguageToggle'

const DIETARY = [
  { id: 'vegan', label: 'Plant-based' },
  { id: 'glutenfree', label: 'Gluten-free' },
  { id: 'active', label: 'Active lifestyle' },
  { id: 'parent', label: 'Parent' },
  { id: 'beginner', label: 'New to fitness' },
]

export default function Preferences() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const prefs = getState().employees[user.id].preferences
  const [savedAt, setSavedAt] = useState(0)

  function toggle(key, id) {
    const cur = prefs[key] || []
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    setPreferences(user.id, { [key]: next })
    flash()
  }
  function toggleNotif(id) {
    setPreferences(user.id, { notifications: { ...prefs.notifications, [id]: !prefs.notifications[id] } })
    flash()
  }
  function flash() { setSavedAt(Date.now()); setTimeout(() => setSavedAt(0), 1400) }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('prefs.title')} subtitle={t('prefs.subtitle')} />

      <motion.section variants={fadeUp} className="mb-5 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle>{t('prefs.categories')}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = prefs.categories?.includes(c.id)
            return (
              <button
                key={c.id}
                onClick={() => toggle('categories', c.id)}
                className={cn(
                  'group inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all active:scale-95',
                  active ? 'border-ember/40 bg-ember/15 text-text' : 'border-line bg-bg-elevated-2 text-muted hover:border-faint',
                )}
                style={active ? { boxShadow: `0 0 0 2px color-mix(in srgb, var(--cat-${c.color}) 30%, transparent)` } : undefined}
              >
                <Icon name={c.icon} size={14} style={{ color: `var(--cat-${c.color})` }} />
                {c.label}
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            )
          })}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="mb-5 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle>{t('prefs.dietary')}</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {DIETARY.map((d) => {
            const active = prefs.dietary?.includes(d.id)
            return (
              <button
                key={d.id}
                onClick={() => toggle('dietary', d.id)}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-sm transition-all active:scale-95',
                  active ? 'border-gold/40 bg-gold/15 text-text' : 'border-line bg-bg-elevated-2 text-muted hover:border-faint',
                )}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="mb-5 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle>{t('prefs.notifications')}</SectionTitle>
        <div className="space-y-2">
          {[
            { id: 'deals', label: t('prefs.notifDeals') },
            { id: 'approvals', label: t('prefs.notifApprovals') },
            { id: 'streaks', label: t('prefs.notifStreaks') },
          ].map((n) => (
            <label key={n.id} className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-bg-elevated-2 px-4 py-3 hover:border-faint">
              <span className="text-sm">{n.label}</span>
              <Switch on={!!prefs.notifications?.[n.id]} onChange={() => toggleNotif(n.id)} />
            </label>
          ))}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle>{t('common.language')}</SectionTitle>
        <LanguageToggle />
      </motion.section>

      <AnimatePresence>
        {savedAt > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-success/90 px-4 py-2 text-sm font-medium text-on-accent shadow-glow md:bottom-8"
          >
            <Check className="-mt-0.5 mr-1.5 inline h-4 w-4" /> {t('prefs.saved')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
