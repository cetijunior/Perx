import { useRef, useState } from 'react'
import { Star, Play } from 'lucide-react'
import { CategoryChip } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const SIZE_CLASS = {
  full: 'aspect-video w-full',
  compact: 'aspect-[4/3] w-full',
  thumb: 'aspect-video w-16 shrink-0',
}

/**
 * Shared video header for benefit cards.
 * Tries each URL in `sources` in order; category-gradient poster stays as fallback.
 */
export default function BenefitCardMedia({
  category,
  rating,
  sources = [],
  poster,
  size = 'full',
  overlay,
  playOnHover = true,
  showPlayButton = true,
  showChips = true,
  className,
}) {
  const videoRef = useRef(null)
  const [srcIndex, setSrcIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const src = sources[srcIndex] ?? null
  const failed = srcIndex >= sources.length

  const play = () => {
    if (!playOnHover) return
    const v = videoRef.current
    if (!v || failed) return
    v.play().catch(() => {})
  }
  const stop = () => {
    if (!playOnHover) return
    const v = videoRef.current
    if (!v) return
    v.pause()
    try { v.currentTime = 0 } catch { /* noop */ }
  }

  const onError = () => {
    setReady(false)
    setSrcIndex((i) => i + 1)
  }

  return (
    <div
      onMouseEnter={play}
      onMouseLeave={stop}
      className={cn('group/media relative overflow-hidden bg-bg-elevated-2', SIZE_CLASS[size], className)}
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
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            ready ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}

      {size !== 'thumb' && showPlayButton && (
        <span className="absolute left-1/2 top-1/2 z-[1] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bg-elevated/70 text-text shadow-e1 backdrop-blur transition-opacity duration-300 group-hover/media:opacity-0">
          <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
        </span>
      )}

      {src && !failed && (
        <video
          key={src}
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          onLoadedData={() => setReady(true)}
          onError={onError}
          className={cn('relative h-full w-full object-cover transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0')}
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
