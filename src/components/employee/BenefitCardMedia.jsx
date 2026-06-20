import { useState } from 'react'
import { Star } from 'lucide-react'
import { CategoryChip } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const SIZE_CLASS = {
  full: 'aspect-video w-full',
  compact: 'aspect-[4/3] w-full',
  thumb: 'aspect-video w-16 shrink-0',
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
              <div className="absolute left-3 top-3"><CategoryChip category={category} className="bg-black/35 backdrop-blur" /></div>
              {rating != null && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[0.7rem] font-medium text-white backdrop-blur">
                  <Star className="h-3 w-3 fill-gold text-gold" />{rating}
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
