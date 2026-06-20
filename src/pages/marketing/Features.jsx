import { Link } from 'react-router-dom'
import {
  Wallet, Compass, Sparkles, CheckCircle2, Gamepad2, BarChart3,
  MapPin, Users, Building2, Store, ShieldCheck, Bell, Heart,
  Dumbbell, Plane, GraduationCap, Utensils, ArrowRight,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, Section, SectionHeading, Reveal, CtaBand } from '@/components/site/Site'

const CORE = [
  { icon: Wallet, title: 'Flexible benefit budgets', body: 'HR funds a yearly wallet per employee. No reimbursements, no spreadsheets — just a balance people can spend on what they love.' },
  { icon: Compass, title: 'Curated marketplace', body: 'A hand-picked catalog of local Albanian partners across wellness, food, sport, travel, learning and more — all in one beautiful place.' },
  { icon: Sparkles, title: 'Perky AI concierge', body: 'A conversational assistant that matches benefits to each person’s lifestyle and remaining budget, and answers questions instantly.' },
  { icon: CheckCircle2, title: 'One-tap approvals', body: 'Requests flow straight to HR, get approved in a tap, and the benefit goes live immediately — with a clean audit trail.' },
  { icon: Gamepad2, title: 'Games & rewards', body: 'Streaks, scratch cards and spin-to-win turn staying healthy and engaged into extra budget. Benefits that feel like a gift.' },
  { icon: BarChart3, title: 'Insightful analytics', body: 'See exactly what your people love, spend by category, and engagement over time — the data HR has always wanted.' },
  { icon: MapPin, title: 'Smart Deals Engine', body: 'AI ranks nearby partners by how well they match your team’s tastes, so you discover the right local deals automatically.' },
  { icon: ShieldCheck, title: 'Policy & controls', body: 'Per-department budgets, category rules and approval policies keep finance in control without slowing anyone down.' },
  { icon: Bell, title: 'Timely nudges', body: 'Seasonal offers, approval updates and streak reminders keep employees engaged — never spammy, always opt-in.' },
]

const CATEGORIES = [
  { icon: Heart, label: 'Wellness', color: 'var(--cat-wellness)' },
  { icon: Utensils, label: 'Food', color: 'var(--cat-food)' },
  { icon: Dumbbell, label: 'Sport', color: 'var(--cat-sport)' },
  { icon: Plane, label: 'Travel', color: 'var(--cat-travel)' },
  { icon: GraduationCap, label: 'Learning', color: 'var(--cat-learning)' },
  { icon: Sparkles, label: 'Self-care', color: 'var(--cat-selfcare)' },
]

const PERSONAS = [
  { icon: Users, title: 'For Employees', body: 'Your benefits, your call. Spend your budget on what actually matters — and earn more through streaks and games.', accent: 'var(--ember)' },
  { icon: Building2, title: 'For Companies', body: 'See what your people love, control budgets per department, and discover new local partners with the AI Deals Engine.', accent: 'var(--gold)' },
  { icon: Store, title: 'For Providers', body: 'Reach engaged employees across Albania. Get matched to the companies whose teams want exactly what you offer.', accent: 'var(--cat-travel)' },
]

export default function Features() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Features"
        title="Everything benefits"
        accent="should have been."
        subtitle="PERX turns a company’s budget into experiences employees actually love — powered by a curated marketplace, an AI concierge, and a little bit of play."
      >
        <Button as={Link} to="/login" size="lg">Enter PERX <ArrowRight className="h-4 w-4" /></Button>
      </PageHero>

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CORE.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07}>
              <div className="group h-full rounded-lg border border-line bg-bg-elevated p-6 shadow-e2 transition-all hover:-translate-y-1 hover:border-ember/40">
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="py-12">
        <SectionHeading
          eyebrow="One marketplace"
          title="Benefits across every part of life"
          subtitle="Category accents you’ll recognise from pins, chips and charts throughout the product."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={(i % 6) * 0.05}>
              <div className="flex h-full flex-col items-center gap-3 rounded-lg border border-line bg-bg-elevated p-5 text-center shadow-e2">
                <span className="grid h-12 w-12 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.color} 16%, transparent)`, color: c.color }}>
                  <c.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium">{c.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Built for everyone" title="One platform, three points of view" />
        <div className="grid gap-4 md:grid-cols-3">
          {PERSONAS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1}>
              <div className="relative h-full overflow-hidden rounded-xl border border-line bg-bg-elevated p-7 shadow-e2">
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl" style={{ background: c.accent, opacity: 0.12 }} />
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.accent} 16%, transparent)`, color: c.accent }}>
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="font-display text-xl font-bold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="See it for yourself in eight seconds"
        body="Sign in with a demo account and explore the full PERX experience — marketplace, Perky AI, games and the admin Deals Engine."
      />
    </SitePage>
  )
}
