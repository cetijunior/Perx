import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Wallet, Compass, Sparkles, CheckCircle2, Gamepad2, BarChart3,
  MapPin, Users, Building2, Store, ShieldCheck, Bell, Heart,
  Dumbbell, Plane, GraduationCap, Utensils, ArrowRight,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, Section, SectionHeading, Reveal, CtaBand } from '@/components/site/Site'

export default function Features() {
  const { t } = useTranslation()
  const coreIcons = [Wallet, Compass, Sparkles, CheckCircle2, Gamepad2, BarChart3, MapPin, ShieldCheck, Bell]
  const CORE = t('features.core', { returnObjects: true }).map((item, i) => ({ ...item, icon: coreIcons[i] }))
  const categoryIcons = [Heart, Utensils, Dumbbell, Plane, GraduationCap, Sparkles]
  const categoryColors = ['var(--cat-wellness)', 'var(--cat-food)', 'var(--cat-sport)', 'var(--cat-travel)', 'var(--cat-learning)', 'var(--cat-selfcare)']
  const CATEGORIES = t('features.categories', { returnObjects: true }).map((label, i) => ({ icon: categoryIcons[i], label, color: categoryColors[i] }))
  const personaIcons = [Users, Building2, Store]
  const personaAccents = ['var(--ember)', 'var(--gold)', 'var(--cat-travel)']
  const PERSONAS = t('features.personas', { returnObjects: true }).map((item, i) => ({ ...item, icon: personaIcons[i], accent: personaAccents[i] }))

  return (
    <SitePage>
      <PageHero
        eyebrow={t('features.eyebrow')}
        title={t('features.title')}
        accent={t('features.accent')}
        subtitle={t('features.subtitle')}
      >
        <Button as={Link} to="/login" size="lg">{t('landing.ctaPrimary')} <ArrowRight className="h-4 w-4" /></Button>
      </PageHero>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07}>
              <div className="group h-full rounded-lg border border-line bg-bg-elevated p-6 shadow-e2 transition-all hover:-translate-y-1 hover:border-ember/40">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading
          eyebrow={t('features.marketEyebrow')}
          title={t('features.marketTitle')}
          subtitle={t('features.marketSubtitle')}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={(i % 6) * 0.05}>
              <div className="flex h-full flex-col items-center gap-3 rounded-lg border border-line bg-bg-elevated p-5 text-center shadow-e2">
                <span className="grid h-12 w-12 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.color} 16%, transparent)`, color: c.color }}>
                  <c.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium">{c.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow={t('features.personasEyebrow')} title={t('features.personasTitle')} />
        <div className="grid gap-4 md:grid-cols-3">
          {PERSONAS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
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
      </Section>

      <CtaBand
        title={t('features.ctaTitle')}
        body={t('features.ctaBody')}
      />
    </SitePage>
  )
}
