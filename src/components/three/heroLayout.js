import { PROVIDERS } from '@/lib/catalog'

const MOBILE_BREAKPOINT = 768

/** Layout config for hero background — mobile wall vs desktop orbit. */
export function getHeroLayout(width) {
  const isMobile = width < MOBILE_BREAKPOINT

  if (isMobile) {
    return {
      tier: width < 480 ? 'mobile-xs' : 'mobile-sm',
      isMobile: true,
      cardCount: width < 480 ? 6 : 8,
      cardWidth: width < 480 ? 'clamp(6.5rem, 31vw, 7.75rem)' : 'clamp(7rem, 28vw, 8.5rem)',
    }
  }

  if (width < 1024) {
    return {
      tier: 'md',
      isMobile: false,
      cardWidth: 160,
      distanceFactor: 9.4,
      orbitRadius: 2.75,
      cardCount: 8,
      cameraZ: 9.4,
      cameraY: 0.45,
      fov: 50,
      particles: 120,
      dprMax: 1.75,
      antialias: true,
      compact: false,
      ySpread: 0.58,
    }
  }

  return {
    tier: 'lg',
    isMobile: false,
    cardWidth: 172,
    distanceFactor: 10,
    orbitRadius: 3,
    cardCount: PROVIDERS.length,
    cameraZ: 9.2,
    cameraY: 0.5,
    fov: 50,
    particles: 160,
    dprMax: 2,
    antialias: true,
    compact: false,
    ySpread: 0.62,
  }
}

/** Fixed positions for the static mobile card wall (percent-based). */
export const MOBILE_WALL_SLOTS = [
  { left: '-10%', top: '2%', rotate: -7, scale: 0.94, opacity: 0.88 },
  { left: '26%', top: '-2%', rotate: 4, scale: 0.9, opacity: 0.92 },
  { left: '62%', top: '4%', rotate: -3, scale: 0.88, opacity: 0.85 },
  { left: '-14%', top: '28%', rotate: 5, scale: 0.86, opacity: 0.9 },
  { left: '22%', top: '24%', rotate: -4, scale: 0.92, opacity: 0.95 },
  { left: '58%', top: '30%', rotate: 6, scale: 0.84, opacity: 0.87 },
  { left: '6%', top: '52%', rotate: -5, scale: 0.82, opacity: 0.83 },
  { left: '48%', top: '48%', rotate: 3, scale: 0.8, opacity: 0.8 },
]
