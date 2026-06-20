import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Heart, Download, Trophy } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useStore, getState } from '@/lib/store'
import { providerById, CATEGORIES } from '@/lib/catalog'
import { formatALL } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle } from '@/components/ui/Misc'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

const COLORS = { wellness: '#34D399', food: '#F59E0B', sport: '#3B82F6', travel: '#A78BFA', learning: '#22D3EE', selfcare: '#F472B6', health: '#2DD4BF' }

export default function Statistics() {
  const { t } = useTranslation()
  useStore()
  const s = getState()

  const spendByCat = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]))
    Object.values(s.employees).forEach((e) => {
      e.activeBenefits.forEach((id) => { const p = providerById(id); if (p) map[p.category] += p.cost })
    })
    s.requests.filter((r) => r.status === 'approved').forEach((r) => {
      r.items.forEach((id) => { const p = providerById(id); if (p) map[p.category] += p.cost })
    })
    return CATEGORIES.map((c) => ({ name: c.label, key: c.id, value: map[c.id] }))
  }, [s])

  const mostRequested = useMemo(() => {
    const tally = {}
    Object.values(s.employees).forEach((e) => e.activeBenefits.forEach((id) => { tally[id] = (tally[id] || 0) + 1 }))
    s.requests.forEach((r) => r.items.forEach((id) => { tally[id] = (tally[id] || 0) + 1 }))
    return Object.entries(tally).map(([id, count]) => ({ id, count, ...providerById(id) })).filter((x) => x.name).sort((a, b) => b.count - a.count).slice(0, 5)
  }, [s])

  // Deterministic-looking engagement series.
  const engagement = useMemo(() => {
    const out = []
    for (let i = 7; i >= 0; i--) {
      const seed = (i * 13 + 7) % 11
      out.push({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'][7 - i], requests: 4 + seed % 5, browse: 12 + seed })
    }
    return out
  }, [])

  const leaderboard = useMemo(() => {
    return s.users.filter((u) => u.role === 'employee').map((u) => ({
      ...u, tasks: s.employees[u.id]?.games?.tasks?.length || 0, bonus: s.employees[u.id]?.bonus || 0,
    })).sort((a, b) => b.tasks - a.tasks || b.bonus - a.bonus)
  }, [s])

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('admin.statsTitle')} subtitle={t('admin.statsSubtitle')} action={<Button variant="secondary" size="sm"><Download className="h-4 w-4" /> {t('admin.export')}</Button>} />

      <motion.div variants={fadeUp} className="mb-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title={t('admin.spendByCat')}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spendByCat} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid stroke="#E4DBCA" vertical={false} />
              <XAxis dataKey="name" stroke="#837B92" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#837B92" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: '#7C3AED14' }} formatter={(v) => `${formatALL(v)} LEK`} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {spendByCat.map((e) => <Cell key={e.key} fill={COLORS[e.key] || '#7C3AED'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('admin.engagement')}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={engagement} margin={{ left: -16, right: 8, top: 8 }}>
              <CartesianGrid stroke="#E4DBCA" vertical={false} />
              <XAxis dataKey="day" stroke="#837B92" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#837B92" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="browse" stroke="#7C3AED" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="requests" stroke="#CA8A1C" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </motion.div>

      <motion.div variants={fadeUp} className="mb-5 grid gap-4 lg:grid-cols-2">
        <ChartCard title={t('admin.mostRequested')}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={mostRequested} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {mostRequested.map((m) => <Cell key={m.id} fill={COLORS[m.category] || '#7C3AED'} />)}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={t('admin.leaderboard')}>
          <ul className="space-y-2">
            {leaderboard.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3 rounded-md border border-line bg-bg-elevated-2 p-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-bg-elevated text-xs font-bold text-faint">{i + 1}</span>
                <Avatar name={u.name} size={32} ring={i === 0} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.name}</p>
                  <p className="text-[0.65rem] text-faint">{u.department}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-gold tabular-nums"><Trophy className="h-3 w-3" /> {u.tasks}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<Heart className="h-4 w-4 text-ember" />}>{t('admin.lovedTitle')}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {mostRequested.slice(0, 3).map((p, i) => (
            <div key={p.id} className="rounded-lg border border-line bg-bg-elevated-2 p-3">
              <p className="text-[0.65rem] uppercase tracking-wide text-faint">#{i + 1} loved</p>
              <p className="mt-1 font-display text-base font-bold">{p.name}</p>
              <p className="mt-1 text-xs text-muted">{p.count} active across the team</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-line bg-bg-elevated p-5">
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  )
}

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line bg-bg-elevated px-3 py-2 text-xs shadow-e3">
      {label && <p className="mb-1 font-semibold">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 tabular-nums">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload.fill }} />
          <span className="text-muted">{p.name}:</span><span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}
