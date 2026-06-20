import { useState } from 'react'
import { Mail, MapPin, MessageSquare, Send, CheckCircle2, Building2, Store, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, Section, Reveal } from '@/components/site/Site'
import { cn } from '@/lib/utils'

const CHANNELS = [
  { icon: Mail, title: 'Email us', body: 'hello@perx.al', note: 'We reply within one business day.' },
  { icon: MapPin, title: 'Visit', body: 'Rruga e Kavajës, Tirana', note: 'Albania — by appointment.' },
  { icon: MessageSquare, title: 'Support', body: 'support@perx.al', note: 'For existing customers & partners.' },
]

const TOPICS = [
  { icon: Users, label: 'I’m an employee' },
  { icon: Building2, label: 'I represent a company' },
  { icon: Store, label: 'I’m a provider' },
]

const inputCls = 'h-12 w-full rounded-sm border border-line bg-bg-elevated-2 px-4 text-sm text-text outline-none transition-colors placeholder:text-faint focus:border-ember focus:ring-2 focus:ring-ember/40'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [topic, setTopic] = useState(TOPICS[1].label)

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <SitePage>
      <PageHero
        eyebrow="Contact"
        title="Let’s talk"
        accent="benefits."
        subtitle="Whether you’re an employee, a company or a local partner — we’d love to hear from you. Tell us what you need and we’ll take it from there."
      />

      <Section className="py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="grid gap-3">
              {CHANNELS.map((c) => (
                <div key={c.title} className="flex gap-4 rounded-lg border border-line bg-bg-elevated p-5 shadow-e2">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-bg-elevated-2 text-ember"><c.icon className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-sm font-semibold">{c.title}</h3>
                    <p className="mt-0.5 text-sm text-text">{c.body}</p>
                    <p className="mt-0.5 text-xs text-faint">{c.note}</p>
                  </div>
                </div>
              ))}
              <div className="relative mt-1 overflow-hidden rounded-lg border border-line bg-bg-elevated p-5 shadow-e2">
                <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-60" />
                <p className="relative text-sm text-muted">
                  Built for <span className="text-text">JunctionX Tirana 2026</span> — a TeamSystem challenge. PERX is a product demo by a small team who care about how benefits feel.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-xl border border-line bg-bg-elevated p-7 shadow-e2">
              <div className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-ember/10 blur-[90px]" />
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col items-center justify-center py-16 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-grad-ember text-on-accent shadow-glow"><CheckCircle2 className="h-7 w-7" /></span>
                  <h3 className="mt-5 font-display text-xl font-bold">Message sent</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted">Thanks for reaching out. We’ll get back to you within one business day.</p>
                  <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>Send another</Button>
                </motion.div>
              ) : (
                <form className="relative space-y-5" onSubmit={submit}>
                  <div>
                    <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">I am…</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TOPICS.map((tp) => (
                        <button
                          type="button"
                          key={tp.label}
                          onClick={() => setTopic(tp.label)}
                          className={cn('flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-center text-xs transition-colors', topic === tp.label ? 'border-ember/50 bg-ember/10 text-text' : 'border-line bg-bg-elevated-2 text-muted hover:text-text')}
                        >
                          <tp.icon className="h-4 w-4" />
                          {tp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">Name</label>
                      <input required className={inputCls} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">Email</label>
                      <input required type="email" className={inputCls} placeholder="you@company.al" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">Company <span className="text-faint/70">(optional)</span></label>
                    <input className={inputCls} placeholder="Company name" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">Message</label>
                    <textarea required rows={4} className={cn(inputCls, 'h-auto resize-none py-3')} placeholder="Tell us what you’re looking for…" />
                  </div>
                  <Button type="submit" size="lg" className="w-full">Send message <Send className="h-4 w-4" /></Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Section>
    </SitePage>
  )
}
