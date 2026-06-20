import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Gamepad2, Tag } from 'lucide-react'
import { Countdown } from '@/components/ui/Badge'
import { cn, formatALL } from '@/lib/utils'

export function StatTile({ icon, label, value, hint, accent = 'ember', to }) {
  const inner = (
    <>
      <div className={cn(
        'mb-3 grid h-9 w-9 place-items-center rounded-lg',
        accent === 'ember' && 'bg-ember/12 text-ember',
        accent === 'gold' && 'bg-gold/12 text-gold',
        accent === 'success' && 'bg-success/12 text-success',
        accent === 'info' && 'bg-travel/12 text-travel',
      )}
      >
        {icon}
      </div>
      <p className="truncate text-[0.65rem] uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-0.5 truncate font-display text-lg font-bold tabular-nums text-text sm:text-xl">{value}</p>
      {hint && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{hint}</p>}
    </>
  )

  const cls = 'min-w-0 rounded-xl border border-line bg-bg-elevated p-3 shadow-e1 transition-colors hover:border-ember/25 sm:p-4'

  if (to) {
    return (
      <Link to={to} className={cn(cls, 'block')}>
        {inner}
      </Link>
    )
  }
  return <div className={cls}>{inner}</div>
}

export function QuickActionCard({ to, onClick, icon: Icon, title, subtitle, gradient, className }) {
  const body = (
    <div
      className={cn(
        'flex h-full min-h-[96px] flex-col justify-between rounded-xl p-3.5 text-left shadow-e2 transition-transform active:scale-[0.98] sm:min-h-[104px] sm:p-4 sm:hover:-translate-y-0.5',
        gradient || 'bg-grad-ember',
        className,
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-white/95" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-snug text-white/85">{subtitle}</p>
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block h-full w-full min-w-0 text-left">
        {body}
      </button>
    )
  }
  return (
    <Link to={to} className="block h-full w-full min-w-0">
      {body}
    </Link>
  )
}

export function AlertBanner({ icon: Icon, title, body, action, tone = 'ember' }) {
  return (
    <div className={cn(
      'flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between',
      tone === 'ember' && 'border-ember/25 bg-ember/5',
      tone === 'gold' && 'border-gold/25 bg-gold/5',
      tone === 'warning' && 'border-warning/25 bg-warning/5',
    )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
          tone === 'ember' && 'bg-ember/15 text-ember',
          tone === 'gold' && 'bg-gold/15 text-gold',
          tone === 'warning' && 'bg-warning/15 text-warning',
        )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">{title}</p>
          {body && <p className="mt-0.5 text-xs leading-relaxed text-muted">{body}</p>}
        </div>
      </div>
      {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
    </div>
  )
}

export function PerkyInsight({ message, prompt, to = '/employee/perky', className }) {
  return (
    <Link
      to={to}
      state={prompt ? { prompt } : undefined}
      className={cn(
        'group block overflow-hidden rounded-xl border border-line bg-bg-elevated shadow-e1 transition-colors hover:border-gold/35',
        className,
      )}
    >
      <div className="flex items-stretch gap-0">
        <div className="grid w-12 shrink-0 place-items-center bg-gold/12 text-gold sm:w-14">
          <span className="text-lg">✦</span>
        </div>
        <div className="min-w-0 flex-1 px-3 py-3 sm:px-4 sm:py-3.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-gold">Perky</p>
          <p className="mt-1 text-sm leading-relaxed text-muted group-hover:text-text">{message}</p>
        </div>
      </div>
    </Link>
  )
}

export function BudgetSnapshotCard({ b, bonus, t, className }) {
  return (
    <div className={cn('rounded-xl border border-line bg-bg-elevated p-4 shadow-e1', className)}>
      <h3 className="mb-3 text-sm font-semibold">{t('dash.budgetSnapshot')}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted">{t('budget.spent')}</span>
          <span className="shrink-0 font-semibold tabular-nums">{formatALL(b.spent)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted">{t('budget.bonusEarned')}</span>
          <span className="shrink-0 font-semibold tabular-nums text-success">+{formatALL(bonus)}</span>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-2">
          <span className="text-muted">{t('common.budget')}</span>
          <span className="shrink-0 font-bold tabular-nums text-ember">{formatALL(b.total)}</span>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-elevated-2">
        <motion.div
          className="h-full bg-grad-ember"
          initial={{ width: 0 }}
          animate={{ width: `${b.pct * 100}%` }}
          transition={{ duration: 0.9 }}
        />
      </div>
      <Link
        to="/employee/budget"
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-md py-2 text-sm font-medium text-ember transition-colors hover:bg-bg-elevated-2"
      >
        {t('dash.viewBudget')} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export function GamesProgressWidget({ games, t, className }) {
  const played = [
    games.scratchToday,
    games.spinsLeft === 0,
    games.guessToday,
    games.memoryToday,
  ].filter(Boolean).length

  return (
    <Link
      to="/employee/games"
      className={cn(
        'block rounded-xl border border-line bg-bg-elevated p-4 shadow-e1 transition-colors hover:border-gold/30',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold/12 text-gold">
            <Gamepad2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{t('dash.gamesToday')}</h3>
            <p className="text-xs text-muted">{t('dash.gamesTodayHint', { played })}</p>
          </div>
        </div>
        <span className="font-display text-2xl font-bold tabular-nums text-gold">{played}/4</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-elevated-2">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(played / 4) * 100}%` }} />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <Flame className="h-3.5 w-3.5 text-gold" />
        {games.streak} {t('budget.days')} · {t('dash.streakHint')}
      </p>
    </Link>
  )
}

export function CodesWidget({ codes, t, className }) {
  if (!codes.length) return null

  return (
    <div className={cn('rounded-xl border border-line bg-bg-elevated p-4 shadow-e1', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/12 text-gold">
            <Tag className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-semibold">{t('dash.codesReady')}</h3>
        </div>
        <Link to="/employee/card" className="text-xs font-medium text-ember">
          {t('dash.viewAll')}
        </Link>
      </div>
      <ul className="space-y-2">
        {codes.slice(0, 4).map((c) => (
          <li
            key={c.id || c.code}
            className="flex items-center justify-between gap-2 rounded-md bg-bg-elevated-2 px-2.5 py-2"
          >
            <span className="truncate font-mono text-xs font-semibold text-ember">{c.code}</span>
            <span className="shrink-0 text-[0.65rem] text-faint">
              {c.label || `${Math.round((c.discountPct || 0) * 100)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DealSpotlight({ deal, provider, expiresAt, t, className }) {
  if (!deal) return null

  return (
    <Link
      to={provider ? `/employee/benefits/${provider.id}` : '/employee/benefits'}
      className={cn(
        'block overflow-hidden rounded-xl border border-ember/25 bg-gradient-to-br from-ember/8 to-gold/5 p-4 shadow-e1 transition-colors hover:border-ember/40',
        className,
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ember">{t('dash.topDeal')}</p>
      <p className="mt-1 font-display text-lg font-bold leading-tight">{deal.title}</p>
      {provider && <p className="mt-0.5 text-xs text-muted">{provider.name}</p>}
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{deal.blurb}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Countdown expiresAt={expiresAt} label={t('dash.endsIn')} />
        <span className="text-xs font-medium text-ember">{t('dash.explore')} →</span>
      </div>
    </Link>
  )
}

export function PreferencesPrompt({ t, className }) {
  return (
    <div className={cn('rounded-xl border border-dashed border-line bg-bg-elevated/60 p-4 text-center', className)}>
      <p className="text-sm font-medium">{t('dash.inviteExplore')}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{t('dash.inviteExploreBody')}</p>
      <Link
        to="/employee/preferences"
        className="mt-3 inline-flex items-center justify-center rounded-md border border-line bg-bg-elevated px-4 py-2 text-sm font-medium transition-colors hover:bg-bg-elevated-2"
      >
        {t('tabs.preferences')}
      </Link>
    </div>
  )
}

export function ActivityItem({ label, amount, time }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line/60 py-2.5 last:border-0">
      <span className="min-w-0 truncate text-sm text-muted">{label}</span>
      <span className="shrink-0 text-xs font-semibold tabular-nums text-ember">{amount}</span>
    </li>
  )
}
