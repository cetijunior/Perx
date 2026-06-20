import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ScanLine, CheckCircle2, AlertTriangle, RotateCcw, Loader2, Check, ClipboardPaste,
} from 'lucide-react'
import { api } from '@/lib/api'
import { fadeUp, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/Misc'
import Button from '@/components/ui/Button'

const SCANNER_ID = 'perx-qr-scanner'

function cardErrorMessage(code, t) {
  switch (code) {
    case 'invalid_or_expired_token':
      return t('validate.errors.expired')
    case 'token_already_used':
      return t('validate.errors.used')
    case 'employee_not_found':
      return t('validate.errors.notFound')
    case 'benefit_not_active_for_employee':
      return t('validate.errors.benefitInactive')
    default:
      return t('validate.errors.generic')
  }
}

export default function Validate() {
  const { t } = useTranslation()
  const [phase, setPhase] = useState('idle')
  const [scannedToken, setScannedToken] = useState(null)
  const [lookup, setLookup] = useState(null)
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [error, setError] = useState(null)
  const [successLabel, setSuccessLabel] = useState('')
  const [manualToken, setManualToken] = useState('')
  const [showManual, setShowManual] = useState(false)
  const scannerRef = useRef(null)

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    try {
      if (scanner.isScanning) await scanner.stop()
      scanner.clear()
    } catch {
      /* ignore teardown errors */
    }
    scannerRef.current = null
  }, [])

  useEffect(() => () => { stopScanner() }, [stopScanner])

  const reset = useCallback(async () => {
    await stopScanner()
    setPhase('idle')
    setScannedToken(null)
    setLookup(null)
    setSelectedSlug(null)
    setError(null)
    setSuccessLabel('')
    setManualToken('')
    setShowManual(false)
  }, [stopScanner])

  const handleLookup = useCallback(async (token) => {
    setPhase('lookingUp')
    setError(null)
    setScannedToken(token)
    try {
      const res = await api.cardLookup(token)
      setLookup(res)
      const slug = res.lockedBenefit || res.benefits[0]?.slug || null
      setSelectedSlug(slug)
      setPhase('ready')
    } catch (err) {
      setError(cardErrorMessage(err.body?.error || err.message, t))
      setPhase('error')
    }
  }, [t])

  const startScanner = useCallback(async () => {
    setError(null)
    setPhase('scanning')
    await stopScanner()
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decoded) => {
          await stopScanner()
          await handleLookup(decoded)
        },
        () => {},
      )
    } catch {
      setError(t('validate.errors.camera'))
      setPhase('error')
      await stopScanner()
    }
  }, [handleLookup, stopScanner, t])

  const handleManualLookup = () => {
    const token = manualToken.trim()
    if (!token) return
    handleLookup(token)
  }

  const redeem = async () => {
    if (!scannedToken || !lookup) return
    const slug = lookup.lockedBenefit || selectedSlug
    if (!slug) return
    setPhase('redeeming')
    setError(null)
    try {
      await api.cardRedeem(scannedToken, slug)
      const benefit = lookup.benefits.find((b) => b.slug === slug)
      setSuccessLabel(
        t('validate.successDetail', {
          benefit: benefit?.name || slug,
          name: lookup.employee.name,
        }),
      )
      setPhase('success')
      setTimeout(reset, 2500)
    } catch (err) {
      setError(cardErrorMessage(err.body?.error || err.message, t))
      setPhase('error')
    }
  }

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('validate.title')} subtitle={t('validate.subtitle')} />

      <motion.div variants={fadeUp} className="mx-auto max-w-lg">
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-bg-elevated p-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-ember/15 text-ember">
              <ScanLine className="h-8 w-8" />
            </span>
            <p className="text-sm text-muted">{t('validate.idleHint')}</p>
            <Button onClick={startScanner} className="gap-2">
              <ScanLine className="h-4 w-4" />
              {t('validate.startScan')}
            </Button>
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-muted"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              {t('validate.manualEntry')}
            </button>
            {showManual && (
              <div className="flex w-full flex-col gap-2 pt-2">
                <textarea
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder={t('validate.manualPlaceholder')}
                  rows={3}
                  className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-xs text-text placeholder:text-faint"
                />
                <Button variant="secondary" onClick={handleManualLookup} disabled={!manualToken.trim()}>
                  {t('validate.lookupToken')}
                </Button>
              </div>
            )}
          </div>
        )}

        {phase === 'scanning' && (
          <div className="overflow-hidden rounded-xl border border-line bg-bg-elevated">
            <div id={SCANNER_ID} className="w-full" />
            <p className="border-t border-line px-4 py-3 text-center text-sm text-muted">
              {t('validate.scanningHint')}
            </p>
            <div className="flex justify-center border-t border-line px-4 py-3">
              <Button variant="secondary" onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {t('validate.cancel')}
              </Button>
            </div>
          </div>
        )}

        {(phase === 'lookingUp' || phase === 'redeeming') && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-bg-elevated py-16">
            <Loader2 className="h-8 w-8 animate-spin text-ember" />
            <p className="text-sm text-muted">
              {phase === 'lookingUp' ? t('validate.lookingUp') : t('validate.redeeming')}
            </p>
          </div>
        )}

        {phase === 'ready' && lookup && (
          <div className="space-y-4 rounded-xl border border-line bg-bg-elevated p-5">
            <div>
              <p className="font-display text-xl font-bold text-text">{lookup.employee.name}</p>
              <p className="mt-1 text-sm text-muted">
                {[lookup.employee.department, `#${lookup.employee.employeeId}`].filter(Boolean).join(' · ')}
              </p>
            </div>

            {lookup.benefits.length === 0 ? (
              <p className="rounded-lg border border-line bg-bg-elevated-2 px-4 py-3 text-sm text-muted">
                {t('validate.noBenefits')}
              </p>
            ) : lookup.lockedBenefit ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-faint">
                  {t('validate.scannedBenefit')}
                </p>
                <BenefitConfirmCard benefit={lookup.benefits[0]} locked />
                <Button onClick={redeem} className="w-full">
                  {t('validate.confirm')}
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-faint">
                  {t('validate.selectBenefit')}
                </p>
                <div className="space-y-2">
                  {lookup.benefits.map((b) => (
                    <button
                      key={b.slug}
                      type="button"
                      onClick={() => setSelectedSlug(b.slug)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors',
                        selectedSlug === b.slug
                          ? 'border-ember bg-ember/10'
                          : 'border-line bg-bg-elevated-2 hover:border-ember/30',
                      )}
                    >
                      <div>
                        <p className="text-sm font-semibold text-text">{b.name}</p>
                        <p className="text-xs capitalize text-faint">{b.category}</p>
                      </div>
                      {selectedSlug === b.slug && <Check className="h-5 w-5 text-ember" />}
                    </button>
                  ))}
                </div>
                <Button onClick={redeem} disabled={!selectedSlug} className="w-full">
                  {t('validate.confirm')}
                </Button>
              </>
            )}

            <Button variant="secondary" onClick={reset} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('validate.scanAgain')}
            </Button>
          </div>
        )}

        {phase === 'success' && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <p className="font-semibold text-text">{t('validate.successTitle')}</p>
            <p className="text-sm text-muted">{successLabel}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-danger" />
            <p className="text-sm text-muted">{error}</p>
            <Button onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('validate.scanAgain')}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function BenefitConfirmCard({ benefit, locked }) {
  if (!benefit) return null
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        locked ? 'border-ember/40 bg-ember/8' : 'border-line bg-bg-elevated-2',
      )}
    >
      <p className="text-sm font-semibold text-text">{benefit.name}</p>
      <p className="mt-1 text-xs capitalize text-faint">{benefit.category}</p>
    </div>
  )
}
