import { cn } from '../../lib/cn'

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => <div className={cn('animate-pulse rounded bg-surface', className)} />
