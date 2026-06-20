import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw, Ticket, Disc3, Hash, Brain, PartyPopper, ArrowUp, ArrowDown,
  Dumbbell, Pizza, Plane, Heart, BookOpen, Music, HelpCircle, Tag, ChevronRight,
} from 'lucide-react'
import {
  useCurrentUser, useStore, getState, awardDiscountCode, setGames,
} from '@/lib/store'
import {
  scratchPrizeForUser, spinRewardFromWedge, guessReward, MEMORY_REWARD, rewardToClaim,
} from '@/lib/gameRewards'
import { cn } from '@/lib/utils'
import ScratchCard from '@/components/employee/ScratchCard'
import SpinWheel from '@/components/employee/SpinWheel'
import Button from '@/components/ui/Button'

const GAME_TABS = [
  { id: 'scratch', label: 'Scratch', icon: Ticket },
  { id: 'spin', label: 'Spin', icon: Disc3 },
  { id: 'guess', label: 'Guess', icon: Hash },
  { id: 'memory', label: 'Memory', icon: Brain },
]

const GAME_EMPTY_ICONS = {
  scratch: Ticket,
  spin: Disc3,
  guess: Hash,
  memory: Brain,
}

const MEMORY_SYMBOLS = [
  { id: 'gym', Icon: Dumbbell },
  { id: 'food', Icon: Pizza },
  { id: 'travel', Icon: Plane },
  { id: 'wellness', Icon: Heart },
  { id: 'books', Icon: BookOpen },
  { id: 'music', Icon: Music },
]

export default function MiniGamesSection() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const emp = getState().employees[user.id]

  const [active, setActive] = useState('scratch')
  const [result, setResult] = useState(null)
  const [lastCode, setLastCode] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [resetCount, setResetCount] = useState(0)

  const today = new Date().toISOString().slice(0, 10)
  const prize = useMemo(() => scratchPrizeForUser(user.id, today), [user.id, today])

  const scratchUsed = emp.games.scratchToday
  const spinsLeft = emp.games.spinsLeft
  const guessUsed = emp.games.guessToday
  const memoryUsed = emp.games.memoryToday

  async function claimReward(reward, gamesPatch, successMessage) {
    if (!reward) {
      setResult(successMessage)
      if (gamesPatch) setGames(user.id, gamesPatch)
      return
    }
    setClaiming(true)
    try {
      const code = await awardDiscountCode(user.id, reward)
      if (gamesPatch) setGames(user.id, gamesPatch)
      setLastCode(code)
      setResult(successMessage || t('games.codeWon', { label: reward.label }))
    } finally {
      setClaiming(false)
    }
  }

  async function handleScratchReveal() {
    if (scratchUsed || claiming) return
    const reward = rewardToClaim(prize, 'scratch')
    await claimReward(
      reward,
      { scratchToday: true },
      reward ? t('games.codeWon', { label: prize.label }) : t('games.tryAgainTomorrow'),
    )
  }

  async function handleSpinResult(w) {
    if (claiming) return
    const spec = spinRewardFromWedge(w)
    const reward = spec ? { ...spec, source: 'spin' } : null
    await claimReward(
      reward,
      { spinsLeft: Math.max(0, spinsLeft - 1) },
      w.id === 'tryagain'
        ? t('games.tryAgainTomorrow')
        : t('games.codeWon', { label: spec?.label || w.label }),
    )
  }

  function resetGames() {
    setGames(user.id, {
      scratchToday: false,
      guessToday: false,
      memoryToday: false,
      spinsLeft: 1,
    })
    setResult(null)
    setLastCode(null)
    setResetCount((n) => n + 1)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-line bg-bg-elevated-2 p-1">
          {GAME_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActive(tab.id); setResult(null) }}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                active === tab.id ? 'bg-bg-elevated text-ember shadow-e1' : 'text-muted hover:text-text',
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={resetGames}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-faint transition-colors hover:bg-bg-elevated-2 hover:text-muted"
          title={t('games.resetDaily')}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t('games.reset')}
        </button>
      </div>

      <div className="p-5">
        {result && (
          <div className="mb-4 space-y-3 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-center">
            <p className="text-sm font-medium text-success">{result}</p>
            {lastCode && (
              <div className="mx-auto max-w-sm rounded-lg border border-line bg-bg-elevated px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-wide text-faint">{t('games.yourCode')}</p>
                <p className="font-mono text-lg font-bold tracking-wider text-ember">{lastCode.code}</p>
              </div>
            )}
            {lastCode && (
              <Button as={Link} to="/employee/card" variant="secondary" size="sm" className="gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                {t('games.viewInRedeem')}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {active === 'scratch' && (
          scratchUsed ? (
            <GameEmptyState icon={GAME_EMPTY_ICONS.scratch} title={t('games.scratchUsedTitle')} subtitle={t('games.scratchUsedHint')} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted">{t('games.scratchHint')}</p>
              <ScratchCard
                key={`${today}-${resetCount}`}
                disabled={claiming}
                prize={prize}
                onReveal={handleScratchReveal}
                label={t('games.scratchAction')}
              />
            </div>
          )
        )}

        {active === 'spin' && (
          spinsLeft === 0 ? (
            <GameEmptyState icon={GAME_EMPTY_ICONS.spin} title={t('games.spinUsedTitle')} subtitle={t('games.spinUsedHint')} />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted">{t('games.spinHint')}</p>
              <SpinWheel disabled={spinsLeft === 0 || claiming} onResult={handleSpinResult} />
            </div>
          )
        )}

        {active === 'guess' && (
          guessUsed ? (
            <GameEmptyState icon={GAME_EMPTY_ICONS.guess} title={t('games.guessUsedTitle')} subtitle={t('games.guessUsedHint')} />
          ) : (
            <NumberGuessGame
              onDone={async (attemptsLeft, won) => {
                if (won) {
                  const spec = guessReward(attemptsLeft)
                  await claimReward(
                    { ...spec, source: 'guess' },
                    { guessToday: true },
                    t('games.codeWon', { label: spec.label }),
                  )
                } else {
                  setGames(user.id, { guessToday: true })
                  setResult(t('games.guessLost'))
                }
              }}
            />
          )
        )}

        {active === 'memory' && (
          memoryUsed ? (
            <GameEmptyState icon={GAME_EMPTY_ICONS.memory} title={t('games.memoryUsedTitle')} subtitle={t('games.memoryUsedHint')} />
          ) : (
            <MemoryMatchGame
              onDone={async () => {
                await claimReward(
                  { ...MEMORY_REWARD, source: 'memory' },
                  { memoryToday: true },
                  t('games.codeWon', { label: MEMORY_REWARD.label }),
                )
              }}
            />
          )
        )}
      </div>
    </div>
  )
}

