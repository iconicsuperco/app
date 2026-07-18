import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-colors duration-200',
          variant === 'default' && 'bg-muse-bg-surface border border-muse-glass-border',
          variant === 'glass' && 'glass',
          variant === 'elevated' &&
            'bg-muse-bg-elevated border border-muse-glass-border shadow-xl shadow-black/20',
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = 'Card'
