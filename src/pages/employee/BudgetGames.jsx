import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Flame, Trophy, Check, ListChecks, History } from 'lucide-react'
import { useCurrentUser, useStore, getState, budgetFor, awardBonus, setGames, completeTask } from '@/lib/store'
import { formatALL, cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle, Ring } from '@/components/ui/Misc'
import ScratchCard from '@/components/employee/ScratchCard'
import SpinWheel from '@/components/employee/SpinWheel'

const TASKS = [
  { id: 'standup', label: 'Attend morning standup', reward: 200 },
  { id: 'pr', label: 'Submit your weekly report', reward: 300 },
  { id: 'helped', label: 'Help a teammate unblock', reward: 250 },
  { id: 'feedback', label: 'Give 1:1 feedback', reward: 200 },
]

export default function BudgetGames() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const emp = getState().employees[user.id]
  const b = budgetFor(user.id)

  // Deterministic per-user prize so it feels meaningful.
  const prize = useMemo(() => {
    const seed = (user.id.charCodeAt(0) + new Date().getDate()) % 4
    return [
      { amount: 500, label: '+500 LEK', subtitle: t('budget.won') + ' — daily bonus', disabledLabel: t('budget.scratchUsed') },
      { amount: 300, label: '+300 LEK', subtitle: t('budget.won') + ' — keep the streak', disabledLabel: t('budget.scratchUsed') },
      { amount: 150, label: '+150 LEK', subtitle: t('budget.won'), disabledLabel: t('budget.scratchUsed') },
      { amount: 0, label: t('budget.tryAgain'), subtitle: 'Better luck tomorrow', disabledLabel: t('budget.scratchUsed') },
    ][seed]
  }, [user.id, t])

  const scratchUsed = emp.games.scratchToday
  const spinsLeft = emp.games.spinsLeft

  function onScratchReveal() {
    if (scratchUsed) return
    if (prize.amount > 0) awardBonus(user.id, prize.amount, 'Scratch card')
    setGames(user.id, { scratchToday: true })
  }
  function onSpinResult(w) {
    setGames(user.id, { spinsLeft: Math.max(0, spinsLeft - 1) })
    if (w.id === 'bonus') awardBonus(user.id, 500, 'Spin wheel bonus')
    else awardBonus(user.id, 100, `Spin: ${w.label} unlocked`)
  }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('budget.title')} subtitle={t('budget.subtitle')} />

      {/* Meter + streak */}
      <motion.div variants={fadeUp} className="mb-6 grid gap-4 md:grid-cols-[auto,1fr]">
        <div className="grid place-items-center rounded-xl border border-line bg-grad-dusk p-6">
          <Ring value={b.pct} size={180} stroke={14}>
            <div>
              <p className="font-display text-3xl font-bold tabular-nums text-text">{Math.round(b.pct * 100)}%</p>
              <p className="text-[0.65rem] uppercase tracking-wide text-faint">{t('budget.available')}</p>
            </div>
          </Ring>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat icon={<Flame className="h-5 w-5" />} accent="gold" label={t('budget.streak')} value={`${emp.games.streak} days`} />
          <Stat icon={<Trophy className="h-5 w-5" />} accent="ember" label={t('budget.spent')} value={`${formatALL(b.spent)} LEK`} />
          <Stat icon={<Check className="h-5 w-5" />} accent="success" label="Bonus earned" value={`+${formatALL(emp.bonus)} LEK`} />
          <Stat icon={<ListChecks className="h-5 w-5" />} accent="info" label="Tasks done" value={`${emp.games.tasks.length}/${TASKS.length}`} className="sm:col-span-3" />
        </div>
      </motion.div>

      {/* Games */}
      <motion.section variants={fadeUp} className="mb-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg-elevated p-5">
          <SectionTitle>{t('budget.scratch')}</SectionTitle>
          <p className="mb-3 text-xs text-muted">{scratchUsed ? t('budget.scratchUsed') : t('budget.scratchHint')}</p>
          <ScratchCard disabled={scratchUsed} prize={prize} onReveal={onScratchReveal} label={t('budget.scratchHint')} />
        </div>
        <div className="rounded-xl border border-line bg-bg-elevated p-5">
          <SectionTitle>{t('budget.spin')}</SectionTitle>
          <p className="mb-3 text-xs text-muted">{spinsLeft === 0 ? t('budget.spinUsed') : t('budget.spinHint')}</p>
          <SpinWheel disabled={spinsLeft === 0} onResult={onSpinResult} />
        </div>
      </motion.section>

      {/* Tasks */}
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

      {/* History */}
      <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<History className="h-4 w-4 text-faint" />}>{t('budget.history')}</SectionTitle>
        <ul className="divide-y divide-line/60">
          {emp.games.history.slice(0, 8).map((h) => (
            <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-muted">{h.label}</span>
              <span className={cn('font-semibold tabular-nums', h.delta >= 0 ? 'text-success' : 'text-danger')}>
                {h.delta >= 0 ? '+' : ''}{formatALL(h.delta)} LEK
              </span>
            </li>
          ))}
        </ul>
      </motion.section>
    </motion.div>
  )
}

function Stat({ icon, accent, label, value, className }) {
  const c = { ember: 'text-ember bg-ember/15', gold: 'text-gold bg-gold/15', success: 'text-success bg-success/15', info: 'text-info bg-info/15' }[accent]
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
