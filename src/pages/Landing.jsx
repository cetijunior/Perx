import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Wallet, Compass, Sparkles, CheckCircle2, Users, Building2, Store, ChevronDown, Heart, BarChart3, ShieldCheck, MapPin, Gift, Utensils, Dumbbell, Plane, GraduationCap } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SiteNav, SiteFooter, Reveal, Section, SectionHeading } from '@/components/site/Site'
import { fadeUp, stagger } from '@/lib/motion'

const Hero3D = lazy(() => import('@/components/three/Hero3D'))

export default function Landing() {
  const { t } = useTranslation()
  return (
    <div className="relative min-h-dvh bg-bg text-text">
      <SiteNav />
      <Hero t={t} />
      <HowItWorks t={t} />
      <Marketplace t={t} />
      <Personas t={t} />
      <ProgramControl t={t} />
      <FooterCTA t={t} />
      <SiteFooter />
    </div>
  )
}

function Hero({ t }) {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pt-24">
      {/* 3D layer */}
      <div className="absolute inset-0 opacity-70 sm:opacity-80">
        <Suspense fallback={<div className="absolute inset-0 bg-grad-aurora" />}>
          <Hero3D />
        </Suspense>
      </div>
      {/* readability + brand glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgb(var(--bg)/0.92)_0%,rgb(var(--bg)/0.76)_32%,rgb(var(--bg)/0.30)_58%,transparent_76%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/10 to-bg" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-ember/15 blur-[120px]" />

      <motion.div variants={stagger(0.09, 0.1)} initial="hidden" animate="show" className="relative z-10 flex max-w-3xl flex-col items-center text-center before:pointer-events-none before:absolute before:inset-x-[-1.5rem] before:inset-y-[-2rem] before:-z-10 before:rounded-[3rem] before:bg-bg/70 before:blur-2xl sm:before:inset-x-[-3rem] sm:before:inset-y-[-2.5rem]">
        <motion.span variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-bg-elevated/80 px-3 py-1.5 text-xs text-muted shadow-e2 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulsedot" /> JunctionX Tirana 2026
        </motion.span>
        <motion.h1 variants={fadeUp} className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_1px_18px_rgb(var(--bg)/0.9)] sm:text-6xl md:text-7xl">
          {t('landing.headline')}<br />
          <span className="bg-grad-ember bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgb(var(--bg)/0.85)]">{t('landing.headline2')}</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-balance text-base leading-7 text-muted sm:text-lg">
          {t('landing.subtitle')}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button as={Link} to="/login" size="lg" className="w-full sm:w-auto">
            {t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" />
          </Button>
          <Button as="a" href="#how" size="lg" variant="secondary" className="w-full sm:w-auto">
            {t('landing.ctaSecondary')}
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-12 grid grid-cols-3 gap-6 rounded-xl border border-line bg-bg-elevated/50 px-6 py-4 backdrop-blur sm:gap-10">
          <Stat value="12+" label={t('landing.stat1')} />
          <Stat value="92%" label={t('landing.stat2')} />
          <Stat value="4.8★" label={t('landing.stat3')} />
        </motion.div>
      </motion.div>

      <motion.a
        href="#how"
        className="absolute bottom-6 z-10 text-faint"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        aria-label="Scroll"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.a>
    </section>
  )
}

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="font-display text-xl font-bold tnum sm:text-2xl">{value}</div>
    <div className="mt-0.5 text-[0.7rem] text-faint">{label}</div>
  </div>
)

function HowItWorks({ t }) {
  const steps = [
    { icon: Wallet, title: t('landing.how1Title'), body: t('landing.how1') },
    { icon: Compass, title: t('landing.how2Title'), body: t('landing.how2') },
    { icon: Sparkles, title: t('landing.how3Title'), body: t('landing.how3') },
    { icon: CheckCircle2, title: t('landing.how4Title'), body: t('landing.how4') },
  ]
  return (
    <section id="how" className="relative mx-auto max-w-6xl px-5 py-24 sm:py-28">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.howTitle')}</h2>
        <p className="mt-3 text-muted">{t('landing.howSubtitle')}</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <div className="group h-full rounded-lg border border-line bg-bg-elevated p-6 shadow-e2 transition-all hover:-translate-y-1 hover:border-ember/40">
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow"><s.icon className="h-5 w-5" /></span>
                <span className="font-display text-3xl font-bold text-line">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Marketplace({ t }) {
  const categories = [
    { icon: Heart, label: t('landing.categoryWellness'), color: 'var(--cat-wellness)' },
    { icon: Utensils, label: t('landing.categoryFood'), color: 'var(--cat-food)' },
    { icon: Dumbbell, label: t('landing.categorySport'), color: 'var(--cat-sport)' },
    { icon: Plane, label: t('landing.categoryTravel'), color: 'var(--cat-travel)' },
    { icon: GraduationCap, label: t('landing.categoryLearning'), color: 'var(--cat-learning)' },
    { icon: Gift, label: t('landing.categorySelfCare'), color: 'var(--cat-selfcare)' },
  ]
  const highlights = [
    { title: t('landing.marketPoint1Title'), body: t('landing.marketPoint1') },
    { title: t('landing.marketPoint2Title'), body: t('landing.marketPoint2') },
    { title: t('landing.marketPoint3Title'), body: t('landing.marketPoint3') },
  ]
  return (
    <Section className="py-10 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">{t('landing.marketEyebrow')}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.marketTitle')}</h2>
          <p className="mt-4 text-muted">{t('landing.marketBody')}</p>
          <div className="mt-7 grid gap-3">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember/12 text-ember">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c, i) => (
              <div key={c.label} className="flex min-h-32 flex-col justify-between rounded-lg border border-line bg-bg-elevated p-5 shadow-e2">
                <span className="grid h-12 w-12 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.color} 16%, transparent)`, color: c.color }}>
                  <c.icon className="h-6 w-6" />
                </span>
                <span className="mt-5 text-sm font-semibold">{c.label}</span>
                <span className="mt-3 h-1 w-12 rounded-full" style={{ background: c.color }} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

function Personas({ t }) {
  const cards = [
    { icon: Users, title: t('landing.forEmployeesTitle'), body: t('landing.forEmployeesBody'), accent: 'var(--ember)' },
    { icon: Building2, title: t('landing.forCompaniesTitle'), body: t('landing.forCompaniesBody'), accent: 'var(--gold)' },
    { icon: Store, title: t('landing.forProvidersTitle'), body: t('landing.forProvidersBody'), accent: 'var(--cat-travel)' },
  ]
  return (
    <section id="personas" className="relative mx-auto max-w-6xl px-5 py-20">
      <SectionHeading eyebrow={t('landing.personasEyebrow')} title={t('landing.personasTitle')} subtitle={t('landing.personasSubtitle')} />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="relative h-full overflow-hidden rounded-xl border border-line bg-bg-elevated p-7 shadow-e2">
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: c.accent, opacity: 0.12 }} />
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.accent} 16%, transparent)`, color: c.accent }}>
                <c.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted">{c.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function ProgramControl({ t }) {
  const items = [
    { icon: ShieldCheck, title: t('landing.control1Title'), body: t('landing.control1') },
    { icon: BarChart3, title: t('landing.control2Title'), body: t('landing.control2') },
    { icon: MapPin, title: t('landing.control3Title'), body: t('landing.control3') },
  ]
  return (
    <Section className="py-10 sm:py-16">
      <div className="relative overflow-hidden rounded-xl border border-line bg-bg-elevated p-6 shadow-e2 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-60" />
        <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">{t('landing.controlEyebrow')}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t('landing.controlTitle')}</h2>
            <p className="mt-4 text-muted">{t('landing.controlBody')}</p>
          </Reveal>
          <div className="grid gap-3">
            {items.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="flex gap-4 rounded-lg border border-line bg-bg-elevated/80 p-5 backdrop-blur">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow"><item.icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function FooterCTA({ t }) {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-60" />
      <div className="relative mx-auto max-w-6xl px-5 py-20 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-5xl">{t('landing.footerCta')}</h2>
          <div className="mt-8 flex justify-center">
            <Button as={Link} to="/login" size="lg">{t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
