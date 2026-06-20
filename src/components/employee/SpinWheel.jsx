import { useState } from 'react'
import { motion } from 'framer-motion'

// 12 reward wedges — mix of LEK bonuses, discounts, and fun perks
const WHEEL_WEDGES = [
  { id: 'lek500',    label: '+500 LEK',  sublabel: 'Cash bonus',      color: '#7C3AED' },
  { id: 'disc20',   label: '−20%',       sublabel: 'Any benefit',     color: '#10B981' },
  { id: 'lek150',   label: '+150 LEK',  sublabel: 'Pocket money',     color: '#3B82F6' },
  { id: 'spa',      label: '🧖 Spa',     sublabel: 'Free day-pass',   color: '#EC4899' },
  { id: 'lek300',   label: '+300 LEK',  sublabel: 'Cash bonus',       color: '#F59E0B' },
  { id: 'tryagain', label: 'Try Again', sublabel: 'Come back tmrw',   color: '#6B7280' },
  { id: 'lek750',   label: '+750 LEK',  sublabel: '🔥 Big bonus',     color: '#E0A938' },
  { id: 'disc15',   label: '−15%',       sublabel: 'Food & drink',    color: '#CA8A1C' },
  { id: 'lek100',   label: '+100 LEK',  sublabel: 'Daily nudge',      color: '#8B5CF6' },
  { id: 'gym',      label: '🏋️ Gym',    sublabel: '1 week free',     color: '#0891B2' },
  { id: 'lek200',   label: '+200 LEK',  sublabel: 'Cash bonus',       color: '#D97706' },
  { id: 'bonus',    label: '⭐ JACKPOT', sublabel: '+1000 LEK!',      color: '#DC2626' },
]

export default function SpinWheel({ disabled, onResult }) {
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const wedges = WHEEL_WEDGES

  function spin() {
    if (spinning || disabled) return
    setResult(null); setSpinning(true)
    const target = Math.floor(Math.random() * wedges.length)
    const sliceDeg = 360 / wedges.length
    const stop = 360 * 6 + target * sliceDeg + sliceDeg / 2
    const final = angle + stop
    setAngle(final)
    setTimeout(() => {
      setSpinning(false)
      const picked = wedges[wedges.length - 1 - target]
      setResult(picked)
      onResult?.(picked)
    }, 3600)
  }

  const slice = 360 / wedges.length
  return (
    <div className="grid place-items-center gap-4">
      <div className="relative h-64 w-64">
        {/* pointer */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-x-[9px] border-t-[16px] border-x-transparent border-t-ember drop-shadow-md" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-[5px] border-bg-elevated-2 shadow-e3"
          style={{ boxShadow: '0 0 0 3px rgba(124,58,237,0.15), 0 8px 32px rgba(0,0,0,0.18)' }}
          animate={{ rotate: angle }}
          transition={{ duration: 3.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg viewBox="-100 -100 200 200" className="h-full w-full -rotate-90">
            {wedges.map((w, i) => {
              const a0 = (i * slice * Math.PI) / 180
              const a1 = ((i + 1) * slice * Math.PI) / 180
              const x0 = Math.cos(a0) * 100, y0 = Math.sin(a0) * 100
              const x1 = Math.cos(a1) * 100, y1 = Math.sin(a1) * 100
              const mid = ((i + 0.5) * slice * Math.PI) / 180
              const tx = Math.cos(mid) * 66, ty = Math.sin(mid) * 66
              const rot = i * slice + slice / 2
              return (
                <g key={w.id}>
                  {/* wedge fill */}
                  <path
                    d={`M0,0 L${x0},${y0} A100,100 0 0,1 ${x1},${y1} Z`}
                    fill={w.color}
                    opacity={0.9}
                  />
                  {/* subtle separator */}
                  <path
                    d={`M0,0 L${x0},${y0}`}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="0.8"
                    fill="none"
                  />
                  {/* label */}
                  <text
                    x={tx} y={ty}
                    fill="#fff"
                    fontSize="7.5"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${rot} ${tx} ${ty}) rotate(90 ${tx} ${ty})`}
                  >
                    {w.label}
                  </text>
                </g>
              )
            })}
            {/* centre glow ring */}
            <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.12)" />
          </svg>
        </motion.div>
        {/* hub */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-bg-elevated text-[0.6rem] font-black uppercase tracking-wide text-ember shadow-e3 ring-[3px] ring-ember/30">
            PERX
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="rounded-full bg-grad-ember px-7 py-2.5 text-sm font-semibold text-on-accent shadow-glow transition active:scale-95 disabled:opacity-50"
      >
        {spinning ? 'Spinning…' : disabled ? 'No spins left today' : '🎡 Spin!'}
      </button>

      {result && !spinning && (
        <div className="text-center">
          <p className="text-xs text-muted">
            You landed on: <span className="font-bold text-text">{result.label}</span>
          </p>
          {result.sublabel && (
            <p className="text-[0.65rem] text-faint">{result.sublabel}</p>
          )}
        </div>
      )}
    </div>
  )
}

