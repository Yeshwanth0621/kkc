import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCountry } from '../hooks/useCountry';
import { useResources } from '../hooks/useResources';
import { useGameState } from '../hooks/useGameState';
import { useTrades } from '../hooks/useTrades';
import { useToast } from '../components/ui/Toast';
import { Navbar } from '../components/layout/Navbar';
import { BottomNav } from '../components/layout/BottomNav';
import { ResourceCard } from '../components/game/ResourceCard';
import { EventOverlay } from '../components/game/EventOverlay';
import { Card } from '../components/ui/Card';
import { ResourceCardSkeleton } from '../components/ui/Skeleton';
import { formatGC } from '../lib/constants';
import { supabase } from '../lib/supabase';
import type { Industry, EventLog } from '../types';
import { Crafting } from './Crafting';
import { Trade } from './Trade';

const TABS = [
  { id: 'nation', label: 'My Nation', icon: '🏛️' },
  { id: 'crafting', label: 'Crafting', icon: '🔨' },
  { id: 'trade', label: 'Trade / Barter', icon: '🤝' },
  { id: 'world', label: 'World', icon: '🌍' },
];

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { country, allCountries } = useCountry(user?.id);
  const { resources, loading: resLoading, refetch: refetchResources } = useResources(country?.id);
  const { gameState } = useGameState();
  const { incomingOffers, sentOffers, setOnNewOffer, refetch: refetchTrades } = useTrades(country?.id);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('nation');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [indLoading, setIndLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<EventLog | null>(null);

  // Fetch industries
  useEffect(() => {
    if (!country?.id) return;
    (async () => {
      const { data } = await supabase
        .from('industries')
        .select('*')
        .eq('country_id', country.id);
      setIndustries(data || []);
      setIndLoading(false);
    })();
  }, [country?.id]);

  // Trade notification
  useEffect(() => {
    setOnNewOffer(() => {
      addToast(`🤝 New trade offer from a country!`, 'trade', '🤝');
    });
  }, [setOnNewOffer, addToast]);

  // Event overlay
  useEffect(() => {
    const channel = supabase
      .channel('event_log_overlay')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_log' },
        (payload) => {
          const event = payload.new as EventLog;
          if (!country?.name) return;
          if (
            event.affected_countries.length === 0 ||
            event.affected_countries.includes(country.name)
          ) {
            setCurrentEvent(event);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [country?.name]);

  const activeIndustries = industries.filter(i => i.is_active);
  const totalIncome = activeIndustries.reduce((sum, i) => sum + i.income_per_round, 0);
  const foodBalance = country ? country.food_produced - country.food_req : 0;
  const foodPct = country && country.food_req > 0
    ? Math.min(100, (country.food_produced / country.food_req) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-base pb-20 md:pb-0 relative overflow-hidden">
      {/* Ambient neon orbs */}
      <div className="fixed top-[-25%] left-[-15%] w-[60vw] h-[60vw] bg-[rgba(0,240,255,0.04)] rounded-full blur-[180px] mix-blend-screen pointer-events-none"></div>
      <div className="fixed bottom-[-25%] right-[-15%] w-[60vw] h-[60vw] bg-[rgba(124,58,237,0.04)] rounded-full blur-[180px] mix-blend-screen pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar country={country} gameState={gameState} onSignOut={signOut} />

        {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-1 border-b border-[rgba(0,240,255,0.06)] mb-5 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-5 py-3.5 font-mono text-xs uppercase tracking-[3px] border-b-2 transition-all whitespace-nowrap duration-300
                ${activeTab === tab.id
                  ? 'text-neon-cyan border-neon-cyan'
                  : 'text-muted border-transparent hover:text-primary hover:border-[rgba(0,240,255,0.15)]'
                }
              `}
              style={activeTab === tab.id ? { textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' } : {}}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'trade' && incomingOffers.filter(o => o.status === 'pending').length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-neon-red text-white text-[10px] inline-flex items-center justify-center"
                  style={{ boxShadow: '0 0 10px rgba(255, 45, 91, 0.5)' }}
                >
                  {incomingOffers.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'nation' && (
          <div className="space-y-8 fade-in">
            {/* Resources Grid */}
            <section>
              <h2 className="font-heading text-lg text-primary tracking-[4px] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-gradient-to-r from-neon-cyan to-transparent" />
                Resources
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {resLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)
                  : resources.map(r => <ResourceCard key={r.id} resource={r} />)
                }
              </div>
            </section>

            {/* Food Status */}
            <section>
              <h2 className="font-heading text-lg text-primary tracking-[4px] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-gradient-to-r from-neon-lime to-transparent" />
                Food Status
              </h2>
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-muted tracking-wider">
                    🌾 Produced: <span className="text-primary">{country?.food_produced ?? 0}</span>
                  </span>
                  <span className="text-xs font-mono text-muted tracking-wider">
                    🍽️ Required: <span className="text-primary">{country?.food_req ?? 0}</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-base/60 rounded-full overflow-hidden border border-[rgba(0,240,255,0.06)]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${foodPct}%`,
                      background: foodBalance >= 0
                        ? 'linear-gradient(90deg, #39ff14, #00f0ff)'
                        : 'linear-gradient(90deg, #ff2d5b, #ff6b35)',
                      boxShadow: foodBalance >= 0
                        ? '0 0 15px rgba(57, 255, 20, 0.4)'
                        : '0 0 15px rgba(255, 45, 91, 0.4)',
                    }}
                  />
                </div>
                <div className="mt-2 text-[10px] font-mono text-right tracking-wider" style={{
                  color: foodBalance >= 0 ? '#39ff14' : '#ff2d5b',
                  textShadow: `0 0 8px ${foodBalance >= 0 ? 'rgba(57,255,20,0.4)' : 'rgba(255,45,91,0.4)'}`,
                }}>
                  {foodBalance >= 0 ? `+${foodBalance} surplus` : `${foodBalance} deficit ⚠`}
                </div>
              </Card>
            </section>

            {/* Industries */}
            <section>
              <h2 className="font-heading text-lg text-primary tracking-[4px] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-gradient-to-r from-neon-violet to-transparent" />
                Industries ({activeIndustries.length} active)
              </h2>
              {indLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-card/60 border border-[rgba(0,240,255,0.06)] rounded-2xl p-5 space-y-2">
                      <div className="skeleton h-4 w-40" />
                      <div className="skeleton h-3 w-24" />
                    </div>
                  ))}
                </div>
              ) : industries.length === 0 ? (
                <Card>
                  <p className="text-center text-muted font-mono text-xs py-4 tracking-wider">
                    No industries built yet. Go to the Crafting tab to build your first industry!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {industries.map(ind => (
                    <Card key={ind.id}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-heading text-xs text-primary tracking-[2px]">{ind.industry_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono text-muted tracking-wider">{ind.category}</span>
                            {!ind.is_active && (
                              <span className="text-[9px] font-mono text-neon-gold px-2 py-0.5 rounded-lg bg-[rgba(255,215,0,0.06)] border border-[rgba(255,215,0,0.15)]">
                                🔨 Building
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-mono text-neon-lime" style={{ textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
                          +{ind.income_per_round}/rd
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Income Summary */}
            <section>
              <h2 className="font-heading text-lg text-primary tracking-[4px] mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-gradient-to-r from-neon-gold to-transparent" />
                Round Income
              </h2>
              <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-base/40 rounded-xl border border-[rgba(57,255,20,0.06)]">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-[2px] block mb-1">Industry</span>
                    <div className="text-xl font-heading text-neon-lime tracking-wider" style={{ textShadow: '0 0 12px rgba(57,255,20,0.4)' }}>
                      +{formatGC(totalIncome)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-base/40 rounded-xl border border-[rgba(0,240,255,0.06)]">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-[2px] block mb-1">Base</span>
                    <div className="text-xl font-heading text-neon-cyan tracking-wider" style={{ textShadow: '0 0 12px rgba(0,240,255,0.4)' }}>
                      +{formatGC(country?.round_income ?? 0)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-base/40 rounded-xl border border-[rgba(0,240,255,0.06)]">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-[2px] block mb-1">Population</span>
                    <div className="text-xl font-heading text-primary tracking-wider">
                      👥 {country?.population ?? 0}M
                    </div>
                  </div>
                  <div className="text-center p-3 bg-base/40 rounded-xl border border-[rgba(255,215,0,0.06)]">
                    <span className="text-[9px] font-mono text-muted uppercase tracking-[2px] block mb-1">GC Balance</span>
                    <div className="text-xl font-heading text-neon-gold tracking-wider" style={{ textShadow: '0 0 12px rgba(255,215,0,0.4)' }}>
                      💰 {formatGC(country?.gc_balance ?? 0)}
                    </div>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        )}

        {activeTab === 'crafting' && (
          <Crafting
            country={country}
            resources={resources}
            industries={industries}
            gameState={gameState}
            onBuildComplete={() => { refetchResources(); }}
          />
        )}

        {activeTab === 'trade' && (
          <Trade
            country={country}
            allCountries={allCountries}
            resources={resources}
            gameState={gameState}
            incomingOffers={incomingOffers}
            sentOffers={sentOffers}
            onTradeAction={() => { refetchTrades(); refetchResources(); }}
          />
        )}

        {activeTab === 'world' && (
          <div className="space-y-5 fade-in">
            <h2 className="font-heading text-lg text-primary tracking-[4px] flex items-center gap-3">
              <span className="w-8 h-px bg-gradient-to-r from-neon-cyan to-transparent" />
              World Map
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {allCountries.map(c => (
                <Card key={c.id} hover>
                  <div className="text-center space-y-2">
                    <span className="text-3xl block">{c.flag_emoji}</span>
                    <h3 className="font-heading text-[10px] text-primary tracking-[2px]">{c.name}</h3>
                    <div className="text-[9px] font-mono text-muted tracking-wider">Tier {c.tier}</div>
                    <div className="text-[9px] font-mono text-muted tracking-wider">Pop: {c.population}M</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <BottomNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {/* Event overlay */}
        <EventOverlay event={currentEvent} onDismiss={() => setCurrentEvent(null)} />
      </div>
    </div>
  );
}
