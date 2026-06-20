import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles } from 'lucide-react'

// Reveals 0–500 ALL bonus or a "deal discount". Canvas-based scratching.
export default function ScratchCard({ disabled, prize, onReveal, label = 'Scratch to reveal' }) {
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const draggingRef = useRef(false)
  const erasedRef = useRef(0)

  useEffect(() => {
    if (disabled) return
    const c = canvasRef.current; if (!c) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = c.clientWidth, h = c.clientHeight
    c.width = w * dpr; c.height = h * dpr
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr)
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#5B21B6'); grad.addColorStop(0.5, '#7C3AED'); grad.addColorStop(1, '#A78BFA')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.font = '600 14px Inter, sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(label, w / 2, h / 2 + 6)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '700 11px Inter'; ctx.fillText('PERX', w / 2, h / 2 - 14)
    ctx.globalCompositeOperation = 'destination-out'
  }, [disabled, label])

  function scratchAt(e) {
    if (revealed || !draggingRef.current) return
    const c = canvasRef.current; if (!c) return
    const rect = c.getBoundingClientRect()
    const x = ((e.touches?.[0]?.clientX ?? e.clientX) - rect.left)
    const y = ((e.touches?.[0]?.clientY ?? e.clientY) - rect.top)
    const ctx = c.getContext('2d')
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill()
    erasedRef.current += 1
    if (erasedRef.current > 60) finish()
  }
  function finish() {
    if (revealed) return
    setRevealed(true)
    const c = canvasRef.current
    if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height) }
    onReveal?.()
  }

  return (
    <div className="relative aspect-[4/2.4] w-full overflow-hidden rounded-lg border border-line bg-grad-dusk">
      {/* prize underlay */}
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <Gift className="mx-auto mb-1 h-7 w-7 text-gold" />
          <p className="font-display text-2xl font-bold tabular-nums text-gold">{prize.label}</p>
          <p className="mt-0.5 text-xs text-muted">{prize.subtitle}</p>
        </div>
      </div>
      {/* scratch canvas */}
      {!disabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onMouseDown={(e) => { draggingRef.current = true; scratchAt(e) }}
          onMouseMove={scratchAt}
          onMouseUp={() => { draggingRef.current = false }}
          onMouseLeave={() => { draggingRef.current = false }}
          onTouchStart={(e) => { draggingRef.current = true; scratchAt(e) }}
          onTouchMove={scratchAt}
          onTouchEnd={() => { draggingRef.current = false }}
          onDoubleClick={finish}
        />
      )}
      {disabled && (
        <div className="absolute inset-0 grid place-items-center bg-bg-elevated/70 text-center text-sm text-muted">
          <p className="px-6">{prize.disabledLabel}</p>
        </div>
      )}
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-grad-gold px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-[#1A1206] shadow-gold">
              <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" /> You won
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
