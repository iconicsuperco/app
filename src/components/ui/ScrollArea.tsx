import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

export interface ScrollAreaProps {
  className?: string
  children: React.ReactNode
}

export function ScrollArea({ className, children }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root className={cn('relative overflow-hidden', className)}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({ className, orientation = 'vertical' }: { className?: string; orientation?: 'vertical' | 'horizontal' }) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation={orientation}
      className={cn(
        'flex transition-opacity duration-150 ease-out',
        'p-[2px] group-data-[radix-scroll-area-viewport]/scrollArea:hover:opacity-100',
        'pointer-events-none hover:pointer-events-auto',
        'opacity-0',
        orientation === 'vertical' && 'w-2.5 h-full',
        orientation === 'horizontal' && 'h-2.5 flex-col w-full',
        className,
      )}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={cn(
          'flex-1 rounded-full bg-white/10',
          'hover:bg-white/20 transition-colors',
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}