function NumberGuessGame({ onDone }) {
  const target = useMemo(() => Math.floor(Math.random() * 10) + 1, [])
  const [selected, setSelected] = useState(5)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [hint, setHint] = useState(null)
  const [done, setDone] = useState(false)

  function guess() {
    if (done) return
    if (selected === target) {
      setDone(true)
      onDone(attemptsLeft, true)
    } else {
      const next = attemptsLeft - 1
      setAttemptsLeft(next)
      if (next === 0) {
        setDone(true)
        onDone(0, false)
      } else {
        setHint(selected < target ? 'low' : 'high')
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-center text-sm font-semibold text-text">I'm thinking of a number between 1 and 10.</p>
      <p className={cn('text-xs', attemptsLeft === 1 ? 'text-danger' : 'text-muted')}>
        {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setSelected(n)}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-lg border text-sm font-bold transition-colors',
              selected === n
                ? 'border-ember bg-ember/15 text-ember'
                : 'border-line bg-bg-elevated-2 text-text hover:border-ember/40',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {hint && (
        <p className="flex items-center gap-1 text-sm font-semibold text-gold">
          {hint === 'low' ? (
            <>Too low — try higher <ArrowUp className="h-4 w-4" /></>
          ) : (
            <>Too high — try lower <ArrowDown className="h-4 w-4" /></>
          )}
        </p>
      )}
      <button
        onClick={guess}
        disabled={done}
        className="w-full max-w-[200px] rounded-lg bg-ember px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-opacity disabled:opacity-50"
      >
        Guess!
      </button>
    </div>
  )
}

function MemoryMatchGame({ onDone }) {
  const [cards, setCards] = useState(() => {
    const all = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((symbol, i) => ({
      id: i, symbolId: symbol.id, Icon: symbol.Icon, faceUp: false, matched: false,
    }))
    return all.sort(() => Math.random() - 0.5)
  })
  const [flipped, setFlipped] = useState([])
  const [checking, setChecking] = useState(false)
  const [finished, setFinished] = useState(false)
  const matchedCount = cards.filter((c) => c.matched).length

  function flipCard(id) {
    if (checking || finished) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.faceUp || card.matched) return
    const next = flipped.concat(id)
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, faceUp: true } : c)))
    if (next.length === 2) {
      setChecking(true)
      setFlipped([])
      const [a, b] = next.map((i) => cards.find((c) => c.id === i))
      setTimeout(() => {
        if (a.symbolId === b.symbolId) {
          setCards((cs) =>
            cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)),
          )
          const newMatched = matchedCount + 1
          if (newMatched === MEMORY_SYMBOLS.length) {
            setFinished(true)
            onDone()
          }
        } else {
          setCards((cs) =>
            cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, faceUp: false } : c)),
          )
        }
        setChecking(false)
      }, 700)
    } else {
      setFlipped(next)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-muted">Match all {MEMORY_SYMBOLS.length} pairs to win a discount code!</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={cn(
              'grid h-14 w-14 place-items-center rounded-lg border transition-all',
              card.matched
                ? 'border-success/40 bg-success/10'
                : card.faceUp
                ? 'border-ember/40 bg-bg-elevated'
                : 'border-line bg-bg-elevated-2 hover:border-ember/30',
            )}
          >
            {card.faceUp || card.matched ? (
              <card.Icon className="h-6 w-6 text-ember" />
            ) : (
              <HelpCircle className="h-5 w-5 text-faint" />
            )}
          </button>
        ))}
      </div>
      {finished && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-success">
          <PartyPopper className="h-4 w-4" /> Code unlocked!
        </p>
      )}
    </div>
  )
}

function GameEmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Icon className="h-10 w-10 text-ember/60" />
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>
  )
}
