import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  RefreshCw, AlertCircle, ChevronRight, QrCode, Tag, Copy, Check, Gamepad2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrentUser, useStore, markDiscountCodeUsed } from '@/lib/store'
import { CATEGORIES, catColor } from '@/lib/catalog'
import { fadeUp, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { PageHeader, EmptyState } from '@/components/ui/Misc'
import BenefitQrModal from '@/components/employee/BenefitQrModal'
import Icon from '@/components/ui/Icon'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

function categoryIcon(category) {
  return CATEGORIES.find((c) => c.id === category)?.icon || 'Gift'
}

function formatExpiry(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Card() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBenefit, setSelectedBenefit] = useState(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const loadCard = useCallback(async () => {
    setError(null)
    try {
      const { card: next } = await api.myCard()
      setCard(next)
    } catch (err) {
      setError(err.message || 'request_failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCard() }, [loadCard])

  function openBenefit(benefit) {
    setSelectedBenefit(benefit)
    setQrOpen(true)
  }

  function closeQr() {
    setQrOpen(false)
    setTimeout(() => setSelectedBenefit(null), 220)
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code.code)
      setCopiedId(code.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }

  async function handleUseCode(code) {
    await markDiscountCodeUsed(user.id, code.id)
    await loadCard()
  }

  const benefits = card?.benefits?.length
    ? card.benefits
    : (card?.activeBenefits || []).map((slug) => ({ slug, name: slug, category: 'wellness' }))

  const discountCodes = card?.discountCodes || []

  return (
    <>
      <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
        <PageHeader title={t('card.title')} subtitle={t('card.subtitle')} />

        {loading && !card ? (
          <motion.div variants={fadeUp} className="grid place-items-center py-24">
            <RefreshCw className="h-8 w-8 animate-spin text-ember" />
          </motion.div>
        ) : error && !card ? (
          <motion.div variants={fadeUp}>
            <EmptyCardState onRetry={loadCard} t={t} />
          </motion.div>
        ) : card ? (
          <div className="mx-auto max-w-md space-y-5">
            <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                  <Tag className="h-4 w-4 text-ember" />
                  {t('card.codesTitle')}
                </h2>
                <span className="text-xs text-faint">{t('card.codesHint')}</span>
              </div>

              {discountCodes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line bg-bg-elevated-2 px-4 py-6 text-center">
                  <Gamepad2 className="mx-auto mb-2 h-8 w-8 text-faint" />
                  <p className="text-sm font-medium text-text">{t('card.noCodes')}</p>
                  <p className="mt-1 text-xs text-muted">{t('card.noCodesBody')}</p>
                  <Button as={Link} to="/employee/games" variant="secondary" size="sm" className="mt-4">
                    {t('card.playGames')}
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {discountCodes.map((code, i) => (
                    <motion.li
                      key={code.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35 }}
                      className="rounded-xl border border-line bg-bg-elevated-2 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text">{code.label}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {Math.round(code.discountPct * 100)}% · {t('card.expires')} {formatExpiry(code.expiresAt)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-gold">
                          {t('card.oneTime')}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <code className="flex-1 truncate rounded-md border border-line bg-bg-elevated px-2.5 py-2 font-mono text-sm font-bold tracking-wider text-ember">
                          {code.code}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyCode(code)}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-bg-elevated text-muted transition-colors hover:border-ember/40 hover:text-ember"
                          aria-label={t('card.copyCode')}
                        >
                          {copiedId === code.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUseCode(code)}
                        className="mt-2 w-full rounded-md border border-line px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-success/40 hover:text-success"
                      >
                        {t('card.markUsed')}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.section>

            <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight">{t('card.redeemTitle')}</h2>
                <span className="text-xs text-faint">{t('card.redeemHint')}</span>
              </div>

              {benefits.length === 0 ? (
                <EmptyState
                  icon={<QrCode className="h-6 w-6" />}
                  title={t('card.noBenefits')}
                >
                  {t('card.noBenefitsBody')}
                </EmptyState>
              ) : (
                <ul className="space-y-2">
                  {benefits.map((benefit, i) => {
                    const color = catColor(benefit.category)
                    return (
                      <motion.li
                        key={benefit.slug}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.35 }}
                      >
                        <button
                          type="button"
                          onClick={() => openBenefit(benefit)}
                          className="group flex w-full items-center gap-3 rounded-xl border border-line bg-bg-elevated-2 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-ember/35 hover:shadow-e2 active:scale-[0.99]"
                        >
                          <span
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105"
                            style={{
                              background: `color-mix(in srgb, ${color} 16%, transparent)`,
                              color,
                            }}
                          >
                            <Icon name={categoryIcon(benefit.category)} className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-text">{benefit.name}</span>
                            <span className="mt-0.5 block text-xs capitalize text-faint">{benefit.category}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-ember opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <QrCode className="h-3.5 w-3.5" />
                            {t('card.showQr')}
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ember" />
                        </button>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </motion.section>
          </div>
        ) : null}
      </motion.div>

      <BenefitQrModal benefit={selectedBenefit} open={qrOpen} onClose={closeQr} />
    </>
  )
}

function EmptyCardState({ onRetry, t }) {
  return (
    <div className={cn('flex flex-col items-center gap-4 py-8 text-center')}>
      <AlertCircle className="h-10 w-10 text-danger" />
      <p className="text-sm text-muted">{t('card.loadError')}</p>
      <Logo variant="mark" size={32} />
      <Button variant="secondary" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        {t('card.tapRefresh')}
      </Button>
    </div>
  )
}
