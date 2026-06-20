import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Check, Star } from 'lucide-react'
import { LogoChip } from '@/components/ui/Avatar'
import { CategoryChip } from '@/components/ui/Badge'
import { formatALL, cn, cadenceKey } from '@/lib/utils'

export default function OfferCard({ provider, inCart, onAdd, score, compact, className }) {
  const { t } = useTranslation()
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group flex h-full flex-col rounded-lg border border-line bg-bg-elevated p-4 shadow-e2', className)}
    >
      <div className="flex items-start gap-3">
        <LogoChip name={provider.name} size={42} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <CategoryChip category={provider.category} />
            <span className="flex items-center gap-1 text-xs text-faint"><Star className="h-3 w-3 fill-gold text-gold" />{provider.rating}</span>
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold">{provider.name}</h3>
        </div>
      </div>

      {!compact && <p className="mt-2 line-clamp-2 text-xs text-muted">{provider.blurb}</p>}

      {score != null && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated-2">
            <div className="h-full rounded-full bg-grad-gold" style={{ width: `${score}%` }} />
          </div>
          <span className="text-[0.65rem] font-semibold text-gold tnum">{score}%</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="font-display text-base font-bold tnum text-ember">
          {formatALL(provider.cost)} <span className="text-[0.65rem] font-medium text-faint">LEK{provider.cadence === 'month' ? t('common.perMonth') : ''}</span>
        </div>
        <button
          onClick={() => onAdd?.(provider.id)}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all active:scale-95',
            inCart
              ? 'bg-success/15 text-success'
              : 'bg-bg-elevated-2 text-text hover:bg-grad-ember hover:text-on-accent hover:shadow-glow',
          )}
        >
          {inCart ? <><Check className="h-3.5 w-3.5" /> {t('common.inCart')}</> : <><Plus className="h-3.5 w-3.5" /> {t('common.addToCart')}</>}
        </button>
      </div>
    </motion.div>
  )
}
