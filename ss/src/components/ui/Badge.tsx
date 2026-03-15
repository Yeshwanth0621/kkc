import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

interface BadgeProps extends PropsWithChildren {
  className?: string
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={cn('inline-flex items-center rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em]', className)}>
    {children}
  </span>
)
