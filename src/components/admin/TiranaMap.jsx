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

const CATCOLOR = { wellness: '#34D399', food: '#F59E0B', sport: '#3B82F6', travel: '#A78BFA', learning: '#22D3EE', selfcare: '#F472B6', health: '#2DD4BF' }

export default function TiranaMap({ pins = [], selectedId, onSelect, scanning, officeLabel = 'Office' }) {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-line bg-bg-elevated">
      {/* aurora bg */}
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-60" />

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1B2029" strokeWidth="0.2" />
          </pattern>
          <radialGradient id="officeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F4593B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F4593B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {/* faux blocks */}
        {BLOCKS.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#12151C" stroke="#242A36" strokeWidth="0.2" rx="0.6" />)}
        {/* rivers */}
        {RIVERS.map((d, i) => <path key={i} d={d} stroke="#A78BFA" strokeOpacity="0.25" strokeWidth="0.6" fill="none" />)}
        {/* office glow + marker */}
        <circle cx="50" cy="50" r="10" fill="url(#officeGlow)" />
        <circle cx="50" cy="50" r="2" fill="#F4593B" />
        <circle cx="50" cy="50" r="3.5" fill="none" stroke="#F4593B" strokeWidth="0.4" opacity="0.6" />

        {/* radial scan */}
        {scanning && (
          <g>
            <motion.circle cx="50" cy="50" r="6" fill="none" stroke="#F4593B" strokeWidth="0.5"
              animate={{ r: [6, 56], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <motion.circle cx="50" cy="50" r="6" fill="none" stroke="#E0A938" strokeWidth="0.5"
              animate={{ r: [6, 56], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }} />
          </g>
        )}
      </svg>

      {/* office label */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[160%] rounded-md border border-ember/40 bg-bg-elevated/90 px-2 py-1 text-[0.65rem] font-semibold text-ember shadow-glow backdrop-blur">
        <Building2 className="-mt-0.5 mr-1 inline h-3 w-3" /> {officeLabel}
      </div>

      {/* pins (positioned via CSS percentages so they remain clickable) */}
      <AnimatePresence>
        {pins.map((p, i) => {
          const isSel = p.id === selectedId
          const color = CATCOLOR[p.category] || '#F4593B'
          return (
            <motion.button
              key={p.id}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
              onClick={() => onSelect?.(p.id)}
              className={cn('absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform', isSel && 'z-10 scale-125')}
              style={{ left: `${p.map.x}%`, top: `${p.map.y}%` }}
              aria-label={p.name}
            >
              <span className="relative grid h-5 w-5 place-items-center rounded-full" style={{ background: color, boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 28%, transparent), 0 4px 14px color-mix(in srgb, ${color} 50%, transparent)` }}>
                <span className="h-1.5 w-1.5 rounded-full bg-bg" />
                {isSel && <span className="absolute inset-[-6px] animate-pulsedot rounded-full border-2" style={{ borderColor: color }} />}
              </span>
            </motion.button>
          )
        })}
      </AnimatePresence>

      {/* legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 rounded-md border border-line bg-bg-elevated/80 p-1.5 text-[0.6rem] text-faint backdrop-blur">
        {Object.entries(CATCOLOR).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1 px-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{k}</span>
        ))}
      </div>
    </div>
  )
}
