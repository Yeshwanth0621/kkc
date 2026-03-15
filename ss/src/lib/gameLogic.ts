import type { IndustryCatalogItem, Resource, ResourceType, TradeOffer } from '../types'

export const formatGc = (value: number) => value.toLocaleString('en-US')

export const canBuildIndustry = (
  industry: IndustryCatalogItem,
  resources: Resource[],
  gcBalance: number,
  phase: string,
  builtCount: number,
): { allowed: boolean; reasons: string[] } => {
  const reasons: string[] = []
  if (phase !== 'action') reasons.push('Action phase required')
  if (gcBalance < industry.gc_cost) reasons.push('Insufficient GC')
  if (builtCount >= industry.max_builds) reasons.push('Max builds reached')

  Object.entries(industry.recipe_json).forEach(([resourceType, amount]) => {
    const current = resources.find((r) => r.resource_type === resourceType)?.quantity ?? 0
    if ((amount ?? 0) > current) reasons.push(`Need ${(amount ?? 0) - current} more ${resourceType}`)
  })

  return { allowed: reasons.length === 0, reasons }
}

export const summarizeTradeSide = (side: { resource?: ResourceType; qty?: number; gc?: number }) => {
  const chunks: string[] = []
  if (side.resource && side.qty && side.qty > 0) chunks.push(`${side.qty} ${side.resource}`)
  if (side.gc && side.gc > 0) chunks.push(`${side.gc} GC`)
  return chunks.length > 0 ? chunks.join(' + ') : 'Nothing'
}

export const phaseCountdownHint = (phase: string) => {
  if (phase === 'diplomacy') return 'Trading window open now'
  if (phase === 'action') return 'Construction window open now'
  return `Currently ${phase.toUpperCase()} phase`
}

export const optimisticTradeUpdate = (trades: TradeOffer[], tradeId: string, status: TradeOffer['status']) =>
  trades.map((trade) => (trade.id === tradeId ? { ...trade, status, responded_at: new Date().toISOString() } : trade))
