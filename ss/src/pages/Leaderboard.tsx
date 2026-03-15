import { useEffect, useMemo, useState } from 'react'
import { LeaderboardRow } from '../components/game/LeaderboardRow'
import { Card } from '../components/ui/Card'
import { supabase } from '../lib/supabase'
import type { Country, TradeOffer } from '../types'

export const Leaderboard = () => {
  const [countries, setCountries] = useState<Country[]>([])
  const [trades, setTrades] = useState<TradeOffer[]>([])

  const fetchLeaderboardData = async () => {
    const [{ data: countriesData }, { data: tradesData }] = await Promise.all([
      supabase.from('countries').select('*').order('name'),
      supabase.from('trade_offers').select('*').eq('status', 'accepted'),
    ])
    setCountries((countriesData ?? []) as Country[])
    setTrades((tradesData ?? []) as TradeOffer[])
  }

  useEffect(() => {
    void fetchLeaderboardData()
    const interval = setInterval(fetchLeaderboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const scores = useMemo(
    () =>
      countries
        .map((country) => {
          const economic = Math.round(country.gc_balance / 10) + country.tier * 3
          const sustainability = Math.max(1, country.food_produced - country.food_req + 10)
          const diplomacy = trades.filter((trade) => trade.from_country_id === country.id || trade.to_country_id === country.id).length * 4
          const social = Math.max(1, Math.round(country.population / 2))
          const resilience = Math.round((economic + sustainability + social) / 3)
          const total = economic + sustainability + diplomacy + social + resilience
          return { country: `${country.flag_emoji} ${country.name}`, economic, sustainability, diplomacy, social, resilience, total }
        })
        .sort((a, b) => b.total - a.total),
    [countries, trades],
  )

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <Card className="overflow-x-auto">
        <h1 className="mb-4 font-heading text-5xl uppercase tracking-[0.1em] text-accent-lime">Live Leaderboard</h1>
        <table className="w-full min-w-[900px] text-left">
          <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
            <tr>
              <th className="p-2">Rank</th>
              <th className="p-2">Country</th>
              <th className="p-2">Economic</th>
              <th className="p-2">Sustainability</th>
              <th className="p-2">Diplomacy</th>
              <th className="p-2">Social</th>
              <th className="p-2">Resilience</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((row, index) => (
              <LeaderboardRow
                key={row.country}
                rank={index + 1}
                country={row.country}
                scores={{
                  economic: row.economic,
                  sustainability: row.sustainability,
                  diplomacy: row.diplomacy,
                  social: row.social,
                  resilience: row.resilience,
                  total: row.total,
                }}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </main>
  )
}
