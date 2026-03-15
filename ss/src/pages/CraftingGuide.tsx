import { useEffect, useMemo, useState } from 'react'
import { IndustryCard } from '../components/game/IndustryCard'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { supabase } from '../lib/supabase'
import type { IndustryCatalogItem } from '../types'

export const CraftingGuide = () => {
  const [catalog, setCatalog] = useState<IndustryCatalogItem[]>([])
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<number | 'all'>('all')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data } = await supabase.from('industry_catalog').select('*').order('tier').order('name')
      setCatalog((data ?? []) as IndustryCatalogItem[])
      setLoading(false)
    }
    void fetchCatalog()
  }, [])

  const filtered = useMemo(
    () =>
      catalog.filter((item) => {
        const byQuery = item.name.toLowerCase().includes(query.toLowerCase())
        const byTier = tier === 'all' || item.tier === tier
        const byCategory = category === 'all' || item.category === category
        return byQuery && byTier && byCategory
      }),
    [catalog, category, query, tier],
  )

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-[280px_1fr]">
      <Card className="sticky top-24 h-fit space-y-3">
        <h1 className="font-heading text-3xl uppercase tracking-[0.1em] text-accent-lime">Crafting Guide</h1>
        <input
          className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" value={tier} onChange={(event) => setTier(event.target.value === 'all' ? 'all' : Number(event.target.value))}>
          <option value="all">All Tiers</option>
          {[1, 2, 3, 4].map((tierValue) => (
            <option key={tierValue} value={tierValue}>
              Tier {tierValue}
            </option>
          ))}
        </select>
        <select className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All Categories</option>
          {[...new Set(catalog.map((item) => item.category))].map((itemCategory) => (
            <option key={itemCategory} value={itemCategory}>
              {itemCategory}
            </option>
          ))}
        </select>
      </Card>
      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((item) => (
              <IndustryCard
                key={item.id}
                item={item}
                resources={[]}
                gcBalance={0}
                phase="paused"
                builtCount={0}
                onBuild={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
