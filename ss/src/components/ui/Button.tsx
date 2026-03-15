import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={cn(
      'rounded-sm border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-40',
      variant === 'primary' && 'border-accent-lime bg-accent-lime/20 text-accent-lime hover:bg-accent-lime/30',
      variant === 'secondary' && 'border-border bg-card text-text-primary hover:bg-surface',
      variant === 'danger' && 'border-accent-hot/60 bg-accent-hot/10 text-accent-hot hover:bg-accent-hot/20',
      className,
    )}
    {...props}
  />
)
