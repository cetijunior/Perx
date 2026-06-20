import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Gamepad2, Flame, Tag, Ticket, ChevronRight } from 'lucide-react'
import { useCurrentUser, useStore, getState } from '@/lib/store'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle } from '@/components/ui/Misc'
import MiniGamesSection from '@/components/employee/MiniGamesSection'
import Button from '@/components/ui/Button'

export default function Games() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const emp = getState().employees[user.id]
  const unusedCodes = (emp.discountCodes || []).filter((c) => !c.usedAt)
  const playedToday = [
    emp.games.scratchToday,
    emp.games.spinsLeft === 0,
    emp.games.guessToday,
    emp.games.memoryToday,
  ].filter(Boolean).length

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('games.title')} subtitle={t('games.subtitle')} />

      <motion.div variants={fadeUp} className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Flame} label={t('budget.streak')} value={`${emp.games.streak} ${t('budget.days')}`} />
        <StatCard icon={Gamepad2} label={t('games.playedToday')} value={`${playedToday}/4`} />
        <StatCard icon={Tag} label={t('games.codesReady')} value={String(unusedCodes.length)} />
      </motion.div>

      <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ember/20 bg-ember/5 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-text">{t('games.redeemBanner')}</p>
          <p className="text-xs text-muted">{t('games.redeemBannerBody')}</p>
        </div>
        <Button as={Link} to="/employee/card" variant="secondary" size="sm" className="gap-1.5">
          <Ticket className="h-3.5 w-3.5" />
          {t('games.openRedeem')}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SectionTitle>{t('games.dailyMinigames')}</SectionTitle>
        <MiniGamesSection />
      </motion.div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-bg-elevated p-4">
      <div className="flex items-center gap-2 text-faint">
        <Icon className="h-4 w-4 text-ember" />
        <span className="text-[0.65rem] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
