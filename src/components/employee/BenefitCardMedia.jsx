import { useState } from 'react'
import { Star } from 'lucide-react'
import { CategoryChip } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const SIZE_CLASS = {
  full: 'aspect-video w-full',
  panel: 'aspect-[16/10] w-full min-h-[140px]',
  compact: 'aspect-[4/3] w-full',
  hero: 'aspect-[4/3] w-full',
  thumb: 'aspect-video w-16 shrink-0',
}

const CHIP_POS = {
  hero: { wrap: 'left-2 top-2', rating: 'right-2 top-2 text-[0.6rem] px-1.5 py-0.5' },
  default: { wrap: 'left-3 top-3', rating: 'right-3 top-3 text-[0.7rem] px-2 py-1' },
}

/** Shared poster header for benefit cards. */
export default function BenefitCardMedia({
  category,
  rating,
  poster,
  size = 'full',
  overlay,
  showChips = true,
  className,
}) {
  const [posterFailed, setPosterFailed] = useState(false)
  const chips = CHIP_POS[size === 'hero' ? 'hero' : 'default']

  return (
    <div
      className={cn('relative overflow-hidden bg-bg-elevated-2', SIZE_CLASS[size], className)}
    >
      <div
        className="absolute inset-0 grid place-items-center"
        style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--cat-${category}) 32%, rgb(var(--bg-elevated-2))), rgb(var(--bg-elevated-2)))` }}
      />

      {poster && !posterFailed && (
        <img
          src={poster}
          alt=""
          loading="lazy"
          onError={() => setPosterFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {size !== 'thumb' && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
          {showChips && (
            <>
              <div className={cn('absolute', chips.wrap)}>
                <CategoryChip category={category} className="bg-black/35 backdrop-blur" />
              </div>
              {rating != null && (
                <div className={cn('absolute flex items-center gap-0.5 rounded-full bg-black/35 font-medium text-white backdrop-blur', chips.rating)}>
                  <Star className={cn('fill-gold text-gold', size === 'hero' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
                  {rating}
                </div>
              )}
            </>
          )}
        </>
      )}

      {overlay}
    </div>
  )
}
