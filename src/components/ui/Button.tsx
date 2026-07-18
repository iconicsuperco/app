import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-muse-accent text-white hover:bg-muse-accent-hover active:scale-[0.97] shadow-lg shadow-muse-accent/20',
  secondary:
    'bg-muse-bg-surface text-muse-text hover:bg-muse-bg-hover border border-muse-glass-border',
  ghost:
    'bg-transparent text-muse-text-secondary hover:text-muse-text hover:bg-muse-bg-hover',
  danger:
    'bg-muse-error/15 text-muse-error hover:bg-muse-error/25',
} as const

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-sm gap-2 rounded-lg',
  icon: 'h-9 w-9 rounded-lg',
  'icon-sm': 'h-8 w-8 rounded-md',
  'icon-lg': 'h-11 w-11 rounded-lg',
} as const

type Variant = keyof typeof variants
type Size = keyof typeof sizes

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-muse-bg',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
