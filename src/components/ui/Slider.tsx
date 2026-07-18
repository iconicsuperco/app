import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

export interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  orientation?: 'horizontal' | 'vertical'
  ariaLabel?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  orientation = 'horizontal',
  ariaLabel,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex items-center select-none touch-none cursor-pointer group',
        orientation === 'vertical' ? 'h-full w-5 flex-col' : 'w-full h-5',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <SliderPrimitive.Track className={cn(
        'relative rounded-full bg-muse-bg-hover group-hover:bg-muse-bg-active transition-colors',
        orientation === 'vertical' ? 'h-full w-1' : 'h-1 w-full',
      )}>
        <SliderPrimitive.Range className={cn(
          'absolute rounded-full bg-muse-accent',
          orientation === 'vertical' ? 'bottom-0 w-full' : 'h-full',
        )} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={ariaLabel}
        className={cn(
          'block w-3 h-3 rounded-full bg-muse-accent shadow-md',
          'opacity-0 group-hover:opacity-100 group-data-[dragging]:opacity-100',
          'transition-opacity duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muse-accent',
          'hover:scale-125 transition-transform duration-150',
        )}
      />
    </SliderPrimitive.Root>
  )
}
