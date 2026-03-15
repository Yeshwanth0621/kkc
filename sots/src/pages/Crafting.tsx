import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { IndustryCard } from '../components/game/IndustryCard';
import { Button } from '../components/ui/Button';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { validateBuild } from '../lib/gameLogic';
import type { Country, Resource, Industry, GameState, IndustryCatalogItem } from '../types';
import { TIER_COLORS } from '../lib/constants';

interface CraftingProps {
  country: Country | null;
  resources: Resource[];
  industries: Industry[];
  gameState: GameState | null;
  onBuildComplete: () => void;
}

export function Crafting({ country, resources, industries, gameState, onBuildComplete }: CraftingProps) {
  const { addToast } = useToast();
  const [catalog, setCatalog] = useState<IndustryCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingId, setBuildingId] = useState<string | null>(null);
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

  const handleBuild = async (item: IndustryCatalogItem) => {
    if (!country || !gameState) return;
    setBuildingId(item.id);
    try {
      // Deduct resources
      for (const [resType, needed] of Object.entries(item.recipe_json)) {
        const res = resources.find(r => r.resource_type === resType);
        if (!res) throw new Error(`Missing resource ${resType}`);
        const { error } = await supabase
          .from('resources')
          .update({ quantity: res.quantity - (needed as number) })
          .eq('id', res.id);
        if (error) throw error;
      }

      // Deduct GC
      const { error: gcErr } = await supabase
        .from('countries')
        .update({ gc_balance: country.gc_balance - item.gc_cost })
        .eq('id', country.id);
      if (gcErr) throw gcErr;

      // Insert industry
      const { error: indErr } = await supabase.from('industries').insert({
        country_id: country.id,
        industry_name: item.name,
        tier: item.tier,
        category: item.category,
        built_at_round: gameState.current_round,
        income_per_round: item.income_per_round,
        is_active: item.build_rounds <= 0,
      });
      if (indErr) throw indErr;

      addToast(`🏗️ ${item.name} construction started!`, 'success', '🏗️');
      onBuildComplete();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Build failed';
      addToast(`Build failed: ${msg}`, 'error');
    } finally {
      setBuildingId(null);
    }
  };

  return (
    <div className="space-y-5 fade-in">
      <h2 className="font-heading text-lg text-primary tracking-[4px] flex items-center gap-3">
        <span className="w-8 h-px bg-gradient-to-r from-neon-cyan to-transparent" />
        Industry Crafting
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search industries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-4 py-2.5 font-mono text-xs text-white
                     placeholder:text-muted/30 focus:outline-none focus:border-[rgba(0,240,255,0.4)] focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                     w-full sm:w-64 transition-all duration-300 tracking-wider"
        />

        <div className="flex gap-1">
          <Button
            variant={tierFilter === null ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => setTierFilter(null)}
          >
            ALL
          </Button>
          {[1, 2, 3, 4, 0].map(t => (
            <Button
              key={t}
              variant={tierFilter === t ? 'cyan' : 'ghost'}
              size="sm"
              onClick={() => setTierFilter(t)}
              style={tierFilter === t ? { color: TIER_COLORS[t]?.color } : {}}
            >
              {t === 0 ? '★' : `T${t}`}
            </Button>
          ))}
        </div>

        <select
          value={categoryFilter || ''}
          onChange={e => setCategoryFilter(e.target.value || null)}
          className="bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-4 py-2.5 font-mono text-xs text-white
                     focus:outline-none focus:border-[rgba(0,240,255,0.4)] transition-all duration-300 tracking-wider"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted font-mono text-xs tracking-widest">
          No industries match your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => {
            const validation = country && gameState
              ? validateBuild(item, resources, country, industries, gameState.phase)
              : undefined;
            return (
              <IndustryCard
                key={item.id}
                item={item}
                validation={validation}
                showBuildButton={!!country}
                loading={buildingId === item.id}
                onBuild={() => handleBuild(item)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
