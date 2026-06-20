import { useTranslation } from 'react-i18next'
import LegalLayout from './Legal'

export default function Terms() {
  const { t } = useTranslation()
  return (
    <LegalLayout
      eyebrow={t('terms.eyebrow')}
      title={t('terms.title')}
      accent={t('terms.accent')}
      updated={t('terms.updated')}
      intro={t('terms.intro')}
      sections={t('terms.sections', { returnObjects: true })}
    />
  )
}
