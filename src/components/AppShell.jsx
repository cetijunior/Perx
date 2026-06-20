import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Menu, X } from 'lucide-react'
import { logout, useCurrentUser, useStore, budgetFor } from '@/lib/store'
import { formatALL, cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'
import Logo from '@/components/ui/Logo'
import Avatar from '@/components/ui/Avatar'
import ThemeToggle from '@/components/ui/ThemeToggle'

function BudgetPill({ user }) {
  useStore()
  const b = budgetFor(user.id)
  const low = b.pct < 0.25
  return (
    <div className="rounded-md border border-line bg-bg p-3">
      <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-faint">
        <span>Budget</span><span>{Math.round(b.pct * 100)}%</span>
      </div>
      <div className="mt-1 font-display text-lg font-bold tnum text-ember">
        {formatALL(b.remaining)} <span className="text-xs font-medium text-faint">LEK</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-elevated-2">
        <motion.div
          className={cn('h-full rounded-full', low ? 'bg-danger' : 'bg-grad-ember')}
          initial={{ width: 0 }} animate={{ width: `${b.pct * 100}%` }} transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  )
}

export default function AppShell({ items, basePath }) {
  const { t } = useTranslation()
  const user = useCurrentUser()
  const nav = useNavigate()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  if (!user) return null
  const isEmployee = user.role === 'employee'

  const barItems = useMemo(() => items.filter((it) => it.mobile !== 'menu'), [items])
  const menuItems = useMemo(() => items.filter((it) => it.mobile === 'menu'), [items])
  const moreActive = menuItems.some((it) => matchItem(it, location.pathname))

  useEffect(() => {
    setMoreOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!moreOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [moreOpen])

  const doLogout = () => { logout(); nav('/login') }
  const firstName = user.name.split(/\s+/)[0] || user.name

  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* ===== Desktop sidebar ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-line bg-bg-elevated px-4 py-5 shadow-e2 md:flex">
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

        <div className="mt-3 flex items-center gap-2">
          <ThemeToggle className="flex-1 justify-center" />
          <button onClick={doLogout} className="flex flex-1 items-center justify-center gap-2.5 rounded-full px-3 py-2.5 text-sm text-faint transition-colors hover:bg-bg-elevated-2 hover:text-text">
            <LogOut className="h-4 w-4" /> {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* ===== Mobile top bar ===== */}
      <header className="app-mobile-header sticky top-0 z-40 md:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 safe-t">
          <Link to={basePath} className="shrink-0" aria-label="PerX home">
            <Logo size={26} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{firstName}</p>
            <p className="truncate text-[0.68rem] text-faint">{user.company}</p>
          </div>
          {isEmployee
            ? <MobileBudget user={user} />
            : (
              <span className="max-w-[7rem] truncate rounded-full border border-line bg-bg-elevated-2 px-2.5 py-1 text-[0.65rem] font-medium text-muted">
                {user.company}
              </span>
            )}
        </div>
      </header>

      {/* ===== Content ===== */}
      <main className="md:pl-[260px]">
        <div className="mx-auto max-w-5xl px-4 pb-[calc(var(--mobile-nav-h)+1.25rem+env(safe-area-inset-bottom))] pt-3 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </div>
      </main>

      {/* ===== Mobile bottom tabs ===== */}
      <nav className="app-mobile-tabbar fixed inset-x-0 bottom-0 z-40 md:hidden" aria-label={t('mobileNav.mainLabel')}>
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {barItems.map((it) => (
            <BottomTab key={it.to} item={it} t={t} short={it.shortLabel} />
          ))}
          {menuItems.length > 0 && (
            <MoreTab
              active={moreActive || moreOpen}
              open={moreOpen}
              onToggle={() => setMoreOpen((v) => !v)}
              t={t}
            />
          )}
        </div>
      </nav>

      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        user={user}
        isEmployee={isEmployee}
        items={menuItems}
        t={t}
        onLogout={doLogout}
      />
    </div>
  )
}

function matchItem({ to, end }, pathname) {
  if (end) return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
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

function BottomTab({ item, t, short }) {
  const { to, end, icon: Icon, label } = item
  return (
    <NavLink to={to} end={end} className="app-mobile-tab group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5">
      {({ isActive }) => (
        <>
          <span className={cn(
            'relative grid h-9 w-9 place-items-center rounded-xl transition-colors',
            isActive ? 'bg-ember/12 text-ember' : 'text-faint group-active:scale-95',
          )}>
            <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={isActive ? 2.25 : 2} />
            {isActive && <span className="absolute -bottom-0.5 h-0.5 w-3 rounded-full bg-ember" />}
          </span>
          <span className={cn(
            'max-w-full truncate px-0.5 text-[0.625rem] font-medium leading-none',
            isActive ? 'text-ember' : 'text-faint',
          )}>
            {t(short || label)}
          </span>
        </>
      )}
    </NavLink>
  )
}

function MoreTab({ active, open, onToggle, t }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={t('mobileNav.more')}
      className="app-mobile-tab group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5"
    >
      <span className={cn(
        'relative grid h-9 w-9 place-items-center rounded-xl transition-colors',
        active ? 'bg-ember/12 text-ember' : 'text-faint group-active:scale-95',
      )}>
        <Menu className="h-[1.35rem] w-[1.35rem]" strokeWidth={active ? 2.25 : 2} />
        {active && <span className="absolute -bottom-0.5 h-0.5 w-3 rounded-full bg-ember" />}
      </span>
      <span className={cn(
        'max-w-full truncate px-0.5 text-[0.625rem] font-medium leading-none',
        active ? 'text-ember' : 'text-faint',
      )}>
        {t('mobileNav.more')}
      </span>
    </button>
  )
}

function MobileMoreSheet({ open, onClose, user, isEmployee, items, t, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t('common.close')}
            className="fixed inset-0 z-50 bg-black/45 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('mobileNav.menuTitle')}
            className="app-mobile-sheet fixed inset-x-0 bottom-[calc(var(--mobile-nav-h)+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg overflow-hidden rounded-t-2xl border border-line shadow-e3 md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user.name} size={40} ring={isEmployee} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-faint">{user.company}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-bg-elevated text-muted transition-colors hover:text-text"
                aria-label={t('common.close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="max-h-[min(52vh,420px)] overflow-y-auto p-2">
              {items.map((it) => (
                <SheetNavItem key={it.to} item={it} t={t} onNavigate={onClose} />
              ))}
            </nav>

            <div className="space-y-2 border-t border-line p-3">
              <div className="flex items-center justify-between rounded-xl border border-line bg-bg-elevated/60 px-3 py-2.5">
                <span className="text-sm text-muted">{t('mobileNav.appearance')}</span>
                <ThemeToggle variant="nav" />
              </div>
              <button
                type="button"
                onClick={() => { onClose(); onLogout() }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-bg-elevated px-3 py-3 text-sm font-medium text-danger transition-colors hover:bg-bg-elevated-2"
              >
                <LogOut className="h-4 w-4" />
                {t('common.logout')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SheetNavItem({ item, t, onNavigate }) {
  const { to, end, icon: Icon, label } = item
  return (
    <NavLink to={to} end={end} onClick={onNavigate} className="block">
      {({ isActive }) => (
        <span className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors',
          isActive ? 'bg-ember/10 font-medium text-ember' : 'text-muted hover:bg-bg-elevated-2 hover:text-text',
        )}>
          <Icon className="h-5 w-5 shrink-0" />
          {t(label)}
        </span>
      )}
    </NavLink>
  )
}

function MobileBudget({ user }) {
  useStore()
  const b = budgetFor(user.id)
  return (
    <Link
      to="/employee/budget"
      className="shrink-0 rounded-full border border-ember/25 bg-ember/8 px-2.5 py-1 text-[0.68rem] font-bold tnum text-ember transition-colors hover:bg-ember/12"
    >
      {formatALL(b.remaining)}
      <span className="ml-0.5 font-semibold opacity-80">L</span>
    </Link>
  )
}
