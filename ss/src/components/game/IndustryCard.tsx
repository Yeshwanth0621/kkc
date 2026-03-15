import { canBuildIndustry } from '../../lib/gameLogic'
import { RESOURCE_COLORS, TIER_COLORS } from '../../lib/constants'
import type { IndustryCatalogItem, Resource } from '../../types'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface IndustryCardProps {
  item: IndustryCatalogItem
  resources: Resource[]
  gcBalance: number
  phase: string
  builtCount: number
  onBuild: (item: IndustryCatalogItem) => void
}

export const IndustryCard = ({ item, resources, gcBalance, phase, builtCount, onBuild }: IndustryCardProps) => {
  const { allowed, reasons } = canBuildIndustry(item, resources, gcBalance, phase, builtCount)

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-xl uppercase tracking-[0.1em]">{item.name}</h3>
        <Badge className={TIER_COLORS[item.tier]}>Tier {item.tier}</Badge>
      </div>
      <p className="text-xs text-text-muted">{item.category}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(item.recipe_json).map(([resourceType, qty]) => {
          const current = resources.find((r) => r.resource_type === resourceType)?.quantity ?? 0
          const enough = current >= (qty ?? 0)
          return (
            <div key={resourceType} className="rounded border border-border px-2 py-1 font-data">
              <span>{RESOURCE_COLORS[resourceType as keyof typeof RESOURCE_COLORS].emoji}</span> {resourceType}: {qty}{' '}
              <span className={enough ? 'text-green-400' : 'text-red-400'}>{enough ? '✓' : '✗'}</span>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
        <p>GC Cost: {item.gc_cost.toLocaleString()}</p>
        <p>Build: {item.build_rounds} rounds</p>
        <p>Income: +{item.income_per_round} GC</p>
        <p>Max Builds: {item.max_builds}</p>
      </div>
      <p className="text-xs text-text-muted">Prerequisites: {item.prerequisites || 'None'}</p>
      <p className="text-xs text-accent-cyan">{item.special_effect}</p>
      <Button disabled={!allowed} title={allowed ? '' : reasons.join(' • ')} onClick={() => onBuild(item)} className="w-full">
        Build
      </Button>
      {!allowed && <p className="text-xs text-text-muted">{reasons.join(' • ')}</p>}
    </Card>
  )
}
