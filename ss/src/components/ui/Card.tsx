import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends PropsWithChildren {
  className?: string
}

export const Card = ({ className, children }: CardProps) => (
  <section className={cn('rounded-md border border-border bg-card p-4', className)}>{children}</section>
)
