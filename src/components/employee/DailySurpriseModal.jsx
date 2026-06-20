import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Gift, Star, Zap } from 'lucide-react'
import { useCurrentUser, useStore, getState, budgetFor, awardBonus, setGames, pickTodayGame } from '@/lib/store'
import ScratchCard from '@/components/employee/ScratchCard'
import SpinWheel from '@/components/employee/SpinWheel'

// ── Confetti particle ────────────────────────────────────────────
function Particle({ style }) {
  return <span className="surprise-confetti-dot" style={style} />
}

function ConfettiBurst({ active }) {
  const particles = useMemo(() => {
    if (!active) return []
    const colors = ['#7C3AED', '#E0A938', '#10B981', '#EC4899', '#3B82F6', '#F59E0B', '#A78BFA']
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      angle: (i / 48) * 360,
      dist: 60 + Math.random() * 120,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 0.3,
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'rect',
    }))
  }, [active])

  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const tx = Math.cos(rad) * p.dist
        const ty = Math.sin(rad) * p.dist
        const borderRadius = p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : '3px'
        const width = p.shape === 'rect' ? p.size * 0.5 : p.size
        return (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.9 + Math.random() * 0.4, delay: p.delay, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width,
              height: p.size,
              backgroundColor: p.color,
              borderRadius,
            }}
          />
        )
      })}
    </div>
  )
}

// ── Floating sparkle icons ───────────────────────────────────────
function FloatingStars() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-gold/70"
          style={{ left: `${10 + i * 15}%`, top: `${15 + (i % 3) * 20}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4], rotate: [0, 20, 0] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        >
          {i % 2 === 0 ? <Star className="h-3 w-3 fill-current" /> : <Sparkles className="h-3.5 w-3.5" />}
        </motion.div>
      ))}
    </div>
  )
}

// ── Main modal ───────────────────────────────────────────────────
export default function DailySurpriseModal({ gameType, onClose }) {
  const user = useCurrentUser()
  useStore()
  const emp = getState().employees[user.id]
  const b = budgetFor(user.id)

  const scratchUsed = emp.games.scratchToday
  const spinsLeft = emp.games.spinsLeft
  const alreadyPlayed =
    (gameType === 'scratch' && scratchUsed) ||
    (gameType === 'spin' && spinsLeft === 0)

  const [done, setDone] = useState(false)
  const [winLabel, setWinLabel] = useState('')
  const [confetti, setConfetti] = useState(false)
  const overlayRef = useRef(null)

  // Build the same deterministic prize logic as BudgetGames
  const prize = useMemo(() => {
    const seed = (user.id.charCodeAt(0) + new Date().getDate()) % 4
    return [
      { amount: 500, label: '+500 LEK', subtitle: "Daily bonus — you're on a roll! 🔥", disabledLabel: 'Already used today' },
      { amount: 300, label: '+300 LEK', subtitle: 'Keep the streak going! ⚡', disabledLabel: 'Already used today' },
      { amount: 150, label: '+150 LEK', subtitle: 'Nice one!', disabledLabel: 'Already used today' },
      { amount: 0, label: 'Try Again', subtitle: 'Better luck tomorrow 🍀', disabledLabel: 'Already used today' },
    ][seed]
  }, [user.id])

  function handleScratchReveal() {
    if (scratchUsed) return
    if (prize.amount > 0) awardBonus(user.id, prize.amount, 'Scratch card')
    setGames(user.id, { scratchToday: true })
    const label = prize.amount > 0 ? `You won ${prize.label}! 🎉` : 'Better luck tomorrow!'
    setWinLabel(label)
    if (prize.amount > 0) setConfetti(true)
    setDone(true)
  }

  function handleSpinResult(w) {
    setGames(user.id, { spinsLeft: Math.max(0, spinsLeft - 1) })

    // Map wedge IDs to reward amounts
    const rewards = {
      lek100: 100, lek150: 150, lek200: 200,
      lek300: 300, lek500: 500, lek750: 750,
      bonus: 1000,
    }
    const amount = rewards[w.id] ?? 0
    let label = ''

    if (w.id === 'tryagain') {
      label = 'Better luck tomorrow! 🍀'
    } else if (amount > 0) {
      awardBonus(user.id, amount, `Spin: ${w.label}`)
      label = `${w.label} — +${amount} LEK added! 🎉`
    } else {
      // perk wedges (spa, gym, disc20, disc15)
      awardBonus(user.id, 100, `Spin perk: ${w.label}`)
      label = `${w.label} unlocked! Check your benefits 🎁`
    }

    setWinLabel(label)
    if (w.id !== 'tryagain') setConfetti(true)
    setTimeout(() => setDone(true), 3700)
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  // Trap escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const title = gameType === 'scratch' ? '🎴 Scratch Your Reward' : '🎡 Spin to Win'
  const subtitle = gameType === 'scratch'
    ? 'Scratch the card to reveal today\'s bonus!'
    : 'Give the wheel a spin for a daily reward!'

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        key="surprise-backdrop"
        className="surprise-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Daily Surprise"
      >
        <motion.div
          className="surprise-card"
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.05 }}
        >
          {/* Floating stars bg */}
          <FloatingStars />

          {/* Glowing accent blob */}
          <div className="surprise-blob" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="surprise-close"
            aria-label="Dismiss surprise"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header badge */}
          <div className="surprise-badge">
            <Zap className="h-3.5 w-3.5" />
            Daily Surprise
          </div>

          {/* Title */}
          <div className="surprise-header">
            <motion.h2
              className="surprise-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="surprise-subtitle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              {subtitle}
            </motion.p>
          </div>

          {/* ── Already played state ── */}
          {alreadyPlayed && (
            <motion.div
              className="surprise-already-played"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Gift className="h-10 w-10 text-ember/60 mx-auto mb-3" />
              <p className="text-base font-semibold text-text">You've already played today!</p>
              <p className="mt-1 text-sm text-muted">Come back tomorrow for another surprise.</p>
              <button onClick={onClose} className="surprise-cta mt-5">
                Got it ✓
              </button>
            </motion.div>
          )}

          {/* ── Active game ── */}
          {!alreadyPlayed && !done && (
            <motion.div
              className="surprise-game-area"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
            >
              {gameType === 'scratch' ? (
                <ScratchCard
                  disabled={false}
                  prize={prize}
                  onReveal={handleScratchReveal}
                  label="Scratch to reveal your reward"
                />
              ) : (
                <SpinWheel disabled={false} onResult={handleSpinResult} />
              )}
            </motion.div>
          )}

          {/* ── Win / completion state ── */}
          {done && (
            <motion.div
              className="surprise-win-state"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Confetti burst */}
              <ConfettiBurst active={confetti} />

              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 3, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.div>
              <p className="surprise-win-label">{winLabel}</p>
              <p className="text-sm text-muted mt-1">Reward added to your budget!</p>
              <button onClick={onClose} className="surprise-cta mt-6">
                <Sparkles className="h-4 w-4" />
                Awesome, let's go!
              </button>
            </motion.div>
          )}

          {/* Dismiss hint (only when game is active) */}
          {!alreadyPlayed && !done && (
            <p className="surprise-dismiss-hint">
              Press Esc or tap ✕ to dismiss
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
