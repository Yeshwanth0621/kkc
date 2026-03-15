import { RESOURCE_COLORS } from '../../lib/constants'
import type { Resource } from '../../types'
import { Card } from '../ui/Card'

interface ResourceCardProps {
  resource: Resource
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const style = RESOURCE_COLORS[resource.resource_type]
  return (
    <Card className="space-y-2">
      <p className="font-data text-xs uppercase tracking-[0.2em]" style={{ color: style.color }}>
        {style.emoji} {resource.resource_type}
      </p>
      <p className="font-heading text-3xl text-text-primary">{resource.quantity}</p>
      <p className="font-data text-xs text-text-muted">+{resource.replenish_per_round} / round</p>
    </Card>
  )
}
