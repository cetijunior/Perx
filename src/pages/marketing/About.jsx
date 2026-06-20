import { useTranslation } from 'react-i18next'
import { Mountain, Flame, Gem, Heart, Compass, Users } from 'lucide-react'
import { SitePage, PageHero, Section, SectionHeading, Reveal, CtaBand } from '@/components/site/Site'

export default function About() {
  const { t } = useTranslation()
  const STATS = t('about.stats', { returnObjects: true })
  const valueIcons = [Heart, Gem, Compass, Users]
  const VALUES = t('about.values', { returnObjects: true }).map((item, i) => ({ ...item, icon: valueIcons[i] }))
  const brandIcons = [Mountain, Flame, Gem]
  const BRAND = t('about.brand', { returnObjects: true }).map((item, i) => ({ ...item, icon: brandIcons[i] }))
  const TIMELINE = t('about.timeline', { returnObjects: true })
  const missionParagraphs = t('about.missionParagraphs', { returnObjects: true })

  return (
    <SitePage>
      <PageHero
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        accent={t('about.accent')}
        subtitle={t('about.subtitle')}
      />

      <Section className="py-10">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-e2 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-bg-elevated px-5 py-8 text-center">
                <div className="font-display text-3xl font-bold tnum sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs text-faint">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">{t('about.missionEyebrow')}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t('about.missionTitle')}</h2>
            <div className="mt-5 space-y-4 text-muted">
              {missionParagraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-xl border border-line bg-bg-elevated p-7 shadow-e2">
              <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-70" />
              <div className="relative grid gap-4">
                {BRAND.map((b) => (
                  <div key={b.title} className="flex gap-4 rounded-lg border border-line bg-bg-elevated/70 p-4 backdrop-blur">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow"><b.icon className="h-5 w-5" /></span>
                    <div>
                      <h3 className="text-sm font-semibold">{b.title}</h3>
                      <p className="mt-1 text-sm text-muted">{b.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow={t('about.valuesEyebrow')} title={t('about.valuesTitle')} />
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={(i % 2) * 0.08}>
              <div className="flex h-full gap-4 rounded-lg border border-line bg-bg-elevated p-6 shadow-e2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-bg-elevated-2 text-ember"><v.icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-base font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{v.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow={t('about.timelineEyebrow')} title={t('about.timelineTitle')} />
        <div className="mx-auto max-w-2xl">
          {TIMELINE.map((tl, i) => (
            <Reveal key={tl.title} delay={i * 0.08}>
              <div className="relative flex gap-5 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-grad-ember text-xs font-bold text-on-accent shadow-glow">{i + 1}</span>
                  {i < TIMELINE.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                </div>
                <div className="pb-2">
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-faint">{tl.when}</p>
                  <h3 className="mt-1 text-base font-semibold">{tl.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{tl.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title={t('about.ctaTitle')}
        body={t('about.ctaBody')}
      />
    </SitePage>
  )
}
