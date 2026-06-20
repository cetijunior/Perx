import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles } from 'lucide-react'

const BRUSH = 26
const REVEAL_RATIO = 0.28

function drawOverlay(ctx, w, h, label) {
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, w, h)

  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#CC785C')
  grad.addColorStop(0.45, '#D4896A')
  grad.addColorStop(1, '#E8A55A')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  for (let x = 8; x < w; x += 14) {
    for (let y = 8; y < h; y += 14) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = '600 13px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, w / 2, h / 2 + 6)

  ctx.globalCompositeOperation = 'destination-out'
}

function scratchedRatio(ctx, w, h, dpr) {
  const { data } = ctx.getImageData(0, 0, w * dpr, h * dpr)
  let cleared = 0
  let sampled = 0
  const stride = 4 * 12
  for (let i = 3; i < data.length; i += stride) {
    sampled++
    if (data[i] < 16) cleared++
  }
  return sampled ? cleared / sampled : 0
}

// Reveals discount code or "try again". Canvas-based scratching.
export default function ScratchCard({ disabled, prize, onReveal, label = 'Scratch to reveal' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const drawingRef = useRef(false)
  const finishedRef = useRef(false)
  const [revealed, setRevealed] = useState(false)

  const paintOverlay = useCallback(() => {
    const c = canvasRef.current
    if (!c || disabled) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = c.clientWidth
    const h = c.clientHeight
    if (!w || !h) return

    c.width = w * dpr
    c.height = h * dpr
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawOverlay(ctx, w, h, label)
    ctxRef.current = ctx
    sizeRef.current = { w, h, dpr }
  }, [disabled, label])

  useEffect(() => {
    if (disabled) return
    setRevealed(false)
    finishedRef.current = false
    paintOverlay()

    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') return undefined

    const ro = new ResizeObserver(() => paintOverlay())
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [disabled, label, prize, paintOverlay])

  const scratchAt = useCallback((clientX, clientY) => {
    if (revealed || disabled) return
    const c = canvasRef.current
    const ctx = ctxRef.current
    const { w, h, dpr } = sizeRef.current
    if (!c || !ctx || !w || !h) return

    const rect = c.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, BRUSH, 0, Math.PI * 2)
    ctx.fill()

    if (finishedRef.current || scratchedRatio(ctx, w, h, dpr) < REVEAL_RATIO) return

    finishedRef.current = true
    setRevealed(true)
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    onReveal?.()
  }, [disabled, onReveal, revealed])

  const pointerDown = useCallback((e) => {
    if (disabled || revealed) return
    drawingRef.current = true
    canvasRef.current?.setPointerCapture?.(e.pointerId)
    scratchAt(e.clientX, e.clientY)
  }, [disabled, revealed, scratchAt])

  const pointerMove = useCallback((e) => {
    if (!drawingRef.current) return
    scratchAt(e.clientX, e.clientY)
  }, [scratchAt])

  const pointerUp = useCallback((e) => {
    drawingRef.current = false
    canvasRef.current?.releasePointerCapture?.(e.pointerId)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-[4/2.4] w-full max-w-[420px] overflow-hidden rounded-lg border border-line bg-grad-dusk"
    >
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <Gift className="mx-auto mb-1 h-7 w-7 text-gold" />
          <p className="font-display text-2xl font-bold tabular-nums text-gold">{prize.label}</p>
          <p className="mt-0.5 text-xs text-muted">{prize.subtitle}</p>
        </div>
      </div>

      {!disabled && !revealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onPointerLeave={pointerUp}
        />
      )}

      {disabled && (
        <div className="absolute inset-0 grid place-items-center bg-bg-elevated/70 text-center text-sm text-muted">
          <p className="px-6">{prize.disabledLabel}</p>
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <span className="rounded-full bg-grad-gold px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-[#1A1206] shadow-gold">
              <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" /> You won
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
