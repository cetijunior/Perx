import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, MessageSquare, Send, CheckCircle2, Building2, Store, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { SitePage, PageHero, Reveal } from '@/components/site/Site'
import { ContentBand, ContactChannelCard } from '@/components/site/MarketingBlocks'
import { cn } from '@/lib/utils'

const inputCls = 'h-12 w-full rounded-md border border-line bg-bg-elevated-2 px-4 text-sm text-text outline-none transition-colors placeholder:text-faint focus:border-ember focus:ring-2 focus:ring-ember/40'

export default function Contact() {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [topic, setTopic] = useState(1)
  const channelIcons = [Mail, MapPin, MessageSquare]
  const CHANNELS = t('contact.channels', { returnObjects: true }).map((item, i) => ({ ...item, icon: channelIcons[i] }))
  const topicIcons = [Users, Building2, Store]
  const TOPICS = t('contact.topics', { returnObjects: true }).map((label, i) => ({ icon: topicIcons[i], label }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <SitePage>
      <PageHero
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        accent={t('contact.accent')}
        subtitle={t('contact.subtitle')}
      />

      <ContentBand className="!py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <Reveal>
            <div className="grid gap-3">
              {CHANNELS.map((c) => (
                <ContactChannelCard key={c.title} icon={c.icon} title={c.title} body={c.body} note={c.note} />
              ))}
              <div className="mkt-card relative overflow-hidden p-5" style={{ '--mkt-accent': 'rgb(var(--ember))' }}>
                <div className="pointer-events-none absolute inset-0 mkt-dot-grid opacity-15" aria-hidden />
                <p className="relative text-sm leading-relaxed text-muted">
                  {t('contact.demoNotePrefix')} <span className="font-medium text-text">JunctionX Tirana 2026</span> {t('contact.demoNoteSuffix')}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mkt-card relative overflow-hidden p-7 sm:p-8">
              <div className="pointer-events-none absolute -top-16 right-0 h-48 w-48 rounded-full bg-ember/10 blur-[90px]" />
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative flex flex-col items-center justify-center py-16 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-ember/15 text-ember ring-1 ring-ember/30"><CheckCircle2 className="h-7 w-7" /></span>
                  <h3 className="mt-5 font-display text-xl font-bold">{t('contact.sentTitle')}</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted">{t('contact.sentBody')}</p>
                  <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>{t('contact.sendAnother')}</Button>
                </motion.div>
              ) : (
                <form className="relative space-y-5" onSubmit={submit}>
                  <div>
                    <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('contact.topicLabel')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TOPICS.map((tp, i) => (
                        <button
                          type="button"
                          key={tp.label}
                          onClick={() => setTopic(i)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-md border px-2 py-3 text-center text-xs transition-colors',
                            topic === i ? 'border-ember/50 bg-ember/10 text-text' : 'border-line bg-bg-elevated-2 text-muted hover:text-text',
                          )}
                        >
                          <tp.icon className="h-4 w-4" />
                          {tp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('contact.name')}</label>
                      <input required className={inputCls} placeholder={t('contact.namePlaceholder')} />
                    </div>
                    <div>
                      <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('contact.email')}</label>
                      <input required type="email" className={inputCls} placeholder="you@company.al" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('contact.company')} <span className="text-faint/70">{t('contact.optional')}</span></label>
                    <input className={inputCls} placeholder={t('contact.companyPlaceholder')} />
                  </div>
                  <div>
                    <label className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('contact.message')}</label>
                    <textarea required rows={4} className={cn(inputCls, 'h-auto resize-none py-3')} placeholder={t('contact.messagePlaceholder')} />
                  </div>
                  <Button type="submit" size="lg" className="w-full">{t('contact.submit')} <Send className="h-4 w-4" /></Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </ContentBand>
    </SitePage>
  )
}
