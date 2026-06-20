import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Building2, ShieldCheck, RotateCcw } from 'lucide-react'
import { useStore, getState, resetAll } from '@/lib/store'
import { CATEGORIES } from '@/lib/catalog'
import { formatALL } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PageHeader, SectionTitle } from '@/components/ui/Misc'
import Button from '@/components/ui/Button'
import LanguageToggle from '@/components/ui/LanguageToggle'

export default function Settings() {
  const { t } = useTranslation()
  useStore()
  const s = getState()
  const departments = useMemo(() => {
    const out = {}
    s.users.filter((u) => u.role === 'employee').forEach((u) => {
      out[u.department] = (out[u.department] || 0) + u.budget
    })
    return Object.entries(out)
  }, [s])

  const [dept, setDept] = useState(Object.fromEntries(departments))
  const total = Object.values(dept).reduce((a, b) => a + b, 0)
  const [policy, setPolicy] = useState({ approval: true, packages: true, gamification: true })

  return (
    <motion.div variants={stagger(0.06)} initial="hidden" animate="show">
      <PageHeader title={t('admin.settingsTitle')} subtitle={t('admin.settingsSubtitle')} />

      <motion.section variants={fadeUp} className="mb-5 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<Building2 className="h-4 w-4 text-faint" />}>{t('admin.companyProfile')}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Company" defaultValue="TeamSystem Albania" />
          <Field label="Country" defaultValue="Shqipëria" />
          <Field label="Tax ID" defaultValue="L41234567A" />
          <Field label="HR contact" defaultValue="endrit.leka@perx.al" />
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="mb-5 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<span className="text-xs font-semibold tabular-nums text-ember">{formatALL(total)} LEK</span>}>{t('admin.deptBudgets')}</SectionTitle>
        <div className="space-y-3">
          {departments.map(([name]) => (
            <div key={name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">{name}</span>
                <span className="font-semibold tabular-nums text-ember">{formatALL(dept[name])} LEK</span>
              </div>
              <input
                type="range" min={20000} max={120000} step={1000}
                value={dept[name]}
                onChange={(e) => setDept((d) => ({ ...d, [name]: +e.target.value }))}
                className="w-full accent-ember"
              />
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="mb-5 rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle action={<ShieldCheck className="h-4 w-4 text-faint" />}>{t('admin.policy')}</SectionTitle>
        <div className="space-y-2">
          <Toggle label="Require HR approval before activation" on={policy.approval} onChange={(v) => setPolicy((p) => ({ ...p, approval: v }))} />
          <Toggle label="Allow employees to bundle into packages" on={policy.packages} onChange={(v) => setPolicy((p) => ({ ...p, packages: v }))} />
          <Toggle label="Enable streaks, scratch & spin rewards" on={policy.gamification} onChange={(v) => setPolicy((p) => ({ ...p, gamification: v }))} />
        </div>
        <p className="mt-3 text-[0.7rem] text-faint">
          Allowed categories: {CATEGORIES.map((c) => c.label).join(' · ')}
        </p>
      </motion.section>

      <motion.section variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated p-5">
        <SectionTitle>Workspace</SectionTitle>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <LanguageToggle />
          <Button variant="danger" onClick={() => { if (confirm('Reset all PERX demo data?')) { resetAll(); location.reload() } }}>
            <RotateCcw className="h-4 w-4" /> Reset demo data
          </Button>
        </div>
      </motion.section>
    </motion.div>
  )
}

function Field({ label, defaultValue }) {
  return (
    <label className="block">
      <span className="block text-[0.7rem] uppercase tracking-wide text-faint">{label}</span>
      <input defaultValue={defaultValue} className="mt-1 h-11 w-full rounded-sm border border-line bg-bg-elevated-2 px-3 text-sm outline-none focus:border-ember" />
    </label>
  )
}

function Toggle({ label, on, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-md border border-line bg-bg-elevated-2 px-4 py-3">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!on)} className={`relative h-6 w-10 rounded-full transition-colors ${on ? 'bg-grad-ember' : 'bg-bg-elevated'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-text shadow transition-transform ${on ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}
