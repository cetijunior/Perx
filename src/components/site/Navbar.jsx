import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
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

  return (
    <header className="site-navbar fixed inset-x-0 top-0">
      <div
        className={cn(
          'site-navbar-bar safe-t border-b transition-[background-color,border-color,box-shadow] duration-300',
          scrolled ? 'border-line/80 shadow-e1' : 'border-line/60',
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:py-4">
          <Link to="/" aria-label="PERX home" className="shrink-0"><Logo /></Link>

          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Main">
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

          <div className="flex items-center gap-2">
            <NavbarToolbar className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={cn(navToolbarChipClass, 'w-9 px-0 text-text md:hidden')}
              aria-expanded={open}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="site-mobile-menu mx-4 mt-2 overflow-hidden rounded-lg border border-line p-3 shadow-e3 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn(
                    'rounded-md px-3 py-2.5 text-sm transition-colors',
                    isActive ? 'bg-bg-elevated-2 text-text' : 'text-muted hover:bg-bg-elevated-2 hover:text-text',
                  )}
                >
                  {t(l.key)}
                </NavLink>
              ))}
              <div className="mt-3 space-y-3 border-t border-line pt-3">
                <NavbarToolbar className="flex-wrap" onNavigate={() => setOpen(false)} />
                <Button as={Link} to="/login" size="sm" className="w-full lg:hidden" onClick={() => setOpen(false)}>
                  {t('nav.getStarted')}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
