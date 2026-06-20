import { useTranslation } from 'react-i18next'
import BenefitCardMedia from '@/components/employee/BenefitCardMedia'
import { providerPoster } from '@/lib/videos'
import { providerDisplay } from '@/lib/providerI18n'
import { formatALL } from '@/lib/utils'
import { cn } from '@/lib/utils'

/** Compact marketing card for the landing hero orbit / mobile wall. */
export default function HeroBenefitCard({ provider, className, variant = 'default' }) {
  const { t } = useTranslation()
  const { name, blurb } = providerDisplay(t, provider)
  const poster = providerPoster(provider)
  const isMarquee = variant === 'marquee'

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border bg-bg-elevated shadow-e3',
        isMarquee
          ? 'min-w-[9.25rem] max-w-[9.25rem] border-line/60 ring-1 ring-white/10'
          : 'rounded-lg border-line/70',
        className,
      )}
    >
      <BenefitCardMedia
        category={provider.category}
        rating={provider.rating}
        poster={poster}
        size="hero"
      />
      <div className={cn('flex flex-1 flex-col gap-1', isMarquee ? 'p-2.5' : 'p-2')}>
        <h3 className={cn(
          'line-clamp-2 font-semibold leading-tight text-text',
          isMarquee ? 'text-[0.72rem]' : 'text-[0.6875rem]',
        )}>
          {name}
        </h3>
        {blurb && (
          <p className={cn(
            'line-clamp-2 leading-snug text-muted',
            isMarquee ? 'text-[0.65rem]' : 'text-[0.625rem]',
          )}>{blurb}</p>
        )}
        <p className={cn(
          'mt-auto font-display font-bold tabular-nums text-ember',
          isMarquee ? 'text-[0.72rem]' : 'text-[0.6875rem]',
        )}>
          {formatALL(provider.cost)}{' '}
          <span className="text-[0.55rem] font-medium text-faint">LEK</span>
        </p>
      </div>
    </div>
  )
}
