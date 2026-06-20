import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react'
import { login } from '@/lib/store'
import Button from '@/components/ui/Button'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { fadeUp, stagger } from '@/lib/motion'

const DEMO = [
  { role: 'employee', email: 'arta.koci@perx.al', password: 'perx123', name: 'Arta Koçi', icon: User },
  { role: 'employee', email: 'blend.hoxha@perx.al', password: 'perx123', name: 'Blend Hoxha', icon: User },
  { role: 'admin', email: 'admin@perx.al', password: 'admin2026', name: 'Endrit Leka', icon: ShieldCheck },
]

export default function Login() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e, creds) {
    e?.preventDefault()
    setError(''); setLoading(true)
    const em = creds?.email ?? email
    const pw = creds?.password ?? password
    const res = await login(em, pw)
    setLoading(false)
    if (!res.ok) { setError(t('login.error')); return }
    nav(res.user.role === 'admin' ? '/admin' : '/employee')
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-10">
      <div className="pointer-events-none absolute inset-0 bg-grad-aurora opacity-80" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-ember/20 blur-[100px]" />

      <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="relative z-10 w-full max-w-sm">
        <motion.div variants={fadeUp} className="rounded-xl border border-line bg-bg-elevated/80 p-6 shadow-e3 backdrop-blur-xl">
          <h1 className="text-2xl font-bold tracking-tight">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('login.subtitle')}</p>

          <div className="mt-5 space-y-4">
            <GoogleSignInButton disabled title={t('login.googleSoon')}>
              {t('login.google')}
            </GoogleSignInButton>
            <p className="text-center text-[0.7rem] text-faint">{t('login.googleSoon')}</p>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-line" aria-hidden />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('login.orEmail')}</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <Field icon={Mail} type="email" placeholder={t('login.email')} value={email} onChange={setEmail} />
            <Field icon={Lock} type="password" placeholder={t('login.password')} value={password} onChange={setPassword} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? t('login.signingIn') : t('login.submit')} {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-5">
          <p className="mb-2 text-center text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint">{t('login.hint')}</p>
          <div className="space-y-2">
            {DEMO.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={(e) => submit(e, d)}
                disabled={loading}
                className="flex w-full items-center gap-3 rounded-md border border-line bg-bg-elevated/60 px-3 py-2.5 text-left transition-colors hover:border-faint hover:bg-bg-elevated-2 disabled:opacity-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-md bg-bg-elevated-2 text-ember"><d.icon className="h-4 w-4" /></span>
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
        </motion.div>
      </motion.div>
    </div>
  )
}

function Field({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-sm border border-line bg-bg-elevated-2 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-faint focus:border-ember focus:ring-2 focus:ring-ember/40"
      />
    </div>
  )
}
