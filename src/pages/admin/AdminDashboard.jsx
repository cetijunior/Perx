import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Users, Wallet, CheckCircle2, TrendingUp, Check, X, Bell } from 'lucide-react'
import { useStore, getState, decideRequest } from '@/lib/store'
import { providerById, CATEGORIES } from '@/lib/catalog'
import { formatALL, timeAgo } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle, EmptyState } from '@/components/ui/Misc'
import { StatusChip } from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

export default function AdminDashboard() {
  const { t } = useTranslation()
  useStore()
  const s = getState()
  const employees = s.users.filter((u) => u.role === 'employee')
  const totalBudget = employees.reduce((sum, u) => sum + u.budget, 0)
  const approvedMonth = s.requests.filter((r) => r.status === 'approved').reduce((sum, r) => sum + r.total, 0)
  const pending = s.requests.filter((r) => r.status === 'pending')

  const topCat = useMemo(() => {
    const tally = {}
    Object.values(s.employees).forEach((e) => e.activeBenefits.forEach((id) => {
      const p = providerById(id); if (p) tally[p.category] = (tally[p.category] || 0) + 1
    }))
    s.requests.forEach((r) => r.items.forEach((id) => {
      const p = providerById(id); if (p) tally[p.category] = (tally[p.category] || 0) + 1
    }))
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
    return top ? CATEGORIES.find((c) => c.id === top[0])?.label : '—'
  }, [s])

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('admin.dashTitle')} subtitle={t('admin.dashSubtitle')} />

      <motion.div variants={fadeUp} className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI icon={<Users />} label={t('admin.totalEmployees')} value={employees.length} accent="ember" />
        <KPI icon={<Wallet />} label={t('admin.budgetAllocated')} value={`${formatALL(totalBudget)} LEK`} accent="gold" />
        <KPI icon={<CheckCircle2 />} label={t('admin.approvedMonth')} value={`${formatALL(approvedMonth)} LEK`} accent="success" />
        <KPI icon={<TrendingUp />} label={t('admin.popularCategory')} value={topCat} accent="info" />
      </motion.div>

      <motion.section variants={fadeUp} className="mb-6 grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-xl border border-line bg-bg-elevated p-5">
          <SectionTitle action={pending.length > 0 && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[0.65rem] font-semibold text-warning">{pending.length}</span>}>{t('admin.pending')}</SectionTitle>
          {pending.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title={t('admin.noPending')} />
          ) : (
            <div className="space-y-3">
              {pending.map((req) => <RequestRow key={req.id} req={req} t={t} />)}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-bg-elevated p-5">
          <SectionTitle action={<Bell className="h-4 w-4 text-faint" />}>{t('admin.activity')}</SectionTitle>
          <ul className="space-y-3">
            {s.activity.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: a.kind === 'approved' ? 'var(--success)' : a.kind === 'rejected' ? 'var(--danger)' : a.kind === 'request' ? 'var(--ember)' : 'var(--info)' }} />
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{a.text}</p>
                  <p className="mt-0.5 text-[0.65rem] text-faint">{timeAgo(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>
    </motion.div>
  )
}

function KPI({ icon, label, value, accent }) {
  const c = { ember: 'text-ember bg-ember/15', gold: 'text-gold bg-gold/15', success: 'text-success bg-success/15', info: 'text-info bg-info/15' }[accent]
  return (
    <motion.div whileHover={{ y: -2 }} className="relative overflow-hidden rounded-lg border border-line bg-bg-elevated p-4 shadow-e2">
      <div className="mb-3 flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-md ${c}`}>{icon}</span>
      </div>
      <p className="font-display text-2xl font-bold tabular-nums leading-tight">{value}</p>
      <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-faint">{label}</p>
    </motion.div>
  )
}

function RequestRow({ req, t }) {
  const user = getState().users.find((u) => u.id === req.userId)
  const items = req.items.map(providerById).filter(Boolean)
  return (
    <motion.div layout className="rounded-lg border border-line bg-bg-elevated-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.name} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-[0.65rem] text-faint">{user.department} · {timeAgo(req.createdAt)}</p>
          </div>
        </div>
        <StatusChip status={req.status} t={t} />
      </div>
      <div className="my-3 flex flex-wrap gap-1.5">
        {items.map((p) => <span key={p.id} className="rounded-md bg-bg-elevated px-2 py-1 text-[0.7rem]">{p.name}</span>)}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-base font-bold tabular-nums text-ember">{formatALL(req.total)} <span className="text-[0.65rem] font-medium text-faint">LEK</span></span>
        <div className="flex items-center gap-2">
          <button onClick={() => decideRequest(req.id, 'rejected')} className="rounded-md border border-danger/40 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10 active:scale-95">
            <X className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />{t('common.reject')}
          </button>
          <button onClick={() => decideRequest(req.id, 'approved')} className="rounded-md bg-grad-ember px-3 py-1.5 text-xs font-semibold text-on-accent shadow-glow transition active:scale-95">
            <Check className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />{t('common.approve')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

