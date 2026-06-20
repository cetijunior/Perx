import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Compass, Sparkles, Flame } from 'lucide-react'
import { useCurrentUser, useStore, getState, addToCart, budgetFor } from '@/lib/store'
import { recommendForUser } from '@/lib/recommend'
import { providerById, SEASONAL } from '@/lib/catalog'
import { formatALL } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/Misc'
import { Countdown } from '@/components/ui/Badge'
import { LogoChip } from '@/components/ui/Avatar'
import OfferCard from '@/components/employee/OfferCard'
import Button from '@/components/ui/Button'

export default function Dashboard() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const nav = useNavigate()
  const s = getState()
  const emp = s.employees[user.id]
  const b = budgetFor(user.id)
  const recs = useMemo(() => recommendForUser(user.id, { limit: 4 }), [user.id, emp])
  const active = emp.activeBenefits.map(providerById).filter(Boolean)
  const cart = emp.cart
  const firstName = user.name.split(' ')[0]

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={`${t('dash.greeting')}, ${firstName} 👋`} subtitle={t('dash.subtitle')} />

      <motion.div variants={fadeUp} className="relative mb-6 overflow-hidden rounded-xl border border-line bg-grad-dusk p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-ember/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wide text-faint">{t('common.budget')} · {t('common.remaining')}</p>
            <p className="font-display text-4xl font-bold tnum text-text">{formatALL(b.remaining)} <span className="text-lg text-faint">LEK</span></p>
            <p className="mt-1 text-xs text-muted">{t('budget.spent')} {formatALL(b.spent)} · {formatALL(b.total)} total</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-semibold text-gold"><Flame className="h-4 w-4" /> {emp.games.streak} {t('budget.streak')}</span>
            <Button as={Link} to="/employee/perky" variant="secondary" size="sm"><Sparkles className="h-4 w-4" /> Perky</Button>
          </div>
        </div>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-bg">
          <motion.div className="h-full bg-grad-ember" initial={{ width: 0 }} animate={{ width: `${b.pct * 100}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </motion.div>

      <motion.section variants={fadeUp} className="mb-7">
        <SectionTitle action={<Link to="/employee/benefits" className="text-xs font-medium text-ember">{t('common.viewAll')}</Link>}>{t('dash.active')}</SectionTitle>
        {active.length === 0 ? (
          <EmptyState icon={<Compass className="h-6 w-6" />} title={t('dash.noActive')} action={<Button as={Link} to="/employee/benefits" size="sm">{t('dash.explore')} <ArrowRight className="h-4 w-4" /></Button>} />
        ) : (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:px-0">
            {active.map((p) => (
              <div key={p.id} className="flex w-60 shrink-0 items-center gap-3 rounded-lg border border-line bg-bg-elevated p-4 md:w-auto">
                <LogoChip name={p.name} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-ember tnum">{formatALL(p.cost)} LEK{p.cadence === 'month' ? t('common.perMonth') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section variants={fadeUp} className="mb-7">
        <SectionTitle action={<span className="flex items-center gap-1 text-xs text-gold"><Sparkles className="h-3.5 w-3.5" /> Perky</span>}>{t('dash.recommended')}</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recs.map((p) => (
            <OfferCard key={p.id} provider={p} score={p.score} compact inCart={cart.includes(p.id)} onAdd={(id) => addToCart(user.id, id)} />
          ))}
        </div>
      </motion.section>

      <motion.section variants={fadeUp}>
        <SectionTitle>{t('dash.whatsNew')}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {SEASONAL.map((deal) => {
            const p = providerById(deal.providerId)
            const expiresAt = s.seededAt + deal.expiresInH * 3600000
            return (
              <button key={deal.id} onClick={() => nav('/employee/benefits')} className="group relative overflow-hidden rounded-lg border border-line bg-bg-elevated p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ember/40">
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl" style={{ background: `var(--cat-${deal.accent})`, opacity: 0.15 }} />
                <div className="mb-3 flex items-center justify-between">
                  <LogoChip name={p.name} size={36} />
                  <Countdown expiresAt={expiresAt} />
                </div>
                <p className="text-sm font-semibold">{deal.title}</p>
                <p className="mt-0.5 text-xs text-muted">{deal.blurb}</p>
              </button>
            )
          })}
        </div>
      </motion.section>
    </motion.div>
  )
}
