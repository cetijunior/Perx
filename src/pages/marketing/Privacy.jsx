import { useTranslation } from 'react-i18next'
import LegalLayout from './Legal'

export default function Privacy() {
  const { t } = useTranslation()
  return (
    <LegalLayout
      eyebrow={t('privacy.eyebrow')}
      title={t('privacy.title')}
      accent={t('privacy.accent')}
      updated={t('privacy.updated')}
      intro={t('privacy.intro')}
      sections={t('privacy.sections', { returnObjects: true })}
    />
  )
}
