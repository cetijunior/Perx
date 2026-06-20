import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Html, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'
import { PROVIDERS } from '@/lib/catalog'
import { providerDisplay } from '@/lib/providerI18n'
import BenefitCard from '@/components/employee/BenefitCard'
import { useTheme } from '@/lib/theme'

const FALLBACK_PALETTE = {
  light: {
    fog: '#f6f7f9',
    ember: '#cc785c',
    ambientIntensity: 0.72,
    particleOpacity: 0.28,
  },
  dark: {
    fog: '#111318',
    ember: '#cc785c',
    ambientIntensity: 0.58,
    particleOpacity: 0.42,
  },
}

function getHeroLayout(width) {
  if (width < 1024) {
    return {
      tier: 'md',
      cardWidth: 132,
      distanceFactor: 11.5,
      orbitRadius: 2.55,
      cardCount: 8,
      cameraZ: 9.6,
      cameraY: 0.45,
      fov: 50,
      particles: 120,
      dprMax: 1.75,
      antialias: true,
      compact: true,
      ySpread: 0.52,
    }
  }
  return {
    tier: 'lg',
    cardWidth: 142,
    distanceFactor: 12.2,
    orbitRadius: 2.85,
    cardCount: PROVIDERS.length,
    cameraZ: 9.4,
    cameraY: 0.5,
    fov: 50,
    particles: 160,
    dprMax: 2,
    antialias: true,
    compact: true,
    ySpread: 0.56,
  }
}

function useHeroLayout() {
  const [layout, setLayout] = useState(() => getHeroLayout(
    typeof window !== 'undefined' ? window.innerWidth : 1280,
  ))

  useEffect(() => {
    const update = () => setLayout(getHeroLayout(window.innerWidth))
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return layout
}

function cssChannels(name) {
  if (typeof window === 'undefined') return null
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return null
  const parts = raw.split(/\s+/).map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return null
  return parts
}

function channelsToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

function cssVarHex(name, fallback) {
  const ch = cssChannels(name)
  return ch ? channelsToHex(ch) : fallback
}

function buildHeroPalette(isDark) {
  const base = isDark ? FALLBACK_PALETTE.dark : FALLBACK_PALETTE.light
  return {
    ...base,
    fog: cssVarHex('--bg', base.fog),
    ember: cssVarHex('--ember', base.ember),
  }
}

function ProviderOrbitCard({
  provider,
  radius,
  angle,
  y,
  speed,
  distanceFactor,
  cardWidth,
  compact,
  ySpread,
}) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + angle
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius
      ref.current.position.z = Math.sin(t) * radius
      ref.current.position.y = y + Math.sin(t * 1.3) * (ySpread * 0.28)
    }
  })

  return (
    <group ref={ref}>
      <Billboard>
        <Html
          transform
          center
          distanceFactor={distanceFactor}
          zIndexRange={[-1, -1]}
          style={{
            width: `${cardWidth}px`,
            pointerEvents: 'none',
          }}
        >
          <BenefitCard
            provider={provider}
            readonly
            showBlurb
            linkable={false}
            variant={compact ? 'compact' : 'default'}
          />
        </Html>
      </Billboard>
    </group>
  )
}

function Particles({ count, palette }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 6
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th)
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th)
    }
    return arr
  }, [count])
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.015 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={palette.ember}
        transparent
        opacity={palette.particleOpacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

function Cluster({ layout, cards, palette }) {
  const group = useRef()
  const visibleCards = cards.slice(0, layout.cardCount)
  useFrame((state, delta) => { if (group.current) group.current.rotation.y += delta * 0.05 })
  return (
    <group ref={group}>
      {visibleCards.map((c, i) => (
        <ProviderOrbitCard
          key={c.id}
          provider={c}
          radius={layout.orbitRadius}
          angle={(i / visibleCards.length) * Math.PI * 2}
          y={(i % 3 - 1) * layout.ySpread}
          speed={0.1}
          distanceFactor={layout.distanceFactor}
          cardWidth={layout.cardWidth}
          compact={layout.compact}
          ySpread={layout.ySpread}
        />
      ))}
    </group>
  )
}

function HeroScene({ layout, cards, palette }) {
  return (
    <>
      <fog attach="fog" args={[palette.fog, 8, 18]} />
      <ambientLight intensity={palette.ambientIntensity} />
      <pointLight position={[4, 3, 5]} intensity={70} color={palette.ember} distance={28} decay={1.8} />
      <Cluster layout={layout} cards={cards} palette={palette} />
      <Particles count={layout.particles} palette={palette} />
      <AdaptiveDpr pixelated />
    </>
  )
}

export default function Hero3D({ active = true }) {
  const { t, i18n } = useTranslation()
  const { isDark } = useTheme()
  const layout = useHeroLayout()
  const palette = useMemo(() => buildHeroPalette(isDark), [isDark])

  const cards = useMemo(
    () => PROVIDERS.map((provider) => {
      const { name, blurb } = providerDisplay(t, provider)
      return { ...provider, name, blurb }
    }),
    [t, i18n.language],
  )

  return (
    <Canvas
      key={`${isDark ? 'dark' : 'light'}-${i18n.language}-${layout.tier}`}
      className="hero-canvas h-full w-full touch-none"
      dpr={[1, layout.dprMax]}
      camera={{ position: [0, layout.cameraY, layout.cameraZ], fov: layout.fov }}
      gl={{ antialias: layout.antialias, powerPreference: 'high-performance', alpha: true }}
      frameloop={active ? 'always' : 'never'}
    >
      <Suspense fallback={null}>
        <HeroScene layout={layout} cards={cards} palette={palette} />
      </Suspense>
    </Canvas>
  )
}
