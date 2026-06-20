import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Flame, Trophy, Check, ListChecks, History, Wallet, Gamepad2, ArrowRight, AlertTriangle,
} from 'lucide-react'
import { useCurrentUser, useStore, getState, budgetFor, completeTask } from '@/lib/store'
import { formatALL, cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle, Ring } from '@/components/ui/Misc'
import Button from '@/components/ui/Button'

const TASKS = [
  { id: 'standup', label: 'Attend morning standup', reward: 200 },
  { id: 'pr', label: 'Submit your weekly report', reward: 300 },
  { id: 'helped', label: 'Help a teammate unblock', reward: 250 },
  { id: 'feedback', label: 'Give 1:1 feedback', reward: 200 },
]

export default function Budget() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const emp = getState().employees[user.id]
  const b = budgetFor(user.id)
  const low = b.pct < 0.25
  const tasksDone = emp.games.tasks.length

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('budget.title')} subtitle={t('budget.subtitle')} />

      {low && (
        <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm text-muted">{t('budget.lowWarning')}</p>
          </div>
          <Button as={Link} to="/employee/benefits" variant="secondary" size="sm">
            {t('dash.explore')}
          </Button>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="mb-6 grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="grid place-items-center rounded-xl border border-line bg-bg-elevated p-6 shadow-e1">
          <Ring value={b.pct} size={180} stroke={14}>
            <div>
              <p className="font-display text-3xl font-bold tabular-nums text-text">{Math.round(b.pct * 100)}%</p>
              <p className="text-[0.65rem] uppercase tracking-wide text-faint">{t('budget.available')}</p>
            </div>
          </Ring>
          <p className="mt-3 font-display text-xl font-bold tabular-nums text-ember">
            {formatALL(b.remaining)} <span className="text-sm font-medium text-faint">LEK</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Stat icon={<Wallet className="h-5 w-5" />} accent="ember" label={t('budget.baseBudget')} value={`${formatALL(b.base)} LEK`} />
          <Stat icon={<Trophy className="h-5 w-5" />} accent="ember" label={t('budget.spent')} value={`${formatALL(b.spent)} LEK`} />
          <Stat icon={<Check className="h-5 w-5" />} accent="success" label={t('budget.bonusEarned')} value={`+${formatALL(emp.bonus)} LEK`} />
          <Stat icon={<Flame className="h-5 w-5" />} accent="gold" label={t('budget.streak')} value={`${emp.games.streak} ${t('budget.days')}`} />
        </div>
      </motion.div>

      <motion.section variants={fadeUp} className="mb-7 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={
          <Button as={Link} to="/employee/games" variant="ghost" size="sm" className="gap-1 text-xs">
            <Gamepad2 className="h-3.5 w-3.5" /> {t('budget.playGames')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }>
          {t('budget.earnMore')}
        </SectionTitle>
        <p className="mb-4 text-sm text-muted">{t('budget.earnMoreBody')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-bg-elevated-2 p-4">
            <p className="text-[0.65rem] uppercase tracking-wide text-faint">{t('budget.tasks')}</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{tasksDone}/{TASKS.length}</p>
            <p className="mt-1 text-xs text-muted">{t('budget.tasksHint')}</p>
          </div>
          <div className="rounded-lg border border-ember/20 bg-ember/5 p-4">
            <p className="text-[0.65rem] uppercase tracking-wide text-faint">{t('budget.gameCodes')}</p>
            <p className="mt-1 text-sm font-medium text-text">{t('budget.gameCodesBody')}</p>
            <Button as={Link} to="/employee/games" variant="secondary" size="sm" className="mt-3 gap-1">
              {t('budget.goToGames')} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="mb-7 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<span className="text-xs text-faint">{t('budget.tasksHint')}</span>}>{t('budget.tasks')}</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {TASKS.map((task) => {
            const done = emp.games.tasks.includes(task.id)
            return (
              <button
                key={task.id}
                disabled={done}
                onClick={() => completeTask(user.id, task.id, task.reward)}
                className={cn(
                  'flex items-center justify-between rounded-md border p-3 text-left transition-colors',
                  done ? 'border-success/30 bg-success/5' : 'border-line bg-bg-elevated-2 hover:border-ember/40',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('grid h-8 w-8 place-items-center rounded-md', done ? 'bg-success/20 text-success' : 'bg-bg-elevated text-faint')}>
                    {done ? <Check className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
                  </span>
                  <span className={cn('text-sm', done && 'text-muted line-through')}>{task.label}</span>
                </div>
                <span className="text-xs font-semibold tabular-nums text-gold">+{task.reward} LEK</span>
              </button>
            )
          })}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<History className="h-4 w-4 text-faint" />}>{t('budget.history')}</SectionTitle>
        {(emp.games.history || []).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{t('budget.noHistory')}</p>
        ) : (
          <ul className="divide-y divide-line/60">
            {(emp.games.history || []).slice(0, 10).map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-muted">{h.label}</span>
                <span className={cn('font-semibold tabular-nums', h.delta >= 0 ? 'text-success' : 'text-danger')}>
                  {h.delta >= 0 ? '+' : ''}{formatALL(h.delta)} LEK
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>
    </motion.div>
  )
}

function Stat({ icon, accent, label, value, className }) {
  const c = {
    ember: 'text-ember bg-ember/15',
    gold: 'text-gold bg-gold/15',
    success: 'text-success bg-success/15',
    info: 'text-info bg-info/15',
  }[accent]
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-line bg-bg-elevated p-4', className)}>
      <span className={cn('grid h-10 w-10 place-items-center rounded-md', c)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-wide text-faint">{label}</p>
        <p className="font-display text-base font-bold tabular-nums">{value}</p>
      </div>
    </div>
  )
}
