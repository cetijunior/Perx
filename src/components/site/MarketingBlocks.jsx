import { cn } from '@/lib/utils'
import { earthTone } from '@/lib/earthTones'
import { Reveal, SectionHeading } from '@/components/site/Site'

/** Full-bleed section band — use below the hero, not inside it. */
export function ContentBand({ id, className, children, variant = 'default' }) {
  return (
    <section
      id={id}
      className={cn(
        'relative border-y border-line/50',
        variant === 'alt' && 'mkt-band-alt',
        variant === 'contrast' && 'mkt-band-contrast',
        variant === 'default' && 'mkt-band',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 mkt-dot-grid opacity-[0.35]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">{children}</div>
    </section>
  )
}

export function EditorialHeading({ eyebrow, title, subtitle, align = 'center', className }) {
  return (
    <SectionHeading
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      center={align === 'center'}
      className={cn('mkt-editorial-heading', align === 'left' && '!mx-0 !max-w-none !text-left', className)}
    />
  )
}

export function StepCard({ step, icon: Icon, title, body, accent = 'var(--ember)' }) {
  return (
    <div className="mkt-card group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-e3" style={{ '--mkt-accent': accent }}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-bg-elevated-2 text-ember ring-1 ring-line transition-colors group-hover:bg-ember/10">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-display text-3xl font-bold leading-none text-line/80">{String(step).padStart(2, '0')}</span>
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  )
}

export function EarthCategoryTile({ icon: Icon, label, category }) {
  const tone = earthTone(category)
  return (
    <div
      className="mkt-earth-tile group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-xl border border-line/70 bg-bg-elevated p-5 shadow-e2 transition-all duration-300 hover:-translate-y-1 hover:shadow-e3"
      style={{ '--earth-tone': tone }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: tone }} />
      <span
        className="relative grid h-12 w-12 place-items-center rounded-lg ring-1 ring-line/60"
        style={{ background: `color-mix(in srgb, ${tone} 18%, rgb(var(--bg-elevated)))`, color: tone }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="relative">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-2 block h-0.5 w-10 rounded-full" style={{ background: tone }} />
      </div>
    </div>
  )
}

export function HighlightRow({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-3 rounded-lg border border-line/60 bg-bg-elevated/60 p-4 backdrop-blur-sm">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ember/12 text-ember">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  )
}

export function PersonaCard({ icon: Icon, title, body, accent = 'var(--ember)', delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="mkt-card relative h-full overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-e3" style={{ '--mkt-accent': accent }}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: accent, opacity: 0.12 }} />
        <span
          className="relative mb-5 grid h-12 w-12 place-items-center rounded-lg ring-1 ring-line/50"
          style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="relative font-display text-xl font-bold">{title}</h3>
        <p className="relative mt-2 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </Reveal>
  )
}

export function FeatureTile({ icon: Icon, title, body, index = 0 }) {
  return (
    <Reveal delay={(index % 3) * 0.07}>
      <div className="mkt-card group h-full p-6 transition-all hover:-translate-y-1 hover:shadow-e3">
        <span className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-bg-elevated-2 text-ember ring-1 ring-line group-hover:bg-ember/10">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </Reveal>
  )
}

export function StatStrip({ stats }) {
  return (
    <Reveal>
      <div className="mkt-stat-strip overflow-hidden rounded-2xl border border-line shadow-e2">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-line/60 bg-bg-elevated px-5 py-8 text-center [&:not(:last-child)]:border-b sm:[&:not(:last-child)]:border-b-0 sm:[&:not(:last-child)]:border-r">
              <div className="font-display text-3xl font-bold tnum text-ember sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-faint">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

export function ControlPanel({ eyebrow, title, body, items }) {
  return (
    <div className="mkt-split-panel overflow-hidden rounded-2xl border border-line shadow-e2">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="border-b border-line bg-bg-elevated-2/80 p-8 sm:p-10 lg:border-b-0 lg:border-r">
          {eyebrow && <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-ember">{eyebrow}</p>}
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          {body && <p className="mt-4 leading-relaxed text-muted">{body}</p>}
        </div>
        <div className="grid gap-3 bg-bg-elevated p-6 sm:p-8">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="mkt-card flex gap-4 p-5" style={{ '--mkt-accent': 'rgb(var(--ember))' }}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ember/10 text-ember ring-1 ring-ember/20">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ContactChannelCard({ icon: Icon, title, body, note }) {
  return (
    <div className="mkt-card flex gap-4 p-5" style={{ '--mkt-accent': 'rgb(var(--ember))' }}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-bg-elevated-2 text-ember ring-1 ring-line">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-text">{body}</p>
        {note && <p className="mt-0.5 text-xs text-faint">{note}</p>}
      </div>
    </div>
  )
}
