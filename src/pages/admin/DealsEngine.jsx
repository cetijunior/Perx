import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar, Sparkles, MapPin, TrendingUp, Building2, Check, Loader2, SlidersHorizontal } from 'lucide-react'
import { useStore } from '@/lib/store'
import { PROVIDERS, CATEGORIES } from '@/lib/catalog'
import { teamCategoryWeights } from '@/lib/recommend'
import { cn, formatALL, sleep } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle } from '@/components/ui/Misc'
import { LogoChip } from '@/components/ui/Avatar'
import { CategoryChip } from '@/components/ui/Badge'
import TiranaMap from '@/components/admin/TiranaMap'

// Distance from office at map center (50,50). Range 0..1 (normalized vs ~70 max).
const distFromOffice = (p) => Math.hypot(p.map.x - 50, p.map.y - 50) / 70

// Generate a few additional fake "discovered" partners — visually fill the map for the demo.
const EXTRA_DISCOVERED = [
  { id: 'newpartner-1', name: 'Bllok Ramen', category: 'food', cost: 1700, cadence: 'once', rating: 4.6, blurb: 'Fresh ramen bar, perfect lunch run.', map: { x: 64, y: 64 } },
  { id: 'newpartner-2', name: 'Skyline Padel', category: 'sport', cost: 2400, cadence: 'month', rating: 4.7, blurb: 'Padel courts on the roof.', map: { x: 26, y: 50 } },
  { id: 'newpartner-3', name: 'Calm Studio', category: 'wellness', cost: 2800, cadence: 'month', rating: 4.5, blurb: 'Sound baths & breathwork.', map: { x: 78, y: 22 } },
  { id: 'newpartner-4', name: 'CodeAcademy AL', category: 'learning', cost: 5500, cadence: 'course', rating: 4.8, blurb: 'Evening web-dev bootcamps.', map: { x: 18, y: 78 } },
]

