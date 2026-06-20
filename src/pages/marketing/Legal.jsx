import { useTranslation } from 'react-i18next'
import { SitePage, PageHero, Section } from '@/components/site/Site'

/**
 * Renders a legal document (privacy / terms) in the hero's essence:
 * dark surface, ember accents, a sticky table of contents on desktop.
 * `sections` = [{ id, heading, body: string[] }]
 */
export default function LegalLayout({ eyebrow, title, accent, updated, intro, sections }) {
  const { t } = useTranslation()
  return (
    <SitePage>
      <PageHero eyebrow={eyebrow} title={title} accent={accent} subtitle={intro} />

      <Section className="py-8">
        <p className="mx-auto max-w-3xl text-center text-xs text-faint">{t('legal.lastUpdated')}: {updated}</p>
      </Section>

      <Section className="pt-0">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-faint">{t('legal.onThisPage')}</p>
              <nav className="flex flex-col gap-1.5 border-l border-line">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="-ml-px border-l-2 border-transparent pl-3 text-sm text-muted transition-colors hover:border-ember hover:text-text">
                    {s.heading}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Document body */}
          <div className="min-w-0">
            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <h2 className="flex items-baseline gap-3 font-display text-xl font-bold tracking-tight sm:text-2xl">
                    <span className="text-sm font-bold text-line">{String(i + 1).padStart(2, '0')}</span>
                    {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-muted">
                    {s.body.map((p, j) =>
                      Array.isArray(p) ? (
                        <ul key={j} className="ml-1 space-y-2">
                          {p.map((li, k) => (
                            <li key={k} className="flex gap-2.5">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
                              <span>{li}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p key={j}>{p}</p>
                      )
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-lg border border-line bg-bg-elevated p-6 text-sm text-muted shadow-e2">
              {t('legal.questions')} {' '}
              <a href="mailto:privacy@perx.al" className="text-ember hover:underline">privacy@perx.al</a>.
            </div>
          </div>
        </div>
      </Section>
    </SitePage>
  )
}
