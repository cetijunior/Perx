import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import LanguageToggle from '@/components/ui/LanguageToggle'
import { fadeUp, stagger, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Shared marketing-site chrome — built in the essence of the hero:   */
/*  dark stone base, ember/gold glows, aurora ambient, calm motion.    */
/* ------------------------------------------------------------------ */

export const NAV_LINKS = [
  { to: '/features', key: 'site.nav.features' },
  { to: '/about', key: 'site.nav.about' },
  { to: '/pricing', key: 'site.nav.pricing' },
  { to: '/contact', key: 'site.nav.contact' },
]

/** Scrolls to top on route change so sub-pages open at their header. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }) }, [pathname])
  return null
}

export function SiteNav() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={cn('transition-colors duration-300', scrolled && 'border-b border-line/60 glass')}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" aria-label="PERX home"><Logo /></Link>

          <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => cn('relative transition-colors hover:text-text', isActive && 'text-text')}
              >
                {({ isActive }) => (
                  <>
                    {t(l.key)}
                    {isActive && <motion.span layoutId="nav-underline" className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-grad-ember" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden sm:inline-flex" />
            <Button as={Link} to="/login" size="sm" variant="secondary" className="hidden sm:inline-flex">{t('nav.login')}</Button>
            <Button as={Link} to="/login" size="sm" className="hidden lg:inline-flex">{t('nav.getStarted')} <ArrowRight className="h-4 w-4" /></Button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-md border border-line bg-bg-elevated-2 text-muted md:hidden"
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
            className="glass mx-4 mt-2 overflow-hidden rounded-lg border border-line p-3 shadow-e3 md:hidden"
          >
            <nav className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => cn('rounded-md px-3 py-2.5 text-sm transition-colors', isActive ? 'bg-bg-elevated-2 text-text' : 'text-muted hover:bg-bg-elevated-2 hover:text-text')}
                >
                  {t(l.key)}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-3">
                <LanguageToggle />
                <Button as={Link} to="/login" size="sm" onClick={() => setOpen(false)}>{t('nav.getStarted')}</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const cols = [
    {
      title: t('site.footer.product'),
      links: [
        { to: '/features', label: t('site.nav.features') },
        { to: '/pricing', label: t('site.nav.pricing') },
        { to: '/login', label: t('nav.login') },
      ],
    },
    {
      title: t('site.footer.company'),
      links: [
        { to: '/about', label: t('site.nav.about') },
        { to: '/contact', label: t('site.nav.contact') },
      ],
    },
    {
      title: t('site.footer.legal'),
      links: [
        { to: '/privacy', label: t('site.footer.privacy') },
        { to: '/terms', label: t('site.footer.terms') },
      ],
    },
  ]
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-50" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted">{t('brand.tagline')}</p>
            <p className="mt-4 text-xs text-faint">{t('landing.footerNote')}</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-faint">{c.title}</p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-sm text-muted transition-colors hover:text-text">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 sm:flex-row">
          <p className="text-xs text-faint">© {year} PERX · {t('site.footer.rights')}</p>
          <LanguageToggle />
        </div>
      </div>
    </footer>
  )
}

/**
 * Reveal-on-mount. We intentionally animate on mount (not `whileInView`):
 * inside AnimatePresence route transitions the IntersectionObserver behind
 * `whileInView` doesn't fire reliably on client-side navigation, leaving
 * sections stuck at opacity:0 until a hard reload. Mount-based animation is
 * deterministic — content is always visible as soon as the route renders.
 */
export function Reveal({ children, className, delay = 0, y = 24 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border border-line bg-bg-elevated/60 px-3 py-1.5 text-xs text-muted backdrop-blur', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulsedot" />
      {children}
    </span>
  )
}

/**
 * Page header in the hero's essence: aurora ambient + ember glow, eyebrow
 * pill, a display headline with an ember-gradient accent word, subtitle.
 */
export function PageHero({ eyebrow, title, accent, subtitle, children }) {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-36 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-70" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-ember/15 blur-[130px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      <motion.div
        variants={stagger(0.09, 0.05)}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        {eyebrow && <motion.div variants={fadeUp} className="mb-5"><Eyebrow>{eyebrow}</Eyebrow></motion.div>}
        <motion.h1 variants={fadeUp} className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
          {title}{accent && <> <span className="bg-grad-ember bg-clip-text text-transparent">{accent}</span></>}
        </motion.h1>
        {subtitle && <motion.p variants={fadeUp} className="mt-5 max-w-xl text-balance text-base text-muted sm:text-lg">{subtitle}</motion.p>}
        {children && <motion.div variants={fadeUp} className="mt-8">{children}</motion.div>}
      </motion.div>
    </section>
  )
}

/** A standard content section wrapper with consistent rhythm. */
export function Section({ id, className, children }) {
  return (
    <section id={id} className={cn('relative mx-auto max-w-6xl px-5 py-16 sm:py-20', className)}>
      {children}
    </section>
  )
}

export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <Reveal className={cn('mb-12', center && 'mx-auto max-w-2xl text-center')}>
      {eyebrow && <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </Reveal>
  )
}

/** Closing call-to-action band — the landing's "make benefits a gift" energy. */
export function CtaBand({ title, body, primary = '/login' }) {
  const { t } = useTranslation()
  return (
    <Section className="py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl border border-line bg-bg-elevated px-6 py-16 text-center shadow-e2">
          <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-70" />
          <div className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-ember/15 blur-[110px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            {body && <p className="mx-auto mt-4 max-w-lg text-muted">{body}</p>}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as={Link} to={primary} size="lg">{t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button>
              <Button as={Link} to="/contact" size="lg" variant="secondary">{t('site.nav.contact')}</Button>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

/** Full marketing-page shell: nav + page hero + content + footer. */
export function SitePage({ children }) {
  return (
    <div className="relative min-h-dvh bg-bg text-text">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
