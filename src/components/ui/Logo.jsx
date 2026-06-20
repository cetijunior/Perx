import { cn } from '@/lib/utils'

const LOGO_SRC = '/perx-logo.png'

/** PerX brand logo — official orange oval wordmark. */
export default function Logo({ className, size = 28, variant = 'full', showWord = true }) {
  void variant
  void showWord

  return (
    <img
      src={LOGO_SRC}
      alt="PerX"
      width={size}
      height={size}
      className={cn('shrink-0 select-none object-contain', className)}
      decoding="async"
    />
  )
}
