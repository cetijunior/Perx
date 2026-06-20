import { useTranslation } from 'react-i18next'
import { Mountain, Flame, Gem, Heart, Compass, Users } from 'lucide-react'
import { SitePage, PageHero, CtaBand, Reveal } from '@/components/site/Site'
import {
  ContentBand, EditorialHeading, StatStrip, FeatureTile,
} from '@/components/site/MarketingBlocks'

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

      <ContentBand className="!py-12">
        <StatStrip stats={STATS} />
      </ContentBand>

      <ContentBand variant="alt">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <EditorialHeading
              align="left"
              eyebrow={t('about.missionEyebrow')}
              title={t('about.missionTitle')}
              className="!mb-6"
            />
            <div className="space-y-4 leading-relaxed text-muted">
              {missionParagraphs.map((p) => <p key={p}>{p}</p>)}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-3">
              {BRAND.map((b, i) => (
                <FeatureTile key={b.title} icon={b.icon} title={b.title} body={b.body} index={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </ContentBand>

      <ContentBand>
        <EditorialHeading eyebrow={t('about.valuesEyebrow')} title={t('about.valuesTitle')} />
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <FeatureTile key={v.title} icon={v.icon} title={v.title} body={v.body} index={i} />
          ))}
        </div>
      </ContentBand>

      <ContentBand variant="alt">
        <EditorialHeading eyebrow={t('about.timelineEyebrow')} title={t('about.timelineTitle')} />
        <div className="mx-auto max-w-2xl">
          {TIMELINE.map((tl, i) => (
            <Reveal key={tl.title} delay={i * 0.08}>
              <div className="relative flex gap-5 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember/15 text-xs font-bold text-ember ring-1 ring-ember/30">{i + 1}</span>
                  {i < TIMELINE.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                </div>
                <div className="pb-2">
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-faint">{tl.when}</p>
                  <h3 className="mt-1 text-base font-semibold">{tl.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{tl.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </ContentBand>

      <CtaBand title={t('about.ctaTitle')} body={t('about.ctaBody')} />
    </SitePage>
  )
}
