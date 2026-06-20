import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Wallet, Compass, Sparkles, CheckCircle2, Users, Building2, Store, Heart, BarChart3, ShieldCheck, MapPin, Utensils, Dumbbell, Plane, GraduationCap, Gift } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SiteFooter, Reveal } from '@/components/site/Site'
import {
  ContentBand, EditorialHeading, StepCard, EarthCategoryTile,
  HighlightRow, PersonaCard, ControlPanel,
} from '@/components/site/MarketingBlocks'
import { fadeUp, stagger } from '@/lib/motion'
import { useMediaQuery } from '@/lib/useMediaQuery'

const Hero3D = lazy(() => import('@/components/three/Hero3D'))
const HeroMobileWall = lazy(() => import('@/components/three/HeroMobileWall'))

export default function Landing() {
  const { t } = useTranslation()
  return (
    <div className="relative min-h-dvh bg-bg text-text">
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

function HeroBackdrop({ active }) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return (
    <Suspense fallback={null}>
      {isMobile ? <HeroMobileWall /> : (
        <div className="hero-canvas-root">
          <Hero3D active={active} />
        </div>
      )}
    </Suspense>
  )
}

function Hero({ t }) {
  const heroRef = useRef(null)
  const [active, setActive] = useState(true)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="hero relative min-h-dvh overflow-clip">
      <div className="hero-bg" aria-hidden>
        <HeroBackdrop active={active} />
      </div>

      <motion.div
        variants={stagger(0.08, 0.06)}
        initial="hidden"
        animate="show"
        className="hero-content relative mx-auto w-full max-w-6xl px-4 sm:px-5"
      >
        <div className="hero-copy">
          <motion.h1
            variants={fadeUp}
            className="font-display text-[2.125rem] font-bold leading-[1.08] tracking-tight min-[390px]:text-[2.35rem] sm:text-6xl md:text-7xl"
          >
            <span className="block text-balance">{t('landing.headline')}</span>
            <span className="mt-1 block bg-grad-ember bg-clip-text text-transparent sm:mt-2">
              {t('landing.headline2')}
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-lg text-pretty text-[0.9375rem] leading-6 text-muted sm:mt-6 sm:text-lg sm:leading-7"
          >
            {t('landing.subtitle')}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-6 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3">
            <Button as={Link} to="/login" size="lg" className="w-full sm:w-auto">
              {t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as="a" href="#how" size="lg" variant="secondary" className="w-full sm:w-auto">
              {t('landing.ctaSecondary')}
            </Button>
          </motion.div>
          <motion.div variants={fadeUp} className="hero-stats mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-faint sm:mt-8 sm:text-sm">
            <span><strong className="font-semibold text-muted">12+</strong> {t('landing.stat1')}</span>
            <span><strong className="font-semibold text-muted">92%</strong> {t('landing.stat2')}</span>
            <span><strong className="font-semibold text-muted">4.8★</strong> {t('landing.stat3')}</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function HowItWorks({ t }) {
  const steps = [
    { icon: Wallet, title: t('landing.how1Title'), body: t('landing.how1'), accent: '#C17B5E' },
    { icon: Compass, title: t('landing.how2Title'), body: t('landing.how2'), accent: '#6E9099' },
    { icon: Sparkles, title: t('landing.how3Title'), body: t('landing.how3'), accent: '#7A9485' },
    { icon: CheckCircle2, title: t('landing.how4Title'), body: t('landing.how4'), accent: '#B8895A' },
  ]
  return (
    <ContentBand id="how">
      <EditorialHeading title={t('landing.howTitle')} subtitle={t('landing.howSubtitle')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <StepCard step={i + 1} icon={s.icon} title={s.title} body={s.body} accent={s.accent} />
          </Reveal>
        ))}
      </div>
    </ContentBand>
  )
}

function Marketplace({ t }) {
  const categories = [
    { icon: Heart, label: t('landing.categoryWellness'), category: 'wellness' },
    { icon: Utensils, label: t('landing.categoryFood'), category: 'food' },
    { icon: Dumbbell, label: t('landing.categorySport'), category: 'sport' },
    { icon: Plane, label: t('landing.categoryTravel'), category: 'travel' },
    { icon: GraduationCap, label: t('landing.categoryLearning'), category: 'learning' },
    { icon: Gift, label: t('landing.categorySelfCare'), category: 'selfcare' },
  ]
  const highlights = [
    { title: t('landing.marketPoint1Title'), body: t('landing.marketPoint1') },
    { title: t('landing.marketPoint2Title'), body: t('landing.marketPoint2') },
    { title: t('landing.marketPoint3Title'), body: t('landing.marketPoint3') },
  ]
  return (
    <ContentBand variant="alt">
      <div className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <EditorialHeading
            align="left"
            eyebrow={t('landing.marketEyebrow')}
            title={t('landing.marketTitle')}
            subtitle={t('landing.marketBody')}
            className="!mb-8"
          />
          <div className="grid gap-3">
            {highlights.map((item) => (
              <HighlightRow key={item.title} icon={CheckCircle2} title={item.title} body={item.body} />
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c) => (
              <EarthCategoryTile key={c.label} icon={c.icon} label={c.label} category={c.category} />
            ))}
          </div>
        </Reveal>
      </div>
    </ContentBand>
  )
}

function Personas({ t }) {
  const cards = [
    { icon: Users, title: t('landing.forEmployeesTitle'), body: t('landing.forEmployeesBody'), accent: 'var(--ember)' },
    { icon: Building2, title: t('landing.forCompaniesTitle'), body: t('landing.forCompaniesBody'), accent: 'var(--gold)' },
    { icon: Store, title: t('landing.forProvidersTitle'), body: t('landing.forProvidersBody'), accent: '#C17B5E' },
  ]
  return (
    <ContentBand id="personas">
      <EditorialHeading eyebrow={t('landing.personasEyebrow')} title={t('landing.personasTitle')} subtitle={t('landing.personasSubtitle')} />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <PersonaCard key={c.title} icon={c.icon} title={c.title} body={c.body} accent={c.accent} delay={i * 0.1} />
        ))}
      </div>
    </ContentBand>
  )
}

function ProgramControl({ t }) {
  const items = [
    { icon: ShieldCheck, title: t('landing.control1Title'), body: t('landing.control1') },
    { icon: BarChart3, title: t('landing.control2Title'), body: t('landing.control2') },
    { icon: MapPin, title: t('landing.control3Title'), body: t('landing.control3') },
  ]
  return (
    <ContentBand variant="alt" className="!py-12 sm:!py-16">
      <Reveal>
        <ControlPanel
          eyebrow={t('landing.controlEyebrow')}
          title={t('landing.controlTitle')}
          body={t('landing.controlBody')}
          items={items}
        />
      </Reveal>
    </ContentBand>
  )
}

function FooterCTA({ t }) {
  return (
    <section className="mkt-band-contrast relative border-t border-line/60">
      <div className="pointer-events-none absolute inset-0 mkt-dot-grid opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
        <Reveal>
          <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-ember">{t('landing.ctaPrimary')}</p>
          <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {t('landing.footerCta')}
          </h2>
          <div className="mt-8 flex justify-center">
            <Button as={Link} to="/login" size="lg">{t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
