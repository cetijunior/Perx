import { useMemo } from 'react'
import { PROVIDERS } from '@/lib/catalog'
import HeroBenefitCard from '@/components/employee/HeroBenefitCard'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { getHeroLayout, MOBILE_WALL_SLOTS } from './heroLayout'

export default function HeroMobileWall() {
  const isXs = useMediaQuery('(max-width: 479px)')
  const layout = useMemo(() => getHeroLayout(isXs ? 390 : 640), [isXs])
  const providers = PROVIDERS.slice(0, layout.cardCount)

  return (
    <div className="hero-mobile-wall absolute inset-0" aria-hidden>
      {providers.map((provider, i) => {
        const slot = MOBILE_WALL_SLOTS[i % MOBILE_WALL_SLOTS.length]
        return (
          <div
            key={provider.id}
            className="absolute will-change-transform"
            style={{
              left: slot.left,
              top: slot.top,
              width: layout.cardWidth,
              transform: `rotate(${slot.rotate}deg) scale(${slot.scale})`,
              opacity: slot.opacity,
            }}
          >
            <HeroBenefitCard provider={provider} />
          </div>
        )
      })}
    </div>
  )
}
