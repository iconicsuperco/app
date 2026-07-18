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
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex items-center select-none touch-none w-full h-5 cursor-pointer group',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <SliderPrimitive.Track className="relative h-1 w-full rounded-full bg-muse-bg-hover group-hover:bg-muse-bg-active transition-colors">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-muse-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
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
