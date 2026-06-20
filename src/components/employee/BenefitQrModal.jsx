import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { X, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORIES, catColor } from '@/lib/catalog'
import { MembershipCardQr } from '@/components/ui/MembershipCardQr'
import { Ring } from '@/components/ui/Misc'
import Icon from '@/components/ui/Icon'
import Button from '@/components/ui/Button'

const REFETCH_MS = 55_000

function categoryIcon(category) {
  return CATEGORIES.find((c) => c.id === category)?.icon || 'Gift'
}

export default function BenefitQrModal({ benefit, open, onClose }) {
  const { t } = useTranslation()
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(180)
  const [expiresIn, setExpiresIn] = useState(180)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const refreshRef = useRef(null)

  const loadQr = useCallback(async () => {
    if (!benefit?.slug) return
    setError(null)
    setLoading(true)
    try {
      const res = await api.benefitQr(benefit.slug)
      setExpiresIn(res.expiresInSeconds ?? 180)
      setSecondsLeft(res.expiresInSeconds ?? 180)
      const url = await QRCode.toDataURL(res.qrToken, {
        width: 220,
        margin: 1,
        color: { dark: '#181715', light: '#FFFFFF' },
      })
      setQrDataUrl(url)
    } catch (err) {
      setError(err.body?.error || err.message || 'request_failed')
      setQrDataUrl('')
    } finally {
      setLoading(false)
    }
  }, [benefit?.slug])

  useEffect(() => {
    if (!open || !benefit) return undefined
    loadQr()
    refreshRef.current = setInterval(loadQr, REFETCH_MS)
    return () => clearInterval(refreshRef.current)
  }, [open, benefit, loadQr])

  useEffect(() => {
    if (!open) return undefined
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          loadQr()
          return expiresIn
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [open, expiresIn, loadQr])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setQrDataUrl('')
      setError(null)
      setSecondsLeft(180)
    }
  }, [open])

  if (!benefit) return null

  const refreshPct = expiresIn ? secondsLeft / expiresIn : 0
  const color = catColor(benefit.category)

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label={t('common.close')}
            className="absolute inset-0 bg-bg/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={benefit.name}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-e3"
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg"
                  style={{
                    background: `color-mix(in srgb, ${color} 18%, transparent)`,
                    color,
                  }}
                >
                  <Icon name={categoryIcon(benefit.category)} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-text">{benefit.name}</p>
                  <p className="text-xs capitalize text-faint">{benefit.category}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full text-faint transition-colors hover:bg-bg-elevated-2 hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 px-5 py-6">
              {loading && !qrDataUrl ? (
                <div className="grid h-[248px] w-[248px] place-items-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-ember" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <AlertCircle className="h-9 w-9 text-danger" />
                  <p className="text-sm text-muted">{t('card.qrLoadError')}</p>
                  <Button variant="secondary" size="sm" onClick={loadQr} className="gap-2">
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t('card.tapRefresh')}
                  </Button>
                </div>
              ) : (
                <motion.div
                  key={qrDataUrl}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <MembershipCardQr qrDataUrl={qrDataUrl} alt={t('card.qrAlt')} />
                </motion.div>
              )}

              {!error && (
                <div className="flex items-center gap-3">
                  <Ring value={refreshPct} size={44} stroke={4} color="rgb(var(--ember))">
                    <span className="text-[0.65rem] font-bold tabular-nums text-ember">{secondsLeft}</span>
                  </Ring>
                  <p className="text-left text-xs leading-relaxed text-muted">{t('card.qrSingleUse')}</p>
                </div>
              )}

              <p className="flex items-center gap-1.5 text-[0.7rem] text-faint">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                {t('card.qrSecure')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
