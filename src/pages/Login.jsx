import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { User, ShieldCheck } from 'lucide-react'
import { login } from '@/lib/store'
import Logo from '@/components/ui/Logo'
import { fadeUp, stagger } from '@/lib/motion'

const DEMO = [
  { role: 'employee', email: 'arta.koci@perx.al', password: 'perx123', name: 'Arta Koçi', icon: User },
  { role: 'employee', email: 'blend.hoxha@perx.al', password: 'perx123', name: 'Blend Hoxha', icon: User },
  { role: 'admin', email: 'admin@perx.al', password: 'admin2026', name: 'Endrit Leka', icon: ShieldCheck },
]

export default function Login() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInAs(account) {
    setError('')
    setLoading(true)
    const res = await login(account.email, account.password)
    setLoading(false)
    if (!res.ok) {
      setError(t('login.error'))
      return
    }
    nav(res.user.role === 'admin' ? '/admin' : '/employee')
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-80" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-ember/20 blur-[100px]" />

      <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="relative z-10 w-full max-w-sm">
        <motion.div variants={fadeUp} className="mb-6 flex justify-center">
          <Logo size={32} />
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated/80 p-6 shadow-e3 backdrop-blur-xl">
          <h1 className="text-center text-2xl font-bold tracking-tight">{t('login.title')}</h1>
          <p className="mt-1 text-center text-sm text-muted">{t('login.subtitle')}</p>

          {error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}

          <div className="mt-5 space-y-2">
            {DEMO.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => signInAs(d)}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-md border border-line bg-bg-elevated/60 px-3 py-2.5 text-left transition-colors hover:border-faint hover:bg-bg-elevated-2 disabled:opacity-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-bg-elevated-2 text-ember">
                  <d.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{d.name}</span>
                  <span className="block truncate text-xs text-faint">{d.email}</span>
                </span>
                <span className="rounded-full bg-bg-elevated-2 px-2 py-0.5 text-[0.65rem] font-medium uppercase text-muted">
                  {d.role === 'admin' ? t('login.admin') : t('login.employee')}
                </span>
              </button>
            ))}
          </div>

          {loading && (
            <p className="mt-4 text-center text-sm text-muted">{t('login.signingIn')}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
