import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { logout, useCurrentUser, useStore, budgetFor } from '@/lib/store'
import { formatALL, cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'
import Avatar from '@/components/ui/Avatar'

function BudgetPill({ user }) {
  useStore()
  const b = budgetFor(user.id)
  const low = b.pct < 0.25
  return (
    <div className="rounded-md border border-line bg-bg-elevated-2 p-3">
      <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-faint">
        <span>Budget</span><span>{Math.round(b.pct * 100)}%</span>
      </div>
      <div className="mt-1 font-display text-lg font-bold tnum text-ember">
        {formatALL(b.remaining)} <span className="text-xs font-medium text-faint">LEK</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
        <motion.div
          className={cn('h-full rounded-full', low ? 'bg-danger' : 'bg-grad-ember')}
          initial={{ width: 0 }} animate={{ width: `${b.pct * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

export default function AppShell({ items, basePath }) {
  const { t } = useTranslation()
  const user = useCurrentUser()
  const nav = useNavigate()
  if (!user) return null
  const isEmployee = user.role === 'employee'

  const doLogout = () => { logout(); nav('/login') }

  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* ===== Desktop sidebar ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-line bg-grad-dusk px-4 py-5 md:flex">
        <div className="px-2"><Logo /></div>

        <div className="mt-6 flex items-center gap-3 rounded-md bg-bg-elevated/60 p-3">
          <Avatar name={user.name} size={42} ring={isEmployee} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-faint">{user.company}</p>
          </div>
        </div>

        {isEmployee && <div className="mt-3"><BudgetPill user={user} /></div>}

        <nav className="mt-5 flex-1 space-y-1">
          {items.map((it) => (
            <NavItem key={it.to} item={it} t={t} />
          ))}
        </nav>

        <button onClick={doLogout} className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-faint transition-colors hover:bg-bg-elevated-2 hover:text-text">
          <LogOut className="h-4 w-4" /> {t('common.logout')}
        </button>
      </aside>

      {/* ===== Mobile top bar ===== */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line glass px-4 py-3 safe-t md:hidden">
        <Logo size={24} />
        {isEmployee
          ? <MobileBudget user={user} />
          : <span className="rounded-full bg-bg-elevated-2 px-3 py-1 text-xs font-medium text-muted">{user.company}</span>}
      </header>

      {/* ===== Content ===== */}
      <main className="md:pl-[260px]">
        <div className="mx-auto max-w-5xl px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8">
          {/* Render the route directly. Each page animates itself in on mount
              (reliable without AnimatePresence); wrapping a keyed <Routes>/Outlet
              in mode="wait" raced the mount and left heavier admin views stuck
              at their initial opacity:0 until a manual reload. */}
          <Outlet />
        </div>
      </main>

      {/* ===== Mobile bottom tabs ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-line glass px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map((it) => <BottomTab key={it.to} item={it} t={t} />)}
      </nav>
    </div>
  )
}

function NavItem({ item, t }) {
  const { to, end, icon: Icon, label } = item
  return (
    <NavLink to={to} end={end} className="block">
      {({ isActive }) => (
        <span className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
          isActive ? 'bg-bg-elevated-2 font-medium text-ember' : 'text-faint hover:bg-bg-elevated/60 hover:text-muted',
        )}>
          <Icon className={cn('h-[18px] w-[18px]', isActive && 'text-ember')} />
          {t(label)}
        </span>
      )}
    </NavLink>
  )
}

function BottomTab({ item, t }) {
  const { to, end, icon: Icon, label, center } = item
  return (
    <NavLink to={to} end={end} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2">
      {({ isActive }) => (
        center ? (
          <>
            <span className={cn('grid h-12 w-12 -translate-y-3 place-items-center rounded-full shadow-glow', isActive ? 'bg-grad-ember' : 'bg-grad-ember/90')}>
              <Icon className="h-5 w-5 text-on-accent" />
            </span>
            <span className={cn('-mt-3 text-[0.6rem]', isActive ? 'text-ember' : 'text-faint')}>{t(label)}</span>
          </>
        ) : (
          <>
            <Icon className={cn('h-[22px] w-[22px]', isActive ? 'text-ember' : 'text-faint')} />
            <span className={cn('text-[0.6rem]', isActive ? 'text-ember' : 'text-faint')}>{t(label)}</span>
            {isActive && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-ember" />}
          </>
        )
      )}
    </NavLink>
  )
}

function MobileBudget({ user }) {
  useStore()
  const b = budgetFor(user.id)
  return (
    <span className="rounded-full border border-line bg-bg-elevated-2 px-3 py-1 text-xs font-semibold tnum text-ember">
      {formatALL(b.remaining)} LEK
    </span>
  )
}
