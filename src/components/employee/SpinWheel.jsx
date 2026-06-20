import { useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORIES } from '@/lib/catalog'

// Spin wheel — 8 wedges, picks a random category to "unlock".
export default function SpinWheel({ disabled, onResult }) {
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const wedges = [...CATEGORIES.slice(0, 7), { id: 'bonus', label: '+500', color: 'gold' }]

  function spin() {
    if (spinning || disabled) return
    setResult(null); setSpinning(true)
    const target = Math.floor(Math.random() * wedges.length)
    const stop = 360 * 5 + target * (360 / wedges.length) + 360 / wedges.length / 2
    const final = angle + stop
    setAngle(final)
    setTimeout(() => {
      setSpinning(false)
      const picked = wedges[wedges.length - 1 - target]
      setResult(picked)
      onResult?.(picked)
    }, 3400)
  }

  const slice = 360 / wedges.length
  return (
    <div className="grid place-items-center gap-3">
      <div className="relative h-56 w-56">
        {/* pointer */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-ember drop-shadow-md" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-bg-elevated-2 shadow-e3"
          animate={{ rotate: angle }}
          transition={{ duration: 3.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg viewBox="-100 -100 200 200" className="h-full w-full -rotate-90">
            {wedges.map((w, i) => {
              const a0 = (i * slice * Math.PI) / 180
              const a1 = ((i + 1) * slice * Math.PI) / 180
              const x0 = Math.cos(a0) * 100, y0 = Math.sin(a0) * 100
              const x1 = Math.cos(a1) * 100, y1 = Math.sin(a1) * 100
              const color = w.id === 'bonus' ? '#E0A938' : `var(--cat-${w.color})`
              const mid = ((i + 0.5) * slice * Math.PI) / 180
              const tx = Math.cos(mid) * 62, ty = Math.sin(mid) * 62
              return (
                <g key={w.id}>
                  <path d={`M0,0 L${x0},${y0} A100,100 0 0,1 ${x1},${y1} Z`} fill={color} opacity={0.92} />
                  <text x={tx} y={ty} fill="#0B0D12" fontSize="8" fontWeight="700" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * slice + slice / 2} ${tx} ${ty}) rotate(90 ${tx} ${ty})`}>{w.label}</text>
                </g>
              )
            })}
          </svg>
        </motion.div>
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-bg-elevated-2 text-[0.65rem] font-bold uppercase text-faint shadow-e2 ring-2 ring-line">PERX</div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="rounded-full bg-grad-ember px-6 py-2.5 text-sm font-semibold text-on-accent shadow-glow transition active:scale-95 disabled:opacity-50"
      >
        {spinning ? 'Spinning…' : disabled ? 'No spins left today' : 'Spin'}
      </button>
      {result && !spinning && (
        <p className="text-xs text-muted">Unlocked: <span className="font-semibold text-text">{result.label}</span></p>
      )}
    </div>
  )
}
