import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PROVIDERS } from '@/lib/catalog'
import { providerDisplay } from '@/lib/providerI18n'
import BenefitCard from '@/components/employee/BenefitCard'

/** Static staggered positions — % + vw so the wall scales on small screens. */
const WALL_SLOTS = [
  { left: '-6%', top: '0%', width: 'min(40vw, 118px)', rotate: -2.8, offsetY: 0 },
  { left: '48%', top: '-2%', width: 'min(42vw, 124px)', rotate: 2.2, offsetY: 4 },
  { left: '0%', top: '32%', width: 'min(39vw, 116px)', rotate: 1.4, offsetY: 0 },
  { left: '50%', top: '30%', width: 'min(40vw, 120px)', rotate: -1.8, offsetY: 3 },
  { left: '-4%', top: '64%', width: 'min(41vw, 122px)', rotate: 2.4, offsetY: 0 },
  { left: '47%', top: '62%', width: 'min(42vw, 126px)', rotate: -2.1, offsetY: -3 },
]

export default function HeroMobileWall() {
  const { t, i18n } = useTranslation()

  const cards = useMemo(
    () => WALL_SLOTS.map((_, i) => {
      const provider = PROVIDERS[i % PROVIDERS.length]
      const { name, blurb } = providerDisplay(t, provider)
      return { ...provider, id: `${provider.id}-${i}`, name, blurb }
    }),
    [t, i18n.language],
  )

  return (
    <div className="hero-mobile-wall absolute inset-0 overflow-hidden" aria-hidden>
      {cards.map((provider, i) => {
        const slot = WALL_SLOTS[i]
        return (
          <div
            key={provider.id}
            className="absolute origin-center"
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.width,
              transform: `rotate(${slot.rotate}deg) translateY(${slot.offsetY}px)`,
            }}
          >
            <BenefitCard
              provider={provider}
              readonly
              showBlurb
              showPlayButton={false}
              variant="compact"
            />
          </div>
        )
      })}
    </div>
  )
}
