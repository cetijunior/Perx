import { useTranslation } from 'react-i18next'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { providerPoster } from '@/lib/videos'
import { providerDisplay } from '@/lib/providerI18n'
import { formatALL } from '@/lib/utils'
import { cn } from '@/lib/utils'

/** Compact marketing card for the landing hero orbit / mobile wall. */
export default function HeroBenefitCard({ provider, className }) {
  const { t } = useTranslation()
  const { name, blurb } = providerDisplay(t, provider)
  const poster = providerPoster(provider)

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-lg border border-line/70 bg-bg-elevated shadow-e3',
        className,
      )}
    >
      <BenefitCardMedia
        category={provider.category}
        rating={provider.rating}
        poster={poster}
        size="hero"
      />
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3 className="line-clamp-2 text-[0.6875rem] font-semibold leading-tight text-text">
          {name}
        </h3>
        {blurb && (
          <p className="line-clamp-2 text-[0.625rem] leading-snug text-muted">{blurb}</p>
        )}
        <p className="mt-auto font-display text-[0.6875rem] font-bold tabular-nums text-ember">
          {formatALL(provider.cost)}{' '}
          <span className="text-[0.55rem] font-medium text-faint">LEK</span>
        </p>
      </div>
    </div>
  )
}
