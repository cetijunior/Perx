import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Wifi, WifiOff } from 'lucide-react'
import { useCurrentUser, useStore, getState, addToCart, budgetFor } from '@/lib/store'
import { PROVIDERS } from '@/lib/catalog'
import { streamChat } from '@/lib/perky'
import { sleep, cn, formatALL } from '@/lib/utils'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { categoryPoster } from '@/lib/videos'

const PROMPTS = ['perky.p1', 'perky.p2', 'perky.p3', 'perky.p4']

export default function Perky() {
  const { t } = useTranslation()
  const location = useLocation()
  const nav = useNavigate()
  const user = useCurrentUser()
  useStore()
  const b = budgetFor(user.id)
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('perky.greeting') }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [online, setOnline] = useState(null)
  const endRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, busy])

  useEffect(() => {
    const prompt = location.state?.prompt
    if (prompt && !busy) {
      send(prompt)
      window.history.replaceState({}, document.title)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.prompt])

  async function send(text) {
    const trimmed = (text || '').trim()
    if (!trimmed || busy) return
    setInput('')
    const next = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setBusy(true)
    abortRef.current = new AbortController()

    let assistantBuffer = ''
    setMessages((m) => [...m, { role: 'assistant', content: '', streaming: true }])

    const result = await streamChat({
      messages: next,
      user,
      budget: b,
      signal: abortRef.current.signal,
      onToken: (tok) => {
        assistantBuffer += tok
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: assistantBuffer, streaming: true }
          return copy
        })
      },
    })

    if (!result.ok) {
      // Fallback: simulate brief "typing" then drop full reply.
      assistantBuffer = ''
      const full = result.text
      for (let i = 0; i < full.length; i += 4) {
        assistantBuffer = full.slice(0, i + 4)
        setMessages((m) => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'assistant', content: assistantBuffer, streaming: true }
          return copy
        })
        await sleep(18)
      }
    }

    setMessages((m) => {
      const copy = [...m]
      copy[copy.length - 1] = { role: 'assistant', content: result.text || assistantBuffer, mentions: extractMentions(result.text || assistantBuffer) }
      return copy
    })
    setOnline(result.ok)
    setBusy(false)
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col md:h-[calc(100dvh-6rem)]">
      {/* Perky header */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-line bg-bg-elevated p-4 shadow-e1">
        <div className="flex items-center gap-3">
          <PerkyOrb breathing />
          <div>
            <p className="font-display text-lg font-bold leading-tight">{t('perky.title')}</p>
            <p className="text-xs text-muted">{t('perky.subtitle')}</p>
          </div>
        </div>
        <span className={cn('hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase sm:inline-flex', online === false ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success')}>
          {online === false ? <><WifiOff className="h-3 w-3" /> {t('perky.offline')}</> : <><Wifi className="h-3 w-3" /> Online</>}
        </span>
      </div>

      {/* Chat scroll */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-line bg-bg-elevated p-4">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <Message key={i} m={m} user={user} onAdd={(id) => addToCart(user.id, id)} />
          ))}
        </AnimatePresence>
        {busy && <Typing />}
        <div ref={endRef} />
      </div>

      {/* Suggested prompts (above input) */}
      <div className="my-3 -mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
        {PROMPTS.map((k) => (
          <button
            key={k}
            disabled={busy}
            onClick={() => send(t(k))}
            className="whitespace-nowrap rounded-full border border-line bg-bg-elevated px-3 py-1.5 text-xs text-muted transition-colors hover:border-ember/50 hover:text-text disabled:opacity-50"
          >
            <Sparkles className="mr-1 inline h-3 w-3 text-gold" /> {t(k)}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input) }}
        className="flex items-center gap-2 rounded-md border border-line bg-bg-elevated-2 p-1.5 safe-b"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('perky.placeholder')}
          className="h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-faint"
        />
        <button type="submit" disabled={!input.trim() || busy} className="grid h-11 w-11 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow transition active:scale-95 disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

function PerkyOrb({ breathing }) {
  return (
    <div className="relative grid h-10 w-10 place-items-center">
      <div className={cn('absolute inset-0 rounded-full bg-grad-ember shadow-glow', breathing && 'animate-breathe')} />
      <Sparkles className="relative h-5 w-5 text-on-accent" />
    </div>
  )
}

function extractMentions(text) {
  if (!text) return []
  return PROVIDERS.filter((p) => text.toLowerCase().includes(p.name.toLowerCase()))
}

function Message({ m, user, onAdd }) {
  const isUser = m.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className={cn('mb-3 flex gap-2.5', isUser && 'flex-row-reverse')}
    >
      {!isUser && <PerkyOrb />}
      <div className={cn('max-w-[78%] space-y-2', isUser && 'items-end')}>
        <div className={cn(
          'whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed shadow-e1',
          isUser
            ? 'rounded-br-sm bg-grad-ember text-on-accent'
            : 'rounded-bl-sm border border-line bg-bg-elevated text-text',
        )}>
          {renderRich(m.content)}
          {m.streaming && <span className="ml-0.5 inline-block h-3 w-1.5 -translate-y-px animate-pulsedot rounded-sm bg-current align-middle" />}
        </div>
        {m.mentions?.length > 0 && (
          <div className="space-y-1.5">
            {m.mentions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => nav(`/employee/benefits/${p.id}`)}
                className="flex w-full items-center gap-2.5 overflow-hidden rounded-md border border-line bg-bg-elevated-2 text-left transition-colors hover:border-ember/40"
              >
                <BenefitCardMedia
                  category={p.category}
                  poster={categoryPoster(p.category)}
                  size="thumb"
                  showChips={false}
                  className="rounded-l-md"
                />
                <div className="min-w-0 flex-1 py-2">
                  <p className="truncate text-xs font-semibold">{p.name}</p>
                  <p className="text-[0.65rem] text-faint">{p.blurb}</p>
                </div>
                <span className="mr-2 rounded-full bg-ember/15 px-2 py-0.5 text-[0.65rem] font-semibold tabular-nums text-ember">{formatALL(p.cost)} LEK</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Minimal **bold** rendering.
function renderRich(text = '') {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**')
    ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
    : <span key={i}>{p}</span>))
}

function Typing() {
  return (
    <div className="mb-3 flex items-center gap-2">
      <PerkyOrb />
      <div className="flex items-center gap-1.5 rounded-lg rounded-bl-sm border border-line bg-bg-elevated px-3 py-2.5">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-ember" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>
    </div>
  )
}
