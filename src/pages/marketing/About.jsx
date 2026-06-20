import { Mountain, Flame, Gem, Heart, Compass, Users } from 'lucide-react'
import { SitePage, PageHero, Section, SectionHeading, Reveal, CtaBand } from '@/components/site/Site'

const STATS = [
  { value: '12+', label: 'Local partners onboard' },
  { value: '92%', label: 'Average budget used' },
  { value: '4.8★', label: 'Employee satisfaction' },
  { value: '6', label: 'Benefit categories' },
]

const VALUES = [
  { icon: Heart, title: 'People first', body: 'Benefits should feel like a gift, not a form. Every decision starts with the person opening the app, not the spreadsheet behind it.' },
  { icon: Gem, title: 'Quiet premium', body: 'Calm, confident and expensive-looking — never corporate-cold. We sweat the radius, the glow and the curve of every motion.' },
  { icon: Compass, title: 'Local by design', body: 'We champion Albanian providers and the experiences that make life here good. Discovery is rooted in the streets of Tirana.' },
  { icon: Users, title: 'Two-sided by nature', body: 'Employees, companies and providers all win at once — or the marketplace doesn’t work. We build for the whole loop.' },
]

const BRAND = [
  { icon: Mountain, title: 'Stone & dusk', body: 'The neutral base is pulled from the Albanian Alps — deep slate, near-black and cool greys at last light.' },
  { icon: Flame, title: 'Ember', body: 'A sophisticated, slightly desaturated descendant of flag red. Heritage, signalled — never shouted.' },
  { icon: Gem, title: 'Aged gold', body: 'The double-headed eagle rendered as a premium metallic accent for rewards, streaks and wins.' },
]

const TIMELINE = [
  { when: '2026 · Q1', title: 'The idea', body: 'Albanian teams deserved benefits that felt modern. We sketched a two-sided marketplace built dark-first and mobile-first.' },
  { when: 'JunctionX', title: 'Built in 48 hours', body: 'PERX came to life for JunctionX Tirana 2026 as a TeamSystem challenge — a real product a judge could love in eight seconds.' },
  { when: 'Next', title: 'Beyond the demo', body: 'Deeper partner discovery, richer Perky recommendations, and the analytics every HR team has always wanted.' },
]

export default function About() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Our story"
        title="Benefits, reimagined for"
        accent="Tirana at dusk."
        subtitle="PERX is a two-sided employee benefits marketplace for Albania — premium fintech meets warm concierge. We turn budgets into experiences people actually love."
      />

      <Section className="py-10">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-e2 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-bg-elevated px-5 py-8 text-center">
                <div className="font-display text-3xl font-bold tnum sm:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs text-faint">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">Our mission</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Make benefits feel like a gift.</h2>
            <div className="mt-5 space-y-4 text-muted">
              <p>Most benefits programs are a maze of reimbursements, vouchers and forgotten allowances. The money is there — but the experience is cold, and half the budget goes unused.</p>
              <p>PERX flips that. Companies fund a wallet, employees explore a curated marketplace of local partners, and an AI concierge named Perky helps everyone spend wisely. A little play — streaks, scratch cards, spins — turns staying engaged into extra budget.</p>
              <p>The result reads like <em>Tirana at dusk</em>: dark, warm light sources, gold and ember glows on stone. Albanian identity, without the cliché.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-xl border border-line bg-bg-elevated p-7 shadow-e2">
              <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-70" />
              <div className="relative grid gap-4">
                {BRAND.map((b) => (
                  <div key={b.title} className="flex gap-4 rounded-lg border border-line bg-bg-elevated/70 p-4 backdrop-blur">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow"><b.icon className="h-5 w-5" /></span>
                    <div>
                      <h3 className="text-sm font-semibold">{b.title}</h3>
                      <p className="mt-1 text-sm text-muted">{b.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="What we believe" title="The principles behind every screen" />
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={(i % 2) * 0.08}>
              <div className="flex h-full gap-4 rounded-lg border border-line bg-bg-elevated p-6 shadow-e2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-bg-elevated-2 text-ember"><v.icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-base font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{v.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="The journey" title="From sketch to shippable" />
        <div className="mx-auto max-w-2xl">
          {TIMELINE.map((tl, i) => (
            <Reveal key={tl.title} delay={i * 0.08}>
              <div className="relative flex gap-5 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-grad-ember text-xs font-bold text-on-accent shadow-glow">{i + 1}</span>
                  {i < TIMELINE.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                </div>
                <div className="pb-2">
                  <p className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-faint">{tl.when}</p>
                  <h3 className="mt-1 text-base font-semibold">{tl.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{tl.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Want to bring PERX to your team?"
        body="We’d love to show you what modern benefits feel like. Reach out and we’ll set you up."
      />
    </SitePage>
  )
}
