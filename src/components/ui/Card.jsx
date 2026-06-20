import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Card({ className, children, glass, hover, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line p-5 shadow-e2',
        glass ? 'glass' : 'bg-bg-elevated',
        hover && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-e3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function MotionCard({ className, glass, hover, children, ...props }) {
  return (
    <motion.div
      className={cn('rounded-lg border border-line p-5 shadow-e2', glass ? 'glass' : 'bg-bg-elevated', className)}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 40px #00000066' } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const CardTitle = ({ className, children }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight', className)}>{children}</h3>
)
export const CardLabel = ({ className, children }) => (
  <p className={cn('text-[0.7rem] font-medium uppercase tracking-[0.08em] text-faint', className)}>{children}</p>
)
