import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { NavbarToolbar } from '@/components/site/NavbarToolbar'
import { navToolbarChipClass } from '@/components/ui/navToolbar'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

export const NAV_LINKS = [
  { to: '/features', key: 'site.nav.features' },
  { to: '/about', key: 'site.nav.about' },
  { to: '/contact', key: 'site.nav.contact' },
]

/** True on public marketing pages — hidden inside employee/admin app shells. */
export function isPublicRoute(pathname) {
  return !pathname.startsWith('/employee') && !pathname.startsWith('/admin')
}

export default function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return (
    <header className="site-navbar fixed inset-x-0 top-0">
      <div
        className={cn(
          'site-navbar-bar safe-t border-b transition-[background-color,border-color,box-shadow] duration-300',
          scrolled || open ? 'border-line/80 shadow-e1' : 'border-line/60',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-5 sm:py-4">
          <Link to="/" aria-label="PerX home" className="shrink-0"><Logo /></Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 text-sm md:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => cn(
                  'relative font-medium transition-colors',
                  isActive ? 'text-text' : 'text-muted hover:text-text',
                )}
              >
                {({ isActive }) => (
                  <>
                    {t(l.key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-grad-ember"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle variant="nav" />
              <LanguageToggle variant="nav" />
            </div>
            <NavbarToolbar className="hidden md:inline-flex" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(navToolbarChipClass, 'w-9 px-0 text-text md:hidden')}
              aria-expanded={open}
              aria-label={open ? t('common.close') : t('mobileNav.menuTitle')}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={t('common.close')}
              className="fixed inset-0 z-[8998] bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('mobileNav.menuTitle')}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="site-mobile-menu fixed inset-x-0 top-[var(--site-navbar-h)] z-[9001] max-h-[calc(100dvh-var(--site-navbar-h))] overflow-y-auto border-b border-line px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 shadow-e3 backdrop-blur-xl md:hidden"
            >
              <nav className="mx-auto flex max-w-lg flex-col gap-1" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => cn(
                      'rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                      isActive ? 'bg-ember/10 text-ember' : 'text-text hover:bg-bg-elevated-2',
                    )}
                  >
                    {t(l.key)}
                  </NavLink>
                ))}
              </nav>
              <div className="mx-auto mt-4 flex max-w-lg flex-col gap-3 border-t border-line pt-4">
                <NavbarToolbar className="flex-wrap justify-start" onNavigate={() => setOpen(false)} />
                <Button as={Link} to="/login" size="md" className="w-full" onClick={() => setOpen(false)}>
                  {t('nav.getStarted')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