export default function DealsEngine() {
  const { t } = useTranslation()
  useStore()

  const [scanning, setScanning] = useState(false)
  const [discovered, setDiscovered] = useState([])
  const [invited, setInvited] = useState({})
  const [filterCat, setFilterCat] = useState('all')
  const [radius, setRadius] = useState(100)
  const [minScore, setMinScore] = useState(50)
  const [selected, setSelected] = useState(null)

  // Compute match score using team preference weights.
  const ranked = useMemo(() => {
    const weights = teamCategoryWeights()
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1
    const base = [...PROVIDERS, ...discovered]
    return base.map((p) => {
      const w = (weights[p.category] || 0) / totalWeight
      const ratingPart = (p.rating - 4) * 10
      const distPart = (1 - distFromOffice(p)) * 18
      const popPart = w * 100 * 0.55
      const score = Math.max(15, Math.min(99, Math.round(40 + popPart + ratingPart + distPart)))
      const usage = Math.round(Math.min(95, score * 0.8 + Math.random() * 6))
      return { ...p, score, usage, distance: Math.round(distFromOffice(p) * 4.2 * 10) / 10 }
    }).sort((a, b) => b.score - a.score)
  }, [discovered])

  const visible = ranked.filter((p) => (filterCat === 'all' || p.category === filterCat) && p.score >= minScore && distFromOffice(p) * 100 <= radius)

  async function autoDiscover() {
    setScanning(true)
    await sleep(2200)
    setDiscovered((d) => {
      const ids = new Set(d.map((x) => x.id))
      return [...d, ...EXTRA_DISCOVERED.filter((x) => !ids.has(x.id))]
    })
    setScanning(false)
  }

  function invite(id) { setInvited((v) => ({ ...v, [id]: true })) }
  const selectedProvider = ranked.find((p) => p.id === selected)

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader
        title={<span className="inline-flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-md bg-grad-ember text-on-accent shadow-glow"><Radar className="h-5 w-5" /></span> {t('admin.dealsTitle')}</span>}
        subtitle={t('admin.dealsSubtitle')}
        action={
          <button onClick={autoDiscover} disabled={scanning} className="inline-flex items-center gap-2 rounded-md bg-grad-ember px-4 py-2.5 text-sm font-semibold text-on-accent shadow-glow transition active:scale-95 disabled:opacity-60">
            {scanning ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('admin.scanning')}</> : <><Sparkles className="h-4 w-4" /> {t('admin.autoDiscover')}</>}
          </button>
        }
      />

      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Map panel */}
        <div className="space-y-3">
          <TiranaMap pins={visible} selectedId={selected} onSelect={setSelected} scanning={scanning} officeLabel={t('admin.yourOffice')} />

          {/* Filters */}
          <div className="rounded-xl border border-line bg-bg-elevated p-4">
            <SectionTitle action={<SlidersHorizontal className="h-4 w-4 text-faint" />}>Filters</SectionTitle>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <FilterPill active={filterCat === 'all'} onClick={() => setFilterCat('all')}>All</FilterPill>
              {CATEGORIES.map((c) => (
                <FilterPill key={c.id} active={filterCat === c.id} onClick={() => setFilterCat(c.id)} color={`var(--cat-${c.color})`}>{c.label}</FilterPill>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <RangeRow label={`${t('admin.radius')}: ${radius}%`} min={20} max={100} value={radius} onChange={setRadius} />
              <RangeRow label={`${t('admin.minScore')}: ${minScore}`} min={0} max={95} value={minScore} onChange={setMinScore} />
            </div>
          </div>

          <AnimatePresence>
            {selectedProvider && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-xl border border-ember/40 bg-bg-elevated p-4 shadow-glow">
                <div className="flex items-start gap-3">
                  <LogoChip name={selectedProvider.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{selectedProvider.name}</p>
                      <CategoryChip category={selectedProvider.category} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{selectedProvider.blurb}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className="text-faint"><MapPin className="-mt-0.5 mr-1 inline h-3 w-3" /> {selectedProvider.distance} km</span>
                      <span className="font-semibold text-gold tabular-nums">{selectedProvider.score}% match</span>
                      <span className="font-semibold text-ember tabular-nums">{formatALL(selectedProvider.cost)} LEK</span>
                    </div>
                  </div>
                  <button onClick={() => invite(selectedProvider.id)} disabled={invited[selectedProvider.id]} className={cn('rounded-md px-3 py-2 text-xs font-semibold transition active:scale-95', invited[selectedProvider.id] ? 'bg-success/15 text-success' : 'bg-grad-ember text-on-accent shadow-glow')}>
                    {invited[selectedProvider.id] ? <><Check className="-mt-0.5 mr-1 inline h-3 w-3" /> {t('admin.invited')}</> : t('admin.invite')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ranked list */}
        <div className="rounded-xl border border-line bg-bg-elevated p-4">
          <SectionTitle action={<span className="text-xs text-gold"><Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" /> AI</span>}>{t('admin.ranked')}</SectionTitle>
          <div className="-mr-1 max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {visible.length === 0 ? (
              <p className="rounded-md border border-dashed border-line bg-bg-elevated-2 p-5 text-center text-sm text-muted">No partners match these filters.</p>
            ) : visible.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-md border bg-bg-elevated-2 p-3 text-left transition-all active:scale-[0.99]',
                  selected === p.id ? 'border-ember/60 shadow-glow' : 'border-line hover:border-faint',
                )}
              >
                <LogoChip name={p.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[0.65rem] text-faint">
                    <CategoryChip category={p.category} withIcon={false} />
                    <span><MapPin className="-mt-0.5 mr-0.5 inline h-2.5 w-2.5" />{p.distance} km</span>
                    <span><TrendingUp className="-mt-0.5 mr-0.5 inline h-2.5 w-2.5" />{p.usage}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-base font-bold tabular-nums text-gold">{p.score}</div>
                  <p className="text-[0.6rem] uppercase tracking-wide text-faint">{t('common.matchScore')}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FilterPill({ active, children, onClick, color }) {
  return (
    <button onClick={onClick} className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors', active ? 'border-ember/50 bg-ember/15 text-text' : 'border-line bg-bg-elevated-2 text-muted hover:text-text')}>
      {color && active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  )
}

function RangeRow({ label, min, max, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[0.7rem] uppercase tracking-wide text-faint">{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-1.5 w-full accent-ember" />
    </label>
  )
}
