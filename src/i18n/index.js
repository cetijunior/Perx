import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import sq from './sq.json'

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('perx:v1') || '{}').lang } catch { return null }
})()

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, sq: { translation: sq } },
  lng: saved || 'sq',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
