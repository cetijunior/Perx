import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, X, Send, Check, Sparkles } from 'lucide-react'
import { useCurrentUser, useStore, getState, addToCart, removeFromCart, requestApproval } from '@/lib/store'
import { PROVIDERS, CATEGORIES, PACKAGES, packageTotal, providerById } from '@/lib/catalog'
import { formatALL, cn, sleep } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle } from '@/components/ui/Misc'
import { CategoryChip } from '@/components/ui/Badge'
import BenefitCard from '@/components/employee/BenefitCard'
import PackageCard from '@/components/employee/PackageCard'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { providerVideoSources, categoryPoster } from '@/lib/videos'
import { getProviderBySlug } from '@/lib/store'
import Button from '@/components/ui/Button'

export default function Benefits() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const emp = getState().employees[user.id]
  const [cat, setCat] = useState('all')
  const [max, setMax] = useState(10000)
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(() => {
    return PROVIDERS.filter((p) => (cat === 'all' || p.category === cat) && p.cost <= max)
  }, [cat, max])

  const inCart = emp.cart
  const cartItems = inCart.map(providerById).filter(Boolean)
  const cartTotal = cartItems.reduce((s, p) => s + p.cost, 0)

  return (
    <motion.div variants={stagger(0.05)} initial="hidden" animate="show">
      <PageHeader
        title={t('benefits.title')}
        subtitle={t('benefits.subtitle')}
        action={
          <Button variant="secondary" size="md" onClick={() => setSheetOpen(true)} className="relative">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">{t('benefits.cart')}</span>
            {inCart.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-grad-ember px-1 text-[0.65rem] font-bold text-on-accent">{inCart.length}</span>
            )}
          </Button>
        }
      />

      {/* Filters */}
      <motion.div variants={fadeUp} className="mb-5 space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:px-0 md:flex-wrap">
          <Pill active={cat === 'all'} onClick={() => setCat('all')}>{t('benefits.all')}</Pill>
          {CATEGORIES.map((c) => (
            <Pill key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} color={c.color}>{c.label}</Pill>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-md border border-line bg-bg-elevated px-4 py-3">
          <span className="text-xs uppercase tracking-wide text-faint">{t('benefits.budgetRange')}</span>
          <input type="range" min={500} max={10000} step={500} value={max} onChange={(e) => setMax(+e.target.value)} className="flex-1 accent-ember" />
          <span className="w-24 text-right text-sm font-semibold tabular-nums text-ember">≤ {formatALL(max)}</span>
        </div>
      </motion.div>

      {/* Packages */}
      <motion.section variants={fadeUp} className="mb-7">
        <SectionTitle action={<span className="flex items-center gap-1 text-xs text-gold"><Sparkles className="h-3.5 w-3.5" /> Curated</span>}>{t('benefits.packages')}</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {PACKAGES.map((pkg) => {
            const total = packageTotal(pkg)
            const items = pkg.items.map(providerById)
            const allInCart = pkg.items.every((id) => inCart.includes(id))
            return (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                items={items}
                total={total}
                allInCart={allInCart}
                onAdd={() => pkg.items.forEach((id) => addToCart(user.id, id))}
              />
            )
          })}
        </div>
      </motion.section>

      {/* Grid */}
      <motion.section variants={fadeUp}>
        <SectionTitle>{t('benefits.all')} <span className="ml-2 text-xs text-faint">({filtered.length})</span></SectionTitle>
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-bg-elevated/40 p-8 text-center text-sm text-muted">{t('benefits.empty')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <BenefitCard key={p.id} provider={p} inCart={inCart.includes(p.id)} onAdd={(id) => addToCart(user.id, id)} />
            ))}
          </div>
        )}
      </motion.section>

      {/* Cart sheet */}
      <CartSheet open={sheetOpen} onClose={() => setSheetOpen(false)} items={cartItems} total={cartTotal} userId={user.id} t={t} />

      {/* Floating cart FAB on mobile */}
      {inCart.length > 0 && !sheetOpen && (
        <button onClick={() => setSheetOpen(true)} className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full bg-grad-ember px-4 py-3 text-sm font-semibold text-on-accent shadow-glow md:hidden">
          <ShoppingBag className="h-4 w-4" /> {inCart.length} · {formatALL(cartTotal)} LEK
        </button>
      )}
    </motion.div>
  )
}

function Pill({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-ember bg-ember/15 text-ember'
          : 'border-line bg-bg-elevated text-muted hover:border-faint hover:text-text',
      )}
    >
      {color && active && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: `var(--cat-${color})` }} />}
      {children}
    </button>
  )
}

function CartSheet({ open, onClose, items, total, userId, t }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    setSending(true)
    await sleep(700)
    requestApproval(userId, items.map((i) => i.id))
    setSending(false); setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 1500)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/60" />
          <motion.aside
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-xl border-t border-line bg-bg-elevated shadow-e3 md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-none md:border-l md:border-t-0"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-sm font-semibold">{t('benefits.cart')}</p>
                <p className="text-xs text-faint">{items.length} item{items.length === 1 ? '' : 's'}</p>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md hover:bg-bg-elevated-2"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto px-5 py-4 md:max-h-none md:flex-1">
              {items.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">{t('benefits.cartEmpty')}</p>
              ) : items.map((p) => (
                <div key={p.id} className="flex items-center gap-3 border-b border-line/60 py-3 last:border-0">
                  <BenefitCardMedia
                    category={p.category}
                    sources={providerVideoSources(p)}
                    poster={getProviderBySlug(p.id)?.posterUrl || categoryPoster(p.category)}
                    size="thumb"
                    playOnHover={false}
                    showChips={false}
                    className="rounded-md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <div className="mt-0.5 flex items-center gap-2"><CategoryChip category={p.category} /></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-ember">{formatALL(p.cost)}</p>
                    <button onClick={() => removeFromCart(userId, p.id)} className="mt-0.5 text-[0.65rem] text-faint hover:text-danger">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-bg-elevated/80 p-5 backdrop-blur safe-b">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted">{t('benefits.total')}</span>
                <span className="font-display text-xl font-bold tabular-nums text-text">{formatALL(total)} <span className="text-xs text-faint">LEK</span></span>
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={items.length === 0 || sent}
                loading={sending}
                onClick={submit}
              >
                {sent ? <><Check className="h-4 w-4" /> {t('benefits.requested')}</> : <><Send className="h-4 w-4" /> {t('benefits.requestApproval')}</>}
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
