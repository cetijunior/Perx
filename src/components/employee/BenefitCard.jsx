import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { categoryPoster } from '@/lib/videos'
import { useStore, getProviderBySlug } from '@/lib/store'
import { formatALL, cn } from '@/lib/utils'

function BenefitCardFooter({ provider, inCart, onAdd, readonly, t }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-2">
      <div className="font-display text-base font-bold tnum text-ember">
        {formatALL(provider.cost)} <span className="text-[0.65rem] font-medium text-faint">LEK{provider.cadence === 'month' ? t('common.perMonth') : ''}</span>
      </div>
      {!readonly && (
        <button
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
    </div>
  )
}

/**
 * Benefit card — poster header + footer (title, blurb, price, optional CTA).
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
}) {
  const { t } = useTranslation()
  const nav = useNavigate()
  useStore()
  const compact = variant === 'compact'
  const mediaSize = compact ? 'compact' : 'full'
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
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-bg-elevated shadow-e2',
        linkable && 'cursor-pointer',
        className,
      )}
    >
      <BenefitCardMedia
        category={provider.category}
        rating={provider.rating}
        poster={poster}
        size={mediaSize}
      />

      <div className={cn('flex flex-1 flex-col gap-3', compact ? 'p-3' : 'p-4')}>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{provider.name}</h3>
          {showBlurb && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{provider.blurb}</p>}
        </div>

        {score != null && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated-2">
              <div className="h-full rounded-full bg-grad-gold" style={{ width: `${score}%` }} />
            </div>
            <span className="text-[0.65rem] font-semibold text-gold tnum">{score}%</span>
          </div>
        )}

        {footer ?? <BenefitCardFooter provider={provider} inCart={inCart} onAdd={onAdd} readonly={readonly} t={t} />}
      </div>
    </motion.div>
  )
}
