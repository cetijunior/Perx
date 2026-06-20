import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, Section, SectionHeading, Reveal, CtaBand } from '@/components/site/Site'

const PLANS = [
  {
    name: 'Starter',
    price: '€0',
    cadence: 'forever',
    tagline: 'For small teams trying benefits the modern way.',
    cta: 'Start free',
    features: [
      'Up to 15 employees',
      'Full benefits marketplace',
      'Perky AI concierge',
      'One-tap approvals',
      'Basic analytics',
    ],
  },
  {
    name: 'Growth',
    price: '€3',
    cadence: 'per employee / mo',
    tagline: 'For growing companies that want control and insight.',
    cta: 'Choose Growth',
    featured: true,
    features: [
      'Unlimited employees',
      'Per-department budgets',
      'Games & rewards engine',
      'Advanced analytics & exports',
      'AI Deals Engine discovery',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'let’s talk',
    tagline: 'For larger organisations with bespoke policy needs.',
    cta: 'Contact sales',
    features: [
      'Everything in Growth',
      'Custom approval policies',
      'SSO & advanced security',
      'Dedicated success manager',
      'Custom partner onboarding',
      'SLA & data residency',
    ],
  },
]

const FAQ = [
  { q: 'How does the budget work?', a: 'Companies fund a yearly wallet per employee. Employees spend it across the marketplace — no reimbursements, no vouchers, no leftover allowance lost to paperwork.' },
  { q: 'Do you charge providers?', a: 'Local partners join free and only benefit from reaching engaged employees. We never charge employees a cent — the company funds everything.' },
  { q: 'Can we set per-department budgets?', a: 'Yes. On Growth and Enterprise, finance can set budgets and approval policies per department, with a clean audit trail on every request.' },
  { q: 'Is there a contract?', a: 'Starter is free forever. Paid plans are monthly with no lock-in — scale up or down as your team changes.' },
]

export default function Pricing() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Pricing"
        title="Simple pricing,"
        accent="generous benefits."
        subtitle="Pay for the platform, not the paperwork. Every plan includes the full marketplace and Perky AI — you choose the controls and scale."
      />

      <Section className="py-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div className={`relative flex h-full flex-col overflow-hidden rounded-xl border p-7 shadow-e2 ${p.featured ? 'border-ember/50 bg-bg-elevated' : 'border-line bg-bg-elevated'}`}>
                {p.featured && (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-70" />
                    <span className="absolute right-5 top-5 rounded-full bg-grad-ember px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-on-accent shadow-glow">Popular</span>
                  </>
                )}
                <div className="relative">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold tnum">{p.price}</span>
                    <span className="text-sm text-faint">{p.cadence}</span>
                  </div>
                  <Button
                    as={Link}
                    to={p.name === 'Enterprise' ? '/contact' : '/login'}
                    variant={p.featured ? 'primary' : 'secondary'}
                    size="lg"
                    className="mt-6 w-full"
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <ul className="mt-7 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                        <span className="text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Questions" title="Pricing, answered" />
        <div className="mx-auto max-w-2xl space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={(i % 2) * 0.06}>
              <div className="rounded-lg border border-line bg-bg-elevated p-6 shadow-e2">
                <h3 className="text-base font-semibold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Ready to make benefits feel like a gift?"
        body="Start free in minutes, or talk to us about rolling PERX out across your whole company."
      />
    </SitePage>
  )
}
