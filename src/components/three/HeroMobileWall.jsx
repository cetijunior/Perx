import { useMemo } from 'react'
import { PROVIDERS } from '@/lib/catalog'
import HeroBenefitCard from '@/components/employee/HeroBenefitCard'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { getHeroLayout } from './heroLayout'

function MarqueeRow({ providers, reverse = false, duration = 38 }) {
  const track = useMemo(() => [...providers, ...providers], [providers])

  return (
    <div className="hero-mobile-marquee-row overflow-hidden">
      <div
        className="hero-mobile-marquee-track flex w-max gap-3 px-3"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {track.map((provider, i) => (
          <div
            key={`${provider.id}-${i}`}
            className="hero-mobile-card-shell shrink-0"
          >
            <HeroBenefitCard provider={provider} variant="marquee" />
          </div>
        ))}
      </div>
    </div>
  )
}

function StaticCardGrid({ providers }) {
  return (
    <div className="hero-mobile-static-grid grid grid-cols-2 gap-3 px-4 pb-2">
      {providers.slice(0, 4).map((provider, i) => (
        <div
          key={provider.id}
          className="hero-mobile-card-shell hero-mobile-card-float"
          style={{ animationDelay: `${i * 0.35}s` }}
        >
          <HeroBenefitCard provider={provider} variant="marquee" />
        </div>
      ))}
    </div>
  )
}

export default function HeroMobileWall() {
  const isXs = useMediaQuery('(max-width: 479px)')
  const layout = useMemo(() => getHeroLayout(isXs ? 390 : 640), [isXs])

  const rowA = useMemo(() => PROVIDERS.slice(0, layout.marqueeRowSize), [layout.marqueeRowSize])
  const rowB = useMemo(
    () => PROVIDERS.slice(layout.marqueeRowSize, layout.marqueeRowSize * 2),
    [layout.marqueeRowSize],
  )

  return (
    <div className="hero-mobile-cards absolute inset-x-0 bottom-0" aria-hidden>
      <div className="hero-mobile-cards-glow pointer-events-none absolute inset-x-0 bottom-0 top-1/4" />
      <div className="hero-mobile-cards-mask relative flex h-full flex-col justify-end gap-3 pb-3 pt-8">
        <div className="hero-mobile-marquee hero-mobile-marquee-a">
          <MarqueeRow providers={rowA} duration={isXs ? 34 : 40} />
        </div>
        <div className="hero-mobile-marquee hero-mobile-marquee-b">
          <MarqueeRow providers={rowB.length ? rowB : rowA} reverse duration={isXs ? 42 : 48} />
        </div>
        <div className="hero-mobile-marquee-static">
          <StaticCardGrid providers={PROVIDERS} />
        </div>
      </div>
    </div>
  )
}
