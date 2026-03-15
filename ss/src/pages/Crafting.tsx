import { useEffect, useMemo, useState } from 'react'
import { IndustryCard } from '../components/game/IndustryCard'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { useCountry } from '../hooks/useCountry'
import { useGameState } from '../hooks/useGameState'
import { useResources } from '../hooks/useResources'
import { supabase } from '../lib/supabase'
import type { Industry, IndustryCatalogItem } from '../types'

export const Crafting = () => {
  const { country } = useCountry()
  const { gameState } = useGameState()
  const { resources, loading: resourcesLoading } = useResources(country?.id)
  const [catalog, setCatalog] = useState<IndustryCatalogItem[]>([])
  const [industries, setIndustries] = useState<Industry[]>([])
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<number | 'all'>('all')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [{ data: catalogData }, { data: industryData }] = await Promise.all([
        supabase.from('industry_catalog').select('*').order('tier').order('name'),
        country?.id ? supabase.from('industries').select('*').eq('country_id', country.id) : Promise.resolve({ data: [] }),
      ])
      setCatalog((catalogData ?? []) as IndustryCatalogItem[])
      setIndustries((industryData ?? []) as Industry[])
      setLoading(false)
    }
    void fetchData()
  }, [country?.id])

  const filteredCatalog = useMemo(
    () =>
      catalog.filter((item) => {
        const byTier = tier === 'all' || item.tier === tier
        const byCategory = category === 'all' || item.category === category
        const byQuery = item.name.toLowerCase().includes(query.toLowerCase())
        return byTier && byCategory && byQuery
      }),
    [catalog, category, query, tier],
  )

  const buildIndustry = async (item: IndustryCatalogItem) => {
    if (!country || !gameState) return

    for (const [resourceType, qty] of Object.entries(item.recipe_json)) {
      const amount = qty ?? 0
      const current = resources.find((resource) => resource.resource_type === resourceType)?.quantity ?? 0
      await supabase
        .from('resources')
        .update({ quantity: Math.max(0, current - amount) })
        .eq('country_id', country.id)
        .eq('resource_type', resourceType)
    }

    await supabase
      .from('countries')
      .update({ gc_balance: Math.max(0, country.gc_balance - item.gc_cost) })
      .eq('id', country.id)

    await supabase.from('industries').insert({
      country_id: country.id,
      industry_name: item.name,
      tier: item.tier,
      category: item.category,
      built_at_round: gameState.current_round,
      income_per_round: item.income_per_round,
      is_active: item.build_rounds === 0,
    })
  }

  if (loading || resourcesLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="grid gap-3 md:grid-cols-4">
        <input
          className="rounded-sm border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Search industry"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select className="rounded-sm border border-border bg-surface px-3 py-2 text-sm" value={tier} onChange={(event) => setTier(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
          <option value="all">All Tiers</option>
          {[1, 2, 3, 4].map((tierValue) => (
            <option key={tierValue} value={tierValue}>
              Tier {tierValue}
            </option>
          ))}
        </select>
        <select className="rounded-sm border border-border bg-surface px-3 py-2 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All Categories</option>
          {[...new Set(catalog.map((item) => item.category))].map((itemCategory) => (
            <option key={itemCategory} value={itemCategory}>
              {itemCategory}
            </option>
          ))}
        </select>
        <p className="self-center text-xs text-text-muted">{filteredCatalog.length} industries</p>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredCatalog.map((item) => (
          <IndustryCard
            key={item.id}
            item={item}
            resources={resources}
            gcBalance={country?.gc_balance ?? 0}
            phase={gameState?.phase ?? 'paused'}
            builtCount={industries.filter((industry) => industry.industry_name === item.name).length}
            onBuild={() => void buildIndustry(item)}
          />
        ))}
      </div>
    </div>
  )
}
