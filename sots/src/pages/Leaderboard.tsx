import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { LeaderboardRow } from '../components/game/LeaderboardRow';
import { calculateScores } from '../lib/gameLogic';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import type { Resource, Industry, TradeOffer, LeaderboardEntry } from '../types';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [countriesRes, resourcesRes, industriesRes, tradesRes, gameRes] = await Promise.all([
        supabase.from('countries').select('*'),
        supabase.from('resources').select('*'),
        supabase.from('industries').select('*'),
        supabase.from('trade_offers').select('*'),
        supabase.from('game_state').select('*').eq('is_active', true).single(),
      ]);

      const countries = countriesRes.data || [];
      const resources = resourcesRes.data || [];
      const industries = industriesRes.data || [];
      const trades = tradesRes.data || [];

      if (gameRes.data) setRound(gameRes.data.current_round);

      const entries = countries.map(country => {
        const res = resources.filter((r: Resource) => r.country_id === country.id);
        const ind = industries.filter((i: Industry) => i.country_id === country.id);
        return calculateScores(country, res, ind, trades as TradeOffer[]);
      });
      entries.sort((a, b) => b.scores.total - a.scores.total);
      setLeaderboard(entries);
      setLastRefresh(new Date());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-base relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[rgba(0,240,255,0.03)] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[rgba(124,58,237,0.03)] rounded-full blur-[150px] pointer-events-none" />

      {/* Hero */}
      <header className="relative border-b border-[rgba(0,240,255,0.06)] bg-surface/40 backdrop-blur-xl py-10">
        {/* Bottom neon line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.3)] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="text-[9px] font-mono text-muted uppercase tracking-[6px] mb-3">
            Survival of the State
          </div>
          <h1
            className="font-heading text-4xl md:text-6xl text-neon-cyan tracking-[6px]"
            style={{ textShadow: '0 0 30px rgba(0, 240, 255, 0.4), 0 0 60px rgba(0, 240, 255, 0.2)' }}
          >
            Leaderboard
          </h1>
          <div className="flex items-center justify-center gap-4 mt-5">
            <div className="bg-card/60 border border-[rgba(0,240,255,0.08)] rounded-xl px-5 py-2.5 flex items-center gap-2">
              <span className="text-[9px] font-mono text-muted uppercase tracking-[2px]">Round</span>
              <span
                className="text-2xl font-heading text-neon-cyan tracking-wider"
                style={{ textShadow: '0 0 12px rgba(0, 240, 255, 0.5)' }}
              >
                {round}
              </span>
              <span className="text-xs font-mono text-muted">/20</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-muted/50 mt-3 tracking-[2px]">
            Auto-refreshes every 30s • Last: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Leaderboard table */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[rgba(0,240,255,0.1)] text-[10px] font-mono text-muted uppercase tracking-[3px]">
                <th className="px-3 py-3 text-left">Rank</th>
                <th className="px-3 py-3 text-left">Country</th>
                <th className="px-3 py-3 text-center">
                  <span className="text-neon-lime">Economic</span>
                </th>
                <th className="px-3 py-3 text-center">
                  <span className="text-neon-cyan">Sustain.</span>
                </th>
                <th className="px-3 py-3 text-center">
                  <span className="text-neon-gold">Diplomacy</span>
                </th>
                <th className="px-3 py-3 text-center">
                  <span className="text-neon-red">Social</span>
                </th>
                <th className="px-3 py-3 text-center">
                  <span className="text-primary">Resilience</span>
                </th>
                <th className="px-3 py-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                : leaderboard.map((entry, i) => (
                    <LeaderboardRow key={entry.country.id} entry={entry} rank={i + 1} />
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pillar descriptions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
          {[
            { name: 'Economic', color: '#39ff14', desc: 'GC balance + industry income + finance' },
            { name: 'Sustainability', color: '#00f0ff', desc: 'Food balance + energy production' },
            { name: 'Diplomacy', color: '#ffd700', desc: 'Trade agreements + influence' },
            { name: 'Social', color: '#ff2d5b', desc: 'Population + food security' },
            { name: 'Resilience', color: '#e8e6f0', desc: 'Resource diversity + technology' },
          ].map(pillar => (
            <div key={pillar.name} className="bg-card/60 border border-[rgba(0,240,255,0.06)] rounded-2xl p-4">
              <div
                className="text-[10px] font-mono uppercase tracking-[3px] mb-1.5"
                style={{ color: pillar.color, textShadow: `0 0 8px ${pillar.color}40` }}
              >
                {pillar.name}
              </div>
              <div className="text-[9px] font-mono text-muted/60 tracking-wider">{pillar.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
