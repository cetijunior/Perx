import { PROVIDERS } from './catalog'

export const OLLAMA_URL = 'http://localhost:11434/api/chat'
export const OLLAMA_MODEL = 'gemma2:2b'

export function buildSystemPrompt(user, budget) {
  const catalog = PROVIDERS.map((p) => `- ${p.name} (${p.category}, ${p.cost} ALL${p.cadence === 'month' ? '/mo' : ''}): ${p.blurb}`).join('\n')
  return `You are Perky, a friendly Albanian benefits concierge for PERX. Help employees discover benefits that match their lifestyle and budget. Keep responses short (2-3 sentences), warm, and useful. Mention specific offers from the catalog when relevant.

User: ${user?.name} (${user?.department})
Budget remaining: ${budget?.remaining || 0} ALL of ${budget?.total || 0} ALL

PERX catalog:
${catalog}

Respond in the same language the user wrote in (Albanian or English).`
}

// Scripted fallback so the demo never feels broken when Ollama is down.
const FALLBACK_PATTERNS = [
  {
    match: /(relax|wellness|spa|massage|mirëq|relaks|gërvi)/i,
    reply: (b) => `For a real reset I'd queue up **YogaFlow Studio** (3,000 ALL/mo) — unlimited mornings — paired with an **Aqua Spa Tirana** day-pass (5,000 ALL). Both fit comfortably in your ${b?.remaining?.toLocaleString() || ''} ALL budget. Want me to add them to your cart?`,
  },
  {
    match: /(gym|sport|fitness|workout|palestr|stërvit)/i,
    reply: () => `**FitLife Gym Tirana** is the strongest pick — full kit, sauna, and classes for 3,500 ALL/mo (rated 4.7★ by our crew). If you want something outdoors too, **CycleCity** at 1,800 ALL/mo pairs nicely.`,
  },
  {
    match: /(food|eat|ushqim|lunch|drekë|coffee|kafe)/i,
    reply: () => `Two safe wins: **Green Salad Bar** at 1,200 ALL/mo for office-delivered bowls, plus **Kombi Coffee** (800 ALL/mo) for daily fuel across 6 Tirana spots. Add **Burger Lab** as a 1,500 ALL cheat-day voucher when you've earned it.`,
  },
  {
    match: /(travel|udhët|trip|weekend|fundjava|coast|det)/i,
    reply: () => `Yes — **Albtransport Travel** unlocks discounted weekend trips to Sarandë and Vlorë. For something quieter, **Lumë Retreat** (6,500 ALL) is a real mountain reset. Both are popular with engineering — book a Friday off and go.`,
  },
  {
    match: /(learn|book|read|libër|kurs|gjuh|language|english|german)/i,
    reply: () => `**Tirana Language School** runs small evening groups in EN/DE/IT (8,000 ALL). Pair it with **BookNook Albania** (900 ALL/mo) for unlimited e-books — that combo is loved by the marketing team.`,
  },
  {
    match: /(health|doctor|check|mjek|shëndet)/i,
    reply: () => `**MediCheck Clinic** does the annual screening + blood panel for 2,500 ALL — rated 4.9★ and people don't put it off when it's covered. Smart use of budget early in the year.`,
  },
]

const GENERIC = (b) => `I can help you find benefits that fit your budget (${b?.remaining?.toLocaleString() || ''} ALL left). Try asking me about something relaxing, a gym, food deals, or weekend trips — I'll match you with the right partners.`

export function fallbackReply(message, budget) {
  for (const p of FALLBACK_PATTERNS) {
    if (p.match.test(message)) return p.reply(budget)
  }
  return GENERIC(budget)
}

export async function streamChat({ messages, user, budget, signal, onToken }) {
  const sys = buildSystemPrompt(user, budget)
  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'system', content: sys }, ...messages],
        stream: true,
        options: { temperature: 0.7, num_predict: 220 },
      }),
    })
    if (!res.ok || !res.body) throw new Error('Ollama unreachable')
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let full = ''
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const json = JSON.parse(line)
          const tok = json.message?.content
          if (tok) { full += tok; onToken?.(tok) }
        } catch {}
      }
    }
    return { ok: true, text: full }
  } catch (err) {
    return { ok: false, text: fallbackReply(messages[messages.length - 1]?.content || '', budget) }
  }
}
