import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { IndustryCard } from '../components/game/IndustryCard';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { TIER_COLORS } from '../lib/constants';
import type { IndustryCatalogItem } from '../types';

export function CraftingGuide() {
  const [catalog, setCatalog] = useState<IndustryCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('industry_catalog')
        .select('*')
        .order('tier')
        .order('name');
      setCatalog(data || []);
      setLoading(false);
    })();
  }, []);

  const categories = [...new Set(catalog.map(c => c.category))].sort();

  const filtered = catalog.filter(item => {
    if (tierFilter !== null && item.tier !== tierFilter) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<number, IndustryCatalogItem[]>>((acc, item) => {
    (acc[item.tier] = acc[item.tier] || []).push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-base">
      {/* Hero */}
      <header className="border-b border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <h1 className="font-heading text-4xl md:text-5xl text-lime tracking-[4px]">
            INDUSTRY CATALOG
          </h1>
          <p className="font-mono text-xs text-muted mt-2 tracking-wider">
            SURVIVAL OF THE STATE • COMPLETE REFERENCE GUIDE
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0 md:sticky md:top-4 md:self-start space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-muted uppercase mb-1">Search</label>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-card border border-border rounded-[4px] px-3 py-2 font-mono text-sm text-primary
                           placeholder:text-muted/50 focus:outline-none focus:border-lime/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted uppercase mb-1">Tier</label>
              <div className="flex flex-wrap gap-1">
                <Button variant={tierFilter === null ? 'lime' : 'ghost'} size="sm"
                  onClick={() => setTierFilter(null)}>ALL</Button>
                {[1, 2, 3, 4, 0].map(t => (
                  <Button key={t} variant={tierFilter === t ? 'lime' : 'ghost'} size="sm"
                    onClick={() => setTierFilter(t)}
                    style={tierFilter === t ? { color: TIER_COLORS[t]?.color } : {}}>
                    {t === 0 ? '★' : `T${t}`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted uppercase mb-1">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={`w-full text-left px-2 py-1 text-xs font-mono rounded transition-colors
                    ${!categoryFilter ? 'text-lime bg-lime/10' : 'text-muted hover:text-primary'}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`w-full text-left px-2 py-1 text-xs font-mono rounded transition-colors
                      ${categoryFilter === c ? 'text-lime bg-lime/10' : 'text-muted hover:text-primary'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-muted pt-2 border-t border-border">
              Showing {filtered.length} of {catalog.length} industries
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : Object.keys(grouped).length === 0 ? (
              <div className="text-center py-12 text-muted font-mono">
                No industries match your filters
              </div>
            ) : (
              Object.entries(grouped)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([tier, items]) => (
                  <section key={tier}>
                    <h2
                      className="font-heading text-2xl tracking-wider mb-3 pb-2 border-b"
                      style={{
                        color: TIER_COLORS[Number(tier)]?.color || '#F5F5F0',
                        borderColor: `${TIER_COLORS[Number(tier)]?.color || '#F5F5F0'}30`,
                      }}
                    >
                      {Number(tier) === 0 ? '★ SPECIAL INDUSTRIES' : `TIER ${tier} INDUSTRIES`}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map(item => (
                        <IndustryCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
