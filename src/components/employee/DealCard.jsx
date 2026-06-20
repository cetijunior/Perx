import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { Countdown } from '@/components/ui/Badge'
import { getProviderBySlug, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function DealCard({ deal, provider, expiresAt, className }) {
  const nav = useNavigate()
  useStore()
  const apiProvider = provider ? getProviderBySlug(provider.id) : null
  const poster = apiProvider?.posterUrl

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={() => nav(`/employee/benefits/${deal.providerId}`)}
      className={cn('group flex h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-bg-elevated text-left shadow-e2 transition-colors hover:border-ember/40', className)}
    >
      <BenefitCardMedia
        category={deal.accent}
        rating={provider?.rating}
        poster={poster}
        overlay={
          <div className="absolute right-3 top-3">
            <Countdown expiresAt={expiresAt} />
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-sm font-semibold">{deal.title}</h3>
        <p className="line-clamp-2 text-xs text-muted">{deal.blurb}</p>
      </div>
    </motion.button>
  )
}
