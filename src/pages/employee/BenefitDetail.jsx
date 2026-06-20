import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Check, Plus, QrCode, Sparkles, Wallet, Gamepad2, CreditCard,
  SlidersHorizontal, MapPin, Tag, Package, Flame, Star, ShoppingBag,
} from 'lucide-react'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import BenefitQrModal from '@/components/employee/BenefitQrModal'
import TiranaMap from '@/components/admin/TiranaMap'
import BenefitCard from '@/components/employee/BenefitCard'
import { CategoryChip, StatusChip } from '@/components/ui/Badge'
import { Countdown } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { SectionTitle } from '@/components/ui/Misc'
import {
  packagesForProvider, dealsForProvider, pendingRequestForProvider,
  providerDescription, cadenceLabel, relatedProviders, codesForProvider,
} from '@/lib/benefitDetail'
import { providerDisplay } from '@/lib/providerI18n'
import { categoryPoster } from '@/lib/videos'
import {
  useCurrentUser, useStore, getState, getProviderBySlug,
  addToCart, budgetFor,
} from '@/lib/store'
import { scoreProvider } from '@/lib/recommend'
import { providerById } from '@/lib/catalog'
import { formatALL, cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'

const QUICK_LINKS = [
  { to: '/employee/perky', icon: Sparkles, labelKey: 'detail.askPerky', tint: 'text-gold' },
  { to: '/employee/budget', icon: Wallet, labelKey: 'detail.budget', tint: 'text-ember' },
  { to: '/employee/games', icon: Gamepad2, labelKey: 'detail.games', tint: 'text-cat-travel' },
  { to: '/employee/card', icon: CreditCard, labelKey: 'detail.redeem', tint: 'text-success' },
  { to: '/employee/preferences', icon: SlidersHorizontal, labelKey: 'detail.preferences', tint: 'text-muted' },
]

export default function BenefitDetail() {
  const { slug } = useParams()
  const { t } = useTranslation()
  const nav = useNavigate()
  const user = useCurrentUser()
  useStore()
  const s = getState()
  const emp = s.employees[user.id]
  const [qrOpen, setQrOpen] = useState(false)

  const catalog = providerById(slug)
  const api = getProviderBySlug(slug)
  const provider = useMemo(() => {
    if (!catalog && !api) return null
    const merged = { ...catalog, ...api, id: slug, tags: catalog?.tags || [] }
    const { name, blurb } = providerDisplay(t, merged)
    return { ...merged, name, blurb }
  }, [catalog, api, slug, t])

  const b = budgetFor(user.id)
  const score = useMemo(() => {
    if (!provider) return null
    return scoreProvider(provider, { prefs: emp.preferences, remaining: b.remaining })
  }, [provider, emp.preferences, b.remaining])

  const isActive = emp.activeBenefits.includes(slug)
  const inCart = emp.cart.includes(slug)
  const pending = pendingRequestForProvider(slug, s.requests)
  const packages = packagesForProvider(slug)
  const deals = dealsForProvider(slug)
  const codes = codesForProvider(slug, emp.discountCodes)
  const related = relatedProviders(slug, user.id)
  const description = provider ? providerDescription(t, provider) : ''
  const poster = api?.posterUrl || catalog?.posterUrl || categoryPoster(provider?.category)
  const fitsBudget = provider ? provider.cost <= b.remaining : true
  const deal = deals[0]
  const dealExpires = deal ? s.seededAt + deal.expiresInH * 3600000 : null

  if (!provider) return <Navigate to="/employee/benefits" replace />

  const perkyPrompt = t('detail.perkyPrompt', { name: provider.name })

  function openPerky() {
    nav('/employee/perky', { state: { prompt: perkyPrompt } })
  }

  return (
    <>
      <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="pb-28 md:pb-8">
        <motion.div variants={fadeUp} className="mb-4">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('detail.back')}
          </button>
        </motion.div>

        <motion.div variants={fadeUp} className="overflow-hidden rounded-xl border border-line bg-bg-elevated shadow-e2">
          <BenefitCardMedia
            category={provider.category}
            rating={provider.rating}
            poster={poster}
            size="full"
            className="aspect-[21/9] max-h-72 md:aspect-[2.4/1]"
            overlay={
              deal && dealExpires ? (
                <div className="absolute right-3 top-3">
                  <Countdown expiresAt={dealExpires} />
                </div>
              ) : null
            }
          />
          <div className="space-y-4 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <CategoryChip category={provider.category} />
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[0.7rem] font-semibold text-success">
                      <Check className="h-3 w-3" /> {t('detail.statusActive')}
                    </span>
                  )}
                  {pending && !isActive && <StatusChip status="pending" t={t} />}
                  {inCart && !isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ember/15 px-2.5 py-1 text-[0.7rem] font-semibold text-ember">
                      <ShoppingBag className="h-3 w-3" /> {t('common.inCart')}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{provider.name}</h1>
                <p className="mt-1 text-sm text-muted">{provider.blurb}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold tabular-nums text-ember">
                  {formatALL(provider.cost)} <span className="text-sm font-medium text-faint">LEK</span>
                </p>
                <p className="mt-0.5 text-xs capitalize text-faint">{cadenceLabel(t, provider.cadence)}</p>
                {provider.rating != null && (
                  <p className="mt-1 flex items-center justify-end gap-1 text-xs text-muted">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {provider.rating}
                  </p>
                )}
              </div>
            </div>

            {deal && (
              <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3">
                <p className="text-sm font-semibold text-gold">{deal.title}</p>
                <p className="mt-0.5 text-xs text-muted">{deal.blurb}</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1">
              <h2 className="mb-3 text-base font-semibold">{t('detail.about')}</h2>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
              {provider.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {provider.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-bg-elevated-2 px-2.5 py-1 text-[0.7rem] font-medium capitalize text-faint">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.section>

            {provider.map && (
              <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <MapPin className="h-4 w-4 text-ember" />
                  {t('detail.location')}
                </h2>
                <p className="mb-3 text-xs text-muted">{t('detail.locationHint')}</p>
                <TiranaMap
                  pins={[{ id: provider.id, map: provider.map, category: provider.category, name: provider.name }]}
                  selectedId={provider.id}
                />
              </motion.section>
            )}

            {packages.length > 0 && (
              <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <Package className="h-4 w-4 text-ember" />
                  {t('detail.inPackages')}
                </h2>
                <ul className="space-y-2">
                  {packages.map((pkg) => (
                    <li key={pkg.id} className="rounded-lg border border-line bg-bg-elevated-2 px-3 py-2.5">
                      <p className="text-sm font-medium">{pkg.name}</p>
                      <p className="text-xs text-muted">{pkg.blurb}</p>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {codes.length > 0 && (
              <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1">
                <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                  <Tag className="h-4 w-4 text-ember" />
                  {t('detail.yourCodes')}
                </h2>
                <ul className="space-y-2">
                  {codes.map((code) => (
                    <li key={code.id} className="flex items-center justify-between rounded-lg border border-line bg-bg-elevated-2 px-3 py-2.5">
                      <div>
                        <p className="font-mono text-sm font-semibold">{code.code}</p>
                        <p className="text-xs text-muted">{code.label}</p>
                      </div>
                      <Button as={Link} to="/employee/card" variant="secondary" size="sm">{t('detail.viewCode')}</Button>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {related.length > 0 && (
              <motion.section variants={fadeUp}>
                <SectionTitle>{t('detail.similar')}</SectionTitle>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((p) => (
                    <BenefitCard
                      key={p.id}
                      provider={p}
                      score={p.score}
                      showBlurb={false}
                      inCart={emp.cart.includes(p.id)}
                      onAdd={(id) => addToCart(user.id, id)}
                    />
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          <aside className="space-y-4">
            <motion.div variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5 shadow-e1 lg:sticky lg:top-24">
              <h2 className="mb-3 text-base font-semibold">{t('detail.forYou')}</h2>

              {score != null && (
                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-faint">{t('common.matchScore')}</span>
                    <span className="font-semibold tabular-nums text-gold">{score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-elevated-2">
                    <div className="h-full rounded-full bg-grad-gold" style={{ width: `${score}%` }} />
                  </div>
                </div>
              )}

              <div className="mb-4 rounded-lg bg-bg-elevated-2 p-3">
                <p className="text-[0.7rem] uppercase tracking-wide text-faint">{t('common.budget')}</p>
                <p className="font-display text-xl font-bold tabular-nums">{formatALL(b.remaining)} <span className="text-xs text-faint">LEK</span></p>
                <p className={cn('mt-1 text-xs font-medium', fitsBudget ? 'text-success' : 'text-danger')}>
                  {fitsBudget ? t('detail.fitsBudget') : t('detail.overBudget')}
                </p>
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-muted">
                <Flame className="h-4 w-4 text-gold" />
                {emp.games.streak} {t('budget.streak')}
              </div>

              <div className="hidden flex-col gap-2 lg:flex">
                <DetailCta
                  isActive={isActive}
                  inCart={inCart}
                  onAdd={() => addToCart(user.id, slug)}
                  onQr={() => setQrOpen(true)}
                  t={t}
                />
                <Button variant="secondary" size="md" className="w-full gap-2" onClick={openPerky}>
                  <Sparkles className="h-4 w-4" /> {t('detail.askPerky')}
                </Button>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-4 shadow-e1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-faint">{t('detail.explore')}</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map(({ to, icon: Icon, labelKey, tint }) => (
                  <Link
                    key={to}
                    to={to === '/employee/perky' ? to : to}
                    state={to === '/employee/perky' ? { prompt: perkyPrompt } : undefined}
                    className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-bg-elevated-2 px-2 py-3 text-center transition-colors hover:border-ember/30 hover:bg-bg-elevated"
                  >
                    <Icon className={cn('h-5 w-5', tint)} />
                    <span className="text-[0.65rem] font-medium leading-tight text-muted">{t(labelKey)}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg-elevated/95 p-4 backdrop-blur safe-b lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Button variant="secondary" size="md" className="shrink-0 gap-2" onClick={openPerky}>
            <Sparkles className="h-4 w-4" />
          </Button>
          <DetailCta
            isActive={isActive}
            inCart={inCart}
            onAdd={() => addToCart(user.id, slug)}
            onQr={() => setQrOpen(true)}
            t={t}
            className="flex-1"
          />
        </div>
      </div>

      <BenefitQrModal
        benefit={{ slug, name: provider.name, category: provider.category }}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  )
}

function DetailCta({ isActive, inCart, onAdd, onQr, t, className }) {
  if (isActive) {
    return (
      <Button size="lg" className={cn('w-full gap-2', className)} onClick={onQr}>
        <QrCode className="h-4 w-4" /> {t('detail.showQr')}
      </Button>
    )
  }
  if (inCart) {
    return (
      <Button size="lg" variant="secondary" className={cn('w-full gap-2', className)} disabled>
        <Check className="h-4 w-4" /> {t('common.inCart')}
      </Button>
    )
  }
  return (
    <Button size="lg" className={cn('w-full gap-2', className)} onClick={onAdd}>
      <Plus className="h-4 w-4" /> {t('common.addToCart')}
    </Button>
  )
}
