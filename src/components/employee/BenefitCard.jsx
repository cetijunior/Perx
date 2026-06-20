import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, Check, Star, Play } from 'lucide-react'
import { CategoryChip } from '@/components/ui/Badge'
import { providerVideo } from '@/lib/catalog'
import { formatALL, cn } from '@/lib/utils'

/**
 * Benefit card — two sections:
 *  • top: a looping marketing video that plays on hover (muted, loop, ≤10s)
 *  • footer: title + price + add-to-cart button
 * The video lazy-loads on first hover; a category-gradient poster shows until
 * it's ready and stays as a graceful fallback if the clip can't load.
 */
export default function BenefitCard({ provider, inCart, onAdd, className }) {
  const { t } = useTranslation()
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const src = providerVideo(provider)

  const play = () => {
    const v = videoRef.current
    if (!v || failed) return
    v.play().catch(() => {}) // muted hover-play; ignore autoplay rejections
  }
  const stop = () => {
    const v = videoRef.current
    if (!v) return
    v.pause()
    try { v.currentTime = 0 } catch { /* noop */ }
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onMouseEnter={play}
      onMouseLeave={stop}
      className={cn('group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-bg-elevated shadow-e2', className)}
    >
      {/* ===== Top: marketing video ===== */}
      <div className="relative aspect-video w-full overflow-hidden bg-bg-elevated-2">
        {/* category-gradient poster / fallback */}
        <div
          className="absolute inset-0 grid place-items-center"
          style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--cat-${provider.category}) 32%, rgb(var(--bg-elevated-2))), rgb(var(--bg-elevated-2)))` }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-bg-elevated/70 text-text shadow-e1 backdrop-blur transition-opacity duration-300 group-hover:opacity-0">
            <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
          </span>
        </div>

        {src && !failed && (
          <video
            ref={videoRef}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
            onLoadedData={() => setReady(true)}
            onError={() => setFailed(true)}
            className={cn('relative h-full w-full object-cover transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0')}
          />
        )}

        {/* legibility scrim + chips over the video */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute left-3 top-3"><CategoryChip category={provider.category} className="bg-black/35 backdrop-blur" /></div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[0.7rem] font-medium text-white backdrop-blur">
          <Star className="h-3 w-3 fill-gold text-gold" />{provider.rating}
        </div>
      </div>

      {/* ===== Footer: title + price + add to cart ===== */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{provider.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{provider.blurb}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
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
      </div>
    </motion.div>
  )
}
