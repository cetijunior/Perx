import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import LanguageToggle from '@/components/ui/LanguageToggle'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { fadeUp, stagger, EASE } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Shared marketing-site chrome — theme-aware (light + dark).         */
/* ------------------------------------------------------------------ */

/** Scrolls to top on route change so sub-pages open at their header. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }) }, [pathname])
  return null
}

export function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const cols = [
    {
      title: t('site.footer.product'),
      links: [
        { to: '/features', label: t('site.nav.features') },
        { to: '/about', label: t('site.nav.about') },
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
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
 * Page header — aurora ambient + ember glow, eyebrow pill, display headline.
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

export function SectionHeading({ eyebrow, title, subtitle, center = true, className }) {
  return (
    <Reveal className={cn('mb-12', center && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">
          <span className="hidden h-px w-6 bg-ember/40 sm:inline-block" aria-hidden />
          {eyebrow}
          <span className="hidden h-px w-6 bg-ember/40 sm:inline-block" aria-hidden />
        </p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-muted">{subtitle}</p>}
    </Reveal>
  )
}

/** Closing call-to-action band — the landing's "make benefits a gift" energy. */
export function CtaBand({ title, body, primary = '/login' }) {
  const { t } = useTranslation()
  return (
    <section className="mkt-band mkt-band-contrast relative border-y border-line/50">
      <div className="pointer-events-none absolute inset-0 mkt-dot-grid opacity-[0.25]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated px-6 py-16 text-center shadow-e3 sm:px-10">
          <div className="pointer-events-none absolute inset-0 mkt-dot-grid opacity-20" aria-hidden />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-ember/12 blur-[100px]" />
          <div className="relative">
            <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ember">{t('landing.ctaPrimary')}</p>
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            {body && <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted">{body}</p>}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as={Link} to={primary} size="lg">{t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button>
              <Button as={Link} to="/contact" size="lg" variant="secondary">{t('site.nav.contact')}</Button>
            </div>
          </div>
        </div>
      </Reveal>
      </div>
    </section>
  )
}

/** Full marketing-page shell: page content + footer. Navbar is mounted globally in App. */
export function SitePage({ children }) {
  return (
    <div className="relative min-h-dvh bg-bg text-text">
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
