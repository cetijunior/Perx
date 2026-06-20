import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowRight, Compass, Sparkles, Flame, ShoppingBag, CheckCircle2,
  Wallet, Store, Gamepad2, CreditCard, QrCode, Tag, Clock,
} from 'lucide-react'
import {
  useCurrentUser, useStore, getState, addToCart, budgetFor,
} from '@/lib/store'
import { recommendForUser } from '@/lib/recommend'
import { providerById, SEASONAL } from '@/lib/catalog'
import { providerDisplay } from '@/lib/providerI18n'
import { formatALL } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { SectionTitle, EmptyState } from '@/components/ui/Misc'
import BenefitCard from '@/components/employee/BenefitCard'
import DealCard from '@/components/employee/DealCard'
import BenefitQrModal from '@/components/employee/BenefitQrModal'
import {
  StatTile, QuickActionCard, AlertBanner, PerkyInsight, ActivityItem,
  BudgetSnapshotCard, GamesProgressWidget, CodesWidget, DealSpotlight, PreferencesPrompt,
} from '@/components/employee/DashboardWidgets'
import Button from '@/components/ui/Button'

function localizeProvider(t, p) {
  const { name, blurb } = providerDisplay(t, p)
  return { ...p, name, blurb }
}

function topPerkyInsight(recs, b, t) {
  const top = recs[0]
  if (!top) return t('dash.perkyDefault')
  if (top.score >= 85) return t('dash.perkyHighMatch', { name: top.name, score: top.score })
  if (b.pct < 0.25) return t('dash.perkyLowBudget')
  return t('dash.perkyPick', { name: top.name })
}

