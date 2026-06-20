import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Trophy, Flame, Search } from 'lucide-react'
import { useStore, getState, budgetFor } from '@/lib/store'
import { providerById } from '@/lib/catalog'
import { formatALL, cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader } from '@/components/ui/Misc'
import Avatar, { LogoChip } from '@/components/ui/Avatar'
import { RewardBadge } from '@/components/ui/Badge'

export default function Employees() {
  const { t } = useTranslation()
  useStore()
  const s = getState()
  const employees = s.users.filter((u) => u.role === 'employee')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const filtered = employees.filter((u) => `${u.name} ${u.department}`.toLowerCase().includes(q.toLowerCase()))
  const topPlayerId = [...employees].sort((a, b) =>
    (s.employees[b.id]?.games?.tasks?.length || 0) - (s.employees[a.id]?.games?.tasks?.length || 0),
  )[0]?.id

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('admin.employeesTitle')} subtitle={t('admin.employeesSubtitle')} />

      <motion.div variants={fadeUp} className="mb-4 flex items-center gap-2 rounded-md border border-line bg-bg-elevated px-3 py-2.5">
        <Search className="h-4 w-4 text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="flex-1 bg-transparent text-sm outline-none placeholder:text-faint" />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => {
          const e = s.employees[u.id]
          const b = budgetFor(u.id)
          const isTop = u.id === topPlayerId && e.games.tasks.length > 0
          return (
            <button key={u.id} onClick={() => setOpen(u.id)} className="text-left">
              <motion.div whileHover={{ y: -2 }} className="relative rounded-lg border border-line bg-bg-elevated p-4 shadow-e2">
                <div className="mb-3 flex items-start gap-3">
                  <Avatar name={u.name} size={44} ring={isTop} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-faint">{u.department}</p>
                  </div>
                  {isTop && <RewardBadge><Trophy className="h-3 w-3" /> {t('admin.topPlayer')}</RewardBadge>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="Budget" value={`${formatALL(b.remaining)}`} />
                  <Stat label={t('admin.used')} value={e.activeBenefits.length} />
                  <Stat label={t('budget.streak')} value={<><Flame className="-mt-0.5 mr-0.5 inline h-3 w-3 text-gold" />{e.games.streak}</>} />
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-elevated-2">
                  <div className="h-full bg-grad-ember" style={{ width: `${b.pct * 100}%` }} />
                </div>
              </motion.div>
            </button>
          )
        })}
      </motion.div>

      <AnimatePresence>
        {open && <EmployeeModal userId={open} onClose={() => setOpen(null)} t={t} />}
      </AnimatePresence>
    </motion.div>
  )
}

const Stat = ({ label, value }) => (
  <div className="rounded-md bg-bg-elevated-2 p-2">
    <p className="text-[0.6rem] uppercase tracking-wide text-faint">{label}</p>
    <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
  </div>
)

function EmployeeModal({ userId, onClose, t }) {
  const s = getState()
  const u = s.users.find((x) => x.id === userId)
  const e = s.employees[userId]
  const b = budgetFor(userId)
  const benefits = e.activeBenefits.map(providerById).filter(Boolean)
  const reqs = s.requests.filter((r) => r.userId === userId)
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/60" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[min(560px,92vw)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-line bg-bg-elevated shadow-e3',
        )}
      >
        <div className="relative overflow-hidden border-b border-line bg-bg-elevated p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-ember/20 blur-3xl" />
          <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md hover:bg-bg-elevated-2"><X className="h-4 w-4" /></button>
          <div className="flex items-center gap-4">
            <Avatar name={u.name} size={64} />
            <div>
              <p className="font-display text-xl font-bold">{u.name}</p>
              <p className="text-sm text-muted">{u.department} · {u.company}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat label={t('common.budget')} value={`${formatALL(b.remaining)} LEK`} />
            <Stat label={t('budget.spent')} value={`${formatALL(b.spent)}`} />
            <Stat label="Bonus" value={`+${formatALL(e.bonus)}`} />
          </div>
        </div>
        <div className="max-h-[45vh] overflow-y-auto p-5">
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Active benefits</p>
          {benefits.length === 0 ? <p className="text-sm text-muted">No active benefits yet.</p> : (
            <div className="mb-4 space-y-2">
              {benefits.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-md border border-line bg-bg-elevated-2 p-2.5">
                  <LogoChip name={p.name} size={32} />
                  <span className="flex-1 truncate text-sm">{p.name}</span>
                  <span className="text-xs font-semibold tabular-nums text-ember">{formatALL(p.cost)} LEK</span>
                </div>
              ))}
            </div>
          )}
          <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Requests</p>
          {reqs.length === 0 ? <p className="text-sm text-muted">No requests yet.</p> : (
            <ul className="space-y-2">
              {reqs.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-md border border-line bg-bg-elevated-2 p-2.5 text-sm">
                  <span>{r.items.map((id) => providerById(id)?.name).join(' + ')}</span>
                  <span className={cn('text-xs font-semibold', r.status === 'approved' ? 'text-success' : r.status === 'rejected' ? 'text-danger' : 'text-warning')}>{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </>
  )
}
