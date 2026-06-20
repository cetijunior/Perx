import { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Stylized Tirana — abstract SVG, NOT a real map API. Office at center.
const RIVERS = [
  'M 0,72 C 18,68 28,76 48,72 S 78,66 100,72',
  'M 0,30 C 22,34 36,28 60,32 S 90,30 100,28',
]
const BLOCKS = [
  { x: 14, y: 20, w: 14, h: 10 }, { x: 32, y: 18, w: 12, h: 12 },
  { x: 50, y: 22, w: 16, h: 10 }, { x: 72, y: 16, w: 10, h: 14 },
  { x: 10, y: 44, w: 18, h: 10 }, { x: 36, y: 40, w: 14, h: 18 },
  { x: 56, y: 44, w: 10, h: 12 }, { x: 70, y: 50, w: 16, h: 8 },
  { x: 18, y: 62, w: 14, h: 12 }, { x: 50, y: 70, w: 18, h: 8 },
  { x: 76, y: 68, w: 10, h: 12 },
]

const CATCOLOR = {
  wellness: 'rgb(var(--cat-wellness))',
  food: 'rgb(var(--cat-food))',
  sport: 'rgb(var(--cat-sport))',
  travel: 'rgb(var(--cat-travel))',
  learning: 'rgb(var(--cat-learning))',
  selfcare: 'rgb(var(--cat-selfcare))',
  health: 'rgb(var(--cat-health))',
}

export default function TiranaMap({ pins = [], selectedId, onSelect, scanning, officeLabel = 'Office' }) {
  const uid = useId().replace(/:/g, '')
  const gridId = `map-grid-${uid}`
  const glowId = `map-glow-${uid}`

  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-line bg-bg-elevated">
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-60 dark:opacity-35" />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id={gridId} width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgb(var(--map-grid))" strokeWidth="0.2" />
          </pattern>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(var(--map-office))" stopOpacity="0.55" />
            <stop offset="100%" stopColor="rgb(var(--map-office))" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height="100" fill="rgb(var(--map-base))" />
        <rect width="100" height="100" fill={`url(#${gridId})`} />

        {BLOCKS.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill="rgb(var(--map-block))"
            stroke="rgb(var(--map-block-stroke))"
            strokeWidth="0.2"
            rx="0.6"
          />
        ))}

        {RIVERS.map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="rgb(var(--map-river))"
            strokeOpacity="0.35"
            strokeWidth="0.6"
            fill="none"
          />
        ))}

        <circle cx="50" cy="50" r="10" fill={`url(#${glowId})`} />
        <circle cx="50" cy="50" r="2" fill="rgb(var(--map-office))" />
        <circle
          cx="50"
          cy="50"
          r="3.5"
          fill="none"
          stroke="rgb(var(--map-office))"
          strokeWidth="0.4"
          opacity="0.65"
        />

        {scanning && (
          <g>
            <motion.circle
              cx="50"
              cy="50"
              r="6"
              fill="none"
              stroke="rgb(var(--map-office))"
              strokeWidth="0.5"
              animate={{ r: [6, 56], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="6"
              fill="none"
              stroke="rgb(var(--map-scan-alt))"
              strokeWidth="0.5"
              animate={{ r: [6, 56], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
            />
          </g>
        )}
      </svg>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[160%] rounded-md border border-ember/40 bg-bg-elevated/90 px-2 py-1 text-[0.65rem] font-semibold text-ember shadow-glow backdrop-blur">
        <Building2 className="-mt-0.5 mr-1 inline h-3 w-3" /> {officeLabel}
      </div>

      <AnimatePresence>
        {pins.map((p, i) => {
          const isSel = p.id === selectedId
          const color = CATCOLOR[p.category] || 'rgb(var(--ember))'
          return (
            <motion.button
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
              onClick={() => onSelect?.(p.id)}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform',
                isSel && 'z-10 scale-125',
              )}
              style={{ left: `${p.map.x}%`, top: `${p.map.y}%` }}
              aria-label={p.name}
            >
              <span
                className="relative grid h-5 w-5 place-items-center rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 28%, transparent), 0 4px 14px color-mix(in srgb, ${color} 50%, transparent)`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-bg-elevated" />
                {isSel && (
                  <span
                    className="absolute inset-[-6px] animate-pulsedot rounded-full border-2"
                    style={{ borderColor: color }}
                  />
                )}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 rounded-md border border-line bg-bg-elevated/90 p-1.5 text-[0.6rem] capitalize text-faint backdrop-blur">
        {Object.entries(CATCOLOR).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1 px-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  )
}
