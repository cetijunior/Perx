import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Check, QrCode, ArrowUpRight, Star } from 'lucide-react'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { CategoryChip } from '@/components/ui/Badge'
import { categoryPoster } from '@/lib/videos'
import { cadenceLabel } from '@/lib/benefitDetail'
import { useStore, getProviderBySlug } from '@/lib/store'
import { formatALL, cn } from '@/lib/utils'

function BenefitCardFooter({ provider, inCart, onAdd, readonly, isActive, onRedeem, t }) {
  if (isActive) {
    return (
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="font-display text-base font-bold tabular-nums text-ember">
          {formatALL(provider.cost)} <span className="text-[0.65rem] font-medium text-faint">LEK</span>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRedeem?.() }}
          className="flex h-9 items-center gap-1.5 rounded-md bg-success/15 px-3 text-xs font-semibold text-success transition-all hover:bg-success/25 active:scale-95"
        >
          <QrCode className="h-3.5 w-3.5" /> {t('dash.redeem')}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-auto flex items-center justify-between gap-2">
      <div className="font-display text-base font-bold tabular-nums text-ember">
        {formatALL(provider.cost)}
        <span className="text-[0.65rem] font-medium text-faint">
          LEK{provider.cadence === 'month' ? t('common.perMonth') : ''}
        </span>
      </div>
      {!readonly && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAdd?.(provider.id) }}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all active:scale-95',
            inCart
              ? 'bg-success/15 text-success'
              : 'bg-bg-elevated-2 text-text hover:bg-grad-ember hover:text-on-accent hover:shadow-glow',
          )}
        >
          {inCart ? <><Check className="h-3.5 w-3.5" /> {t('common.inCart')}</> : <><Plus className="h-3.5 w-3.5" /> {t('common.addToCart')}</>}
        </button>
      )}
      {readonly && (
        <span className="flex items-center gap-1 text-xs font-medium text-faint">
          {t('dash.viewDetail')} <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  )
}

/**
 * Benefit card — poster header + rich footer for marketplace & panel.
 */
export default function BenefitCard({
  provider,
  inCart,
  onAdd,
  className,
  variant = 'default',
  showBlurb = true,
  score,
  footer,
  readonly = false,
  linkable = true,
  isActive = false,
  onRedeem,
}) {
  const { t } = useTranslation()
  const nav = useNavigate()
  useStore()
  const isPanel = variant === 'panel'
  const compact = variant === 'compact'
  const mediaSize = isPanel ? 'panel' : compact ? 'compact' : 'full'
  const apiProvider = getProviderBySlug(provider.id) || {}
  const poster = apiProvider.posterUrl || provider.posterUrl || categoryPoster(provider.category)

  function handleCardClick() {
    if (linkable) nav(`/employee/benefits/${provider.id}`)
  }

  return (
    <motion.div
      role={linkable ? 'link' : undefined}
      tabIndex={linkable ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (linkable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleCardClick() } }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg-elevated shadow-e2 transition-shadow hover:shadow-e3',
        linkable && 'cursor-pointer',
        isPanel && 'min-h-[320px]',
        className,
      )}
    >
      <BenefitCardMedia
        category={provider.category}
        rating={provider.rating}
        poster={poster}
        size={mediaSize}
        overlay={
          isActive ? (
            <div className="absolute left-3 bottom-3 z-[2]">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">
                <Check className="h-3 w-3" /> {t('detail.statusActive')}
              </span>
            </div>
          ) : null
        }
      />

      <div className={cn('flex flex-1 flex-col gap-3', isPanel ? 'p-4' : compact ? 'p-3' : 'p-4')}>
        <div className="min-w-0 space-y-2">
          {isPanel && (
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip category={provider.category} withIcon={false} className="text-[0.65rem]" />
              <span className="text-[0.65rem] capitalize text-faint">{cadenceLabel(t, provider.cadence)}</span>
              {provider.rating != null && (
                <span className="ml-auto flex items-center gap-1 text-[0.65rem] font-medium text-muted">
                  <Star className="h-3 w-3 fill-gold text-gold" /> {provider.rating}
                </span>
              )}
            </div>
          )}
          <h3 className={cn('font-semibold text-text', isPanel ? 'text-base leading-snug' : 'truncate text-sm')}>
            {provider.name}
          </h3>
          {showBlurb && provider.blurb && (
            <p className={cn('text-muted', isPanel ? 'line-clamp-2 text-sm leading-relaxed' : 'line-clamp-1 text-xs')}>
              {provider.blurb}
            </p>
          )}
        </div>

        {score != null && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated-2">
              <div className="h-full rounded-full bg-grad-gold" style={{ width: `${score}%` }} />
            </div>
            <span className="text-[0.65rem] font-semibold tabular-nums text-gold">{score}% {t('common.matchScore').toLowerCase()}</span>
          </div>
        )}

        {footer ?? (
          <BenefitCardFooter
            provider={provider}
            inCart={inCart}
            onAdd={onAdd}
            readonly={readonly}
            isActive={isActive}
            onRedeem={onRedeem}
            t={t}
          />
        )}
      </div>
    </motion.div>
  )
}
