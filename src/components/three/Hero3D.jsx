import { useMemo, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Billboard, Text, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'

const CARDS = [
  { label: 'Wellness', color: '#34D399', glyph: '✦' },
  { label: 'Food', color: '#F59E0B', glyph: '◆' },
  { label: 'Sport', color: '#3B82F6', glyph: '▲' },
  { label: 'Travel', color: '#A78BFA', glyph: '✈' },
  { label: 'Learning', color: '#22D3EE', glyph: '✚' },
  { label: 'Self-care', color: '#F472B6', glyph: '❤' },
  { label: 'Health', color: '#2DD4BF', glyph: '✚' },
  { label: 'Yoga', color: '#34D399', glyph: '✦' },
]

function BenefitCard({ color, label, glyph, radius, angle, y, speed }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + angle
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius
      ref.current.position.z = Math.sin(t) * radius
      ref.current.position.y = y + Math.sin(t * 1.3) * 0.25
    }
  })
  return (
    <group ref={ref}>
      <Billboard>
        <RoundedBox args={[1.7, 2.3, 0.08]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color="#12151C" metalness={0.4} roughness={0.35} emissive={color} emissiveIntensity={0.06} />
        </RoundedBox>
        {/* colored glow rim */}
        <RoundedBox args={[1.74, 2.34, 0.04]} radius={0.13} smoothness={4} position={[0, 0, -0.04]}>
          <meshBasicMaterial color={color} transparent opacity={0.28} />
        </RoundedBox>
        {/* icon proxy disc */}
        <mesh position={[0, 0.5, 0.06]}>
          <circleGeometry args={[0.42, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} />
        </mesh>
        <Text position={[0, 0.5, 0.07]} fontSize={0.42} color={color} anchorX="center" anchorY="middle">{glyph}</Text>
        <Text position={[0, -0.55, 0.07]} fontSize={0.2} color="#F4F6FB" anchorX="center" anchorY="middle" maxWidth={1.4} letterSpacing={0.02}>
          {label}
        </Text>
        <mesh position={[0, -0.85, 0.07]}>
          <planeGeometry args={[0.9, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      </Billboard>
    </group>
  )
}

function Particles({ count }) {
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
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F4593B" transparent opacity={0.6} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Cluster({ mobile }) {
  const group = useRef()
  const cards = mobile ? CARDS.slice(0, 5) : CARDS
  useFrame((state, delta) => { if (group.current) group.current.rotation.y += delta * 0.06 })
  return (
    <group ref={group}>
      {cards.map((c, i) => (
        <BenefitCard
          key={c.label + i}
          {...c}
          radius={mobile ? 2.6 : 3.4}
          angle={(i / cards.length) * Math.PI * 2}
          y={(i % 3 - 1) * 0.7}
          speed={0.12}
        />
      ))}
    </group>
  )
}

export default function Hero3D() {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768
  const particleCount = mobile ? 120 : 320
  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ position: [0, 0.5, 9], fov: 50 }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance', alpha: true }}
      frameloop="always"
    >
      <Suspense fallback={null}>
        <fog attach="fog" args={['#0B0D12', 8, 18]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 4, 5]} intensity={120} color="#FF7A5C" distance={30} decay={1.6} />
        <pointLight position={[-6, -2, -4]} intensity={90} color="#E0A938" distance={30} decay={1.6} />
        <pointLight position={[0, 6, -2]} intensity={50} color="#A78BFA" distance={30} decay={1.6} />
        <Cluster mobile={mobile} />
        <Particles count={particleCount} />
        <AdaptiveDpr pixelated />
      </Suspense>
    </Canvas>
  )
}