function DashboardSidebar({
  recs, b, emp, codes, recentHistory, spotlightDeal, spotlightProvider, spotlightExpires, t,
}) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-6.5rem)] lg:self-start lg:overflow-y-auto lg:pb-1">
      <PerkyInsight
        message={topPerkyInsight(recs, b, t)}
        prompt={recs[0] ? t('detail.perkyPrompt', { name: recs[0].name }) : undefined}
      />
      <BudgetSnapshotCard b={b} bonus={emp.bonus} t={t} />
      <GamesProgressWidget games={emp.games} t={t} />
      <DealSpotlight
        deal={spotlightDeal}
        provider={spotlightProvider}
        expiresAt={spotlightExpires}
        t={t}
      />
      <CodesWidget codes={codes} t={t} />
      {recentHistory.length > 0 && (
        <div className="rounded-xl border border-line bg-bg-elevated p-4 shadow-e1">
          <h3 className="mb-2 text-sm font-semibold">{t('dash.recentActivity')}</h3>
          <ul>
            {recentHistory.map((h, i) => (
              <ActivityItem key={i} label={h.label || h.type} amount={`+${formatALL(h.amount || 0)}`} />
            ))}
          </ul>
        </div>
      )}
      <PreferencesPrompt t={t} className="lg:mt-auto" />
    </aside>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const user = useCurrentUser()
  useStore()
  const s = getState()
  const emp = s.employees[user.id]
  const b = budgetFor(user.id)
  const recs = useMemo(
    () => recommendForUser(user.id, { limit: 4 }).map((p) => localizeProvider(t, p)),
    [user.id, emp, t],
  )
  const active = emp.activeBenefits.map(providerById).filter(Boolean).map((p) => localizeProvider(t, p))
  const cartSlugs = emp.cart
  const cartItems = cartSlugs.map(providerById).filter(Boolean)
  const cartTotal = cartItems.reduce((sum, p) => sum + p.cost, 0)
  const pendingReqs = s.requests.filter((r) => r.userId === user.id && r.status === 'pending')
  const pendingTotal = pendingReqs.reduce((sum, r) => sum + (r.total || 0), 0)
  const codes = (emp.discountCodes || []).filter((c) => !c.usedAt)
  const recentHistory = (emp.games.history || []).slice(0, 4)
  const firstName = user.name.split(' ')[0]
  const [qrBenefit, setQrBenefit] = useState(null)

  const spotlightDeal = useMemo(() => {
    return [...SEASONAL].sort((a, b) => a.expiresInH - b.expiresInH)[0]
  }, [])
  const spotlightProvider = spotlightDeal ? providerById(spotlightDeal.providerId) : null
  const spotlightExpires = spotlightDeal ? s.seededAt + spotlightDeal.expiresInH * 3600000 : 0

  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? t('dash.morning') : hour < 17 ? t('dash.afternoon') : t('dash.evening')

  const sidebarProps = {
    recs, b, emp, codes, recentHistory, spotlightDeal, spotlightProvider, spotlightExpires, t,
  }

  return (
    <>
      <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="min-w-0 space-y-5 sm:space-y-6">
        {/* Hero */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-ember/20 bg-bg-elevated p-4 shadow-e2 sm:p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">{timeGreeting}</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                {t('dash.greeting')}, {firstName}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('dash.subtitle')}</p>
              {user.department && (
                <p className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-bg-elevated-2 px-3 py-1 text-xs text-faint">
                  {user.company} · {user.department}
                </p>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button as={Link} to="/employee/benefits" size="sm" className="w-full sm:w-auto">
                {t('dash.explore')} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/employee/card" variant="secondary" size="sm" className="w-full sm:w-auto">
                <QrCode className="h-4 w-4" /> {t('dash.redeem')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          <StatTile
            icon={<Wallet className="h-4 w-4" />}
            label={t('common.budget')}
            value={`${formatALL(b.remaining)} LEK`}
            hint={`${Math.round(b.pct * 100)}% ${t('budget.available').toLowerCase()}`}
            to="/employee/budget"
          />
          <StatTile
            icon={<CheckCircle2 className="h-4 w-4" />}
            label={t('dash.statActive')}
            value={active.length}
            hint={active.length ? t('dash.statActiveHint') : t('dash.noActive')}
            accent="success"
            to="/employee/card"
          />
          <StatTile
            icon={<ShoppingBag className="h-4 w-4" />}
            label={t('benefits.cart')}
            value={cartSlugs.length}
            hint={cartSlugs.length ? `${formatALL(cartTotal)} LEK` : t('benefits.cartEmpty')}
            accent="info"
            to="/employee/benefits"
          />
          <StatTile
            icon={<Flame className="h-4 w-4" />}
            label={t('budget.streak')}
            value={`${emp.games.streak} ${t('budget.days')}`}
            hint={t('dash.streakHint')}
            accent="gold"
            to="/employee/games"
          />
        </motion.div>

        {/* Mobile: Perky + budget before scrolling the feed */}
        <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2 lg:hidden">
          <PerkyInsight
            message={topPerkyInsight(recs, b, t)}
            prompt={recs[0] ? t('detail.perkyPrompt', { name: recs[0].name }) : undefined}
          />
          <BudgetSnapshotCard b={b} bonus={emp.bonus} t={t} />
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp}>
          <SectionTitle>{t('dash.quickActions')}</SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
            <QuickActionCard
              to="/employee/perky"
              icon={Sparkles}
              title="Perky"
              subtitle={t('dash.actionPerky')}
              gradient="bg-gradient-to-br from-gold/90 to-ember"
            />
            <QuickActionCard
              to="/employee/benefits"
              icon={Store}
              title={t('tabs.benefits')}
              subtitle={t('dash.actionMarket')}
              gradient="bg-gradient-to-br from-ember to-ember-600"
            />
            <QuickActionCard
              to="/employee/games"
              icon={Gamepad2}
              title={t('tabs.games')}
              subtitle={t('dash.actionGames')}
              gradient="bg-gradient-to-br from-travel to-ember"
            />
            <QuickActionCard
              to="/employee/card"
              icon={CreditCard}
              title={t('tabs.card')}
              subtitle={t('dash.actionRedeem')}
              gradient="bg-gradient-to-br from-success/80 to-wellness"
            />
          </div>
        </motion.div>

        {/* Alerts */}
        {(cartSlugs.length > 0 || pendingReqs.length > 0 || codes.length > 0) && (
          <motion.div variants={fadeUp} className="space-y-3">
            {cartSlugs.length > 0 && (
              <AlertBanner
                icon={ShoppingBag}
                title={t('dash.cartBanner', { count: cartSlugs.length })}
                body={t('dash.cartBannerBody', { total: formatALL(cartTotal) })}
                action={
                  <Button as={Link} to="/employee/benefits" size="sm" variant="secondary" className="w-full sm:w-auto">
                    {t('benefits.requestApproval')}
                  </Button>
                }
              />
            )}
            {pendingReqs.length > 0 && (
              <AlertBanner
                icon={Clock}
                tone="warning"
                title={t('dash.pendingBanner', { count: pendingReqs.length })}
                body={t('dash.pendingBannerBody', { total: formatALL(pendingTotal) })}
              />
            )}
            {codes.length > 0 && (
              <AlertBanner
                icon={Tag}
                tone="gold"
                title={t('dash.codesBanner', { count: codes.length })}
                body={t('dash.codesBannerBody')}
                action={
                  <Button as={Link} to="/employee/card" size="sm" variant="secondary" className="w-full sm:w-auto">
                    {t('games.openRedeem')}
                  </Button>
                }
              />
            )}
          </motion.div>
        )}

        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-8">
          <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Active */}
            <motion.section variants={fadeUp}>
              <SectionTitle action={<Link to="/employee/card" className="text-xs font-medium text-ember">{t('dash.redeem')}</Link>}>
                {t('dash.active')}
              </SectionTitle>
              {active.length === 0 ? (
                <EmptyState
                  icon={<Compass className="h-6 w-6" />}
                  title={t('dash.noActive')}
                  action={<Button as={Link} to="/employee/benefits" size="sm">{t('dash.explore')} <ArrowRight className="h-4 w-4" /></Button>}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {active.map((p) => (
                    <BenefitCard
                      key={p.id}
                      provider={p}
                      variant="panel"
                      isActive
                      onRedeem={() => setQrBenefit({ slug: p.id, name: p.name, category: p.category })}
                      className="min-w-0"
                    />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Recommended */}
            <motion.section variants={fadeUp}>
              <SectionTitle action={
                <Link to="/employee/perky" className="flex items-center gap-1 text-xs text-gold">
                  <Sparkles className="h-3.5 w-3.5" /> Perky
                </Link>
              }>
                {t('dash.recommended')}
              </SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {recs.map((p) => (
                  <BenefitCard
                    key={p.id}
                    provider={p}
                    variant="panel"
                    score={p.score}
                    inCart={cartSlugs.includes(p.id)}
                    onAdd={(id) => addToCart(user.id, id)}
                    className="min-w-0"
                  />
                ))}
              </div>
            </motion.section>

            {/* Deals */}
            <motion.section variants={fadeUp}>
              <SectionTitle>{t('dash.whatsNew')}</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {SEASONAL.map((deal) => {
                  const p = providerById(deal.providerId)
                  const expiresAt = s.seededAt + deal.expiresInH * 3600000
                  return (
                    <DealCard key={deal.id} deal={deal} provider={p} expiresAt={expiresAt} />
                  )
                })}
              </div>
            </motion.section>
          </div>

          {/* Desktop sidebar */}
          <motion.div variants={fadeUp} className="hidden min-w-0 lg:block">
            <DashboardSidebar {...sidebarProps} />
          </motion.div>
        </div>

        {/* Mobile: extra widgets after main feed */}
        <motion.div variants={fadeUp} className="space-y-3 lg:hidden">
          <GamesProgressWidget games={emp.games} t={t} />
          <DealSpotlight
            deal={spotlightDeal}
            provider={spotlightProvider}
            expiresAt={spotlightExpires}
            t={t}
          />
          <CodesWidget codes={codes} t={t} />
          {recentHistory.length > 0 && (
            <div className="rounded-xl border border-line bg-bg-elevated p-4 shadow-e1">
              <h3 className="mb-2 text-sm font-semibold">{t('dash.recentActivity')}</h3>
              <ul>
                {recentHistory.map((h, i) => (
                  <ActivityItem key={i} label={h.label || h.type} amount={`+${formatALL(h.amount || 0)}`} />
                ))}
              </ul>
            </div>
          )}
          <PreferencesPrompt t={t} />
        </motion.div>
      </motion.div>

      <BenefitQrModal benefit={qrBenefit} open={!!qrBenefit} onClose={() => setQrBenefit(null)} />
    </>
  )
}
