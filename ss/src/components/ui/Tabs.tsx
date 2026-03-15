import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface TabItem {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (value: string) => void
  className?: string
  compact?: boolean
  suffix?: ReactNode
}

export const Tabs = ({ tabs, activeTab, onChange, className, compact, suffix }: TabsProps) => (
  <div className={cn('flex items-center justify-between gap-2', className)}>
    <div className={cn('grid w-full gap-2', compact ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4')}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-sm border px-3 py-2 text-xs uppercase tracking-[0.2em] transition',
            activeTab === tab.id
              ? 'border-accent-lime bg-accent-lime/20 text-accent-lime'
              : 'border-border bg-surface text-text-muted hover:text-text-primary',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
    {suffix}
  </div>
)
