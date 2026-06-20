import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { LogoChip } from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { packageVideoSources } from '@/lib/videos'
import { formatALL, cn } from '@/lib/utils'

export default function PackageCard({ pkg, items, total, allInCart, onAdd, className }) {
  const { t } = useTranslation()

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-bg-elevated shadow-e2', className)}
    >
      <BenefitCardMedia
        category={pkg.accent}
        sources={packageVideoSources(pkg)}
        showChips={false}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{pkg.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{pkg.blurb}</p>
        </div>

        <div className="flex -space-x-2">
          {items.map((p) => (
            <LogoChip key={p.id} name={p.name} size={28} rounded="rounded-full" className="ring-2 ring-bg-elevated" />
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-display text-base font-bold tabular-nums text-ember">
            {formatALL(total)} <span className="text-[0.65rem] font-medium text-faint">LEK</span>
          </span>
          <Button
            size="sm"
            variant={allInCart ? 'ghost' : 'primary'}
            onClick={onAdd}
          >
            {allInCart ? <><Check className="h-3.5 w-3.5" /> {t('common.inCart')}</> : t('benefits.addPackage')}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
