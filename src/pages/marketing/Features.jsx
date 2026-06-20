import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Wallet, Compass, Sparkles, CheckCircle2, Gamepad2, BarChart3,
  MapPin, Users, Building2, Store, ShieldCheck, Bell, Heart,
  Dumbbell, Plane, GraduationCap, Utensils, ArrowRight,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, CtaBand } from '@/components/site/Site'
import {
  ContentBand, EditorialHeading, FeatureTile, EarthCategoryTile, PersonaCard,
} from '@/components/site/MarketingBlocks'

const CATEGORY_IDS = ['wellness', 'food', 'sport', 'travel', 'learning', 'selfcare']

export default function Features() {
  const { t } = useTranslation()
  const coreIcons = [Wallet, Compass, Sparkles, CheckCircle2, Gamepad2, BarChart3, MapPin, ShieldCheck, Bell]
  const CORE = t('features.core', { returnObjects: true }).map((item, i) => ({ ...item, icon: coreIcons[i] }))
  const categoryIcons = [Heart, Utensils, Dumbbell, Plane, GraduationCap, Sparkles]
  const CATEGORIES = t('features.categories', { returnObjects: true }).map((label, i) => ({
    icon: categoryIcons[i],
    label,
    category: CATEGORY_IDS[i],
  }))
  const personaIcons = [Users, Building2, Store]
  const personaAccents = ['var(--ember)', 'var(--gold)', '#C17B5E']
  const PERSONAS = t('features.personas', { returnObjects: true }).map((item, i) => ({
    ...item,
    icon: personaIcons[i],
    accent: personaAccents[i],
  }))

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

      <ContentBand>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE.map((f, i) => (
            <FeatureTile key={f.title} icon={f.icon} title={f.title} body={f.body} index={i} />
          ))}
        </div>
      </ContentBand>

      <ContentBand variant="alt">
        <EditorialHeading
          eyebrow={t('features.marketEyebrow')}
          title={t('features.marketTitle')}
          subtitle={t('features.marketSubtitle')}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <EarthCategoryTile key={c.label} icon={c.icon} label={c.label} category={c.category} />
          ))}
        </div>
      </ContentBand>

      <ContentBand>
        <EditorialHeading eyebrow={t('features.personasEyebrow')} title={t('features.personasTitle')} />
        <div className="grid gap-4 md:grid-cols-3">
          {PERSONAS.map((c, i) => (
            <PersonaCard key={c.title} icon={c.icon} title={c.title} body={c.body} accent={c.accent} delay={i * 0.1} />
          ))}
        </div>
      </ContentBand>

      <CtaBand title={t('features.ctaTitle')} body={t('features.ctaBody')} />
    </SitePage>
  )
}
