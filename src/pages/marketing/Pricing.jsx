import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, Section, SectionHeading, Reveal, CtaBand } from '@/components/site/Site'

export default function Pricing() {
  const { t } = useTranslation()
  const PLANS = t('pricing.plans', { returnObjects: true })
  const FAQ = t('pricing.faq', { returnObjects: true })

  return (
    <SitePage>
      <PageHero
        eyebrow={t('pricing.eyebrow')}
        title={t('pricing.title')}
        accent={t('pricing.accent')}
        subtitle={t('pricing.subtitle')}
      />

      <Section className="py-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className={`relative flex h-full flex-col overflow-hidden rounded-xl border p-7 shadow-e2 ${p.featured ? 'border-ember/50 bg-bg-elevated' : 'border-line bg-bg-elevated'}`}>
                {p.featured && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-70" />
                    <span className="absolute right-5 top-5 rounded-full bg-grad-ember px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-on-accent shadow-glow">{t('pricing.popular')}</span>
                  </>
                )}
                <div className="relative">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold tnum">{p.price}</span>
                    <span className="text-sm text-faint">{p.cadence}</span>
                  </div>
                  <Button
                    as={Link}
                    to={p.name === 'Enterprise' ? '/contact' : '/login'}
                    variant={p.featured ? 'primary' : 'secondary'}
                    size="lg"
                    className="mt-6 w-full"
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <ul className="mt-7 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                        <span className="text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow={t('pricing.faqEyebrow')} title={t('pricing.faqTitle')} />
        <div className="mx-auto max-w-2xl space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={(i % 2) * 0.06}>
              <div className="rounded-lg border border-line bg-bg-elevated p-6 shadow-e2">
                <h3 className="text-base font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title={t('pricing.ctaTitle')}
        body={t('pricing.ctaBody')}
      />
    </SitePage>
  )
}
