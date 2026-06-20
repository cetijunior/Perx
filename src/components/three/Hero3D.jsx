import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { PROVIDERS } from '@/lib/catalog'
import HeroBenefitCard from '@/components/employee/HeroBenefitCard'
import { getHeroLayout } from './heroLayout'

function OrbitCard({ provider, index, total, radius, ySpread, cardWidth, distanceFactor }) {
  const ref = useRef()
  const phase = (index / total) * Math.PI * 2
  const yOffset = Math.sin(phase * 1.3 + index * 0.4) * ySpread

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime() * 0.22 + phase
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.z = Math.sin(t) * radius
    ref.current.position.y = yOffset + Math.sin(t * 1.5) * 0.12
    ref.current.rotation.y = -t + Math.PI / 2
  })

  return (
    <group ref={ref}>
      <Html
        transform
        occlude={false}
        distanceFactor={distanceFactor}
        zIndexRange={[0, 0]}
        style={{ pointerEvents: 'none', width: cardWidth }}
      >
        <HeroBenefitCard provider={provider} />
      </Html>
    </group>
  )
}

function Scene({ layout }) {
  const providers = useMemo(
    () => PROVIDERS.slice(0, layout.cardCount),
    [layout.cardCount],
  )

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={0.55} />
      {providers.map((provider, i) => (
        <OrbitCard
          key={provider.id}
          provider={provider}
          index={i}
          total={providers.length}
          radius={layout.orbitRadius}
          ySpread={layout.ySpread}
          cardWidth={layout.cardWidth}
          distanceFactor={layout.distanceFactor}
        />
      ))}
    </>
  )
}

export default function Hero3D({ active = true }) {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280))

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const layout = getHeroLayout(width)

  if (layout.isMobile) return null

  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, layout.dprMax]}
      gl={{ antialias: layout.antialias, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, layout.cameraY, layout.cameraZ], fov: layout.fov }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene layout={layout} />
      </Suspense>
    </Canvas>
  )
}
