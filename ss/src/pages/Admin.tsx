import { useEffect, useMemo, useState } from 'react'
import { EventOverlay } from '../components/game/EventOverlay'
import { LeaderboardRow } from '../components/game/LeaderboardRow'
import { AdminSidebar } from '../components/layout/AdminSidebar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { useGameState } from '../hooks/useGameState'
import { PHASE_ORDER } from '../lib/constants'
import { supabase } from '../lib/supabase'
import type { Country, EventLog, TradeOffer } from '../types'

const adminSections = ['Game Control', 'Countries', 'Trade Monitor', 'Events', 'Leaderboard']
const eventCards = [
  { type: 'Pandemic', description: 'Population hit and higher food pressure.' },
  { type: 'Financial Crisis', description: 'Global GC contraction.' },
  { type: 'Drought', description: 'Food production reduced.' },
  { type: 'Tech Boom', description: 'Technology and finance surge.' },
  { type: 'Climate Disaster', description: 'Random infrastructure loss.' },
  { type: 'Conflict', description: 'Trade disruption and sanctions.' },
  { type: 'Trade Boom', description: 'Temporary trade gains.' },
]

export const Admin = () => {
  const { gameState } = useGameState()
  const [section, setSection] = useState(adminSections[0])
  const [countries, setCountries] = useState<Country[]>([])
  const [trades, setTrades] = useState<TradeOffer[]>([])
  const [events, setEvents] = useState<EventLog[]>([])
  const [selectedEvent, setSelectedEvent] = useState<(typeof eventCards)[number] | null>(null)
  const [overlayEvent, setOverlayEvent] = useState<EventLog | null>(null)

  const fetchAdminData = async () => {
    const [{ data: countriesData }, { data: tradesData }, { data: eventsData }] = await Promise.all([
      supabase.from('countries').select('*').order('name'),
      supabase.from('trade_offers').select('*').order('created_at', { ascending: false }).limit(30),
      supabase.from('event_log').select('*').order('created_at', { ascending: false }).limit(20),
    ])
    setCountries((countriesData ?? []) as Country[])
    setTrades((tradesData ?? []) as TradeOffer[])
    setEvents((eventsData ?? []) as EventLog[])
  }

  useEffect(() => {
    void fetchAdminData()
    const channel = supabase
      .channel('admin_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_log' }, (payload) => {
        const inserted = payload.new as EventLog
        setOverlayEvent(inserted)
        setTimeout(() => setOverlayEvent(null), 5000)
        fetchAdminData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trade_offers' }, fetchAdminData)
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const nextPhase = () => {
    if (!gameState) return
    const currentIndex = PHASE_ORDER.indexOf(gameState.phase)
    const phase = currentIndex === PHASE_ORDER.length - 1 ? 'income' : PHASE_ORDER[currentIndex + 1]
    const round = phase === 'income' ? gameState.current_round + 1 : gameState.current_round
    void supabase.from('game_state').update({ phase, current_round: round }).eq('id', gameState.id)
  }

  const triggerEvent = async () => {
    if (!selectedEvent || !gameState) return
    await supabase.from('event_log').insert({
      round_number: gameState.current_round,
      event_type: selectedEvent.type,
      description: selectedEvent.description,
      affected_countries: countries.slice(0, 5).map((item) => item.name),
    })
    setSelectedEvent(null)
  }

  const leaderboard = useMemo(
    () =>
      countries
        .map((country) => {
          const economic = Math.round(country.gc_balance / 10) + country.tier * 3
          const sustainability = Math.max(1, country.food_produced - country.food_req + 10)
          const diplomacy = trades.filter((trade) => trade.status === 'accepted' && (trade.from_country_id === country.id || trade.to_country_id === country.id)).length * 4
          const social = Math.max(1, Math.round(country.population / 2))
          const resilience = Math.round((economic + sustainability + social) / 3)
          const total = economic + sustainability + diplomacy + social + resilience
          return { country: country.name, economic, sustainability, diplomacy, social, resilience, total }
        })
        .sort((a, b) => b.total - a.total),
    [countries, trades],
  )

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-[240px_1fr]">
      <EventOverlay eventItem={overlayEvent} />
      <AdminSidebar sections={adminSections} active={section} onSelect={setSection} />
      <section className="space-y-4">
        {section === 'Game Control' && (
          <Card className="space-y-4">
            <h1 className="font-heading text-4xl uppercase tracking-[0.1em]">Game Control Panel</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-accent-lime/40 bg-accent-lime/20 text-accent-lime">Round {gameState?.current_round ?? 1}</Badge>
              <Badge className="border-accent-cyan/40 bg-accent-cyan/20 text-accent-cyan">{gameState?.phase ?? 'paused'}</Badge>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <Button onClick={nextPhase}>Next Phase</Button>
              <Button variant="secondary" onClick={() => void supabase.from('game_state').update({ is_active: true, started_at: new Date().toISOString() }).eq('id', gameState?.id)}>
                Start Game
              </Button>
              <Button variant="secondary" onClick={() => void supabase.from('game_state').update({ phase: 'paused' }).eq('id', gameState?.id)}>
                Pause Game
              </Button>
              <Button variant="danger" onClick={() => void supabase.from('game_state').update({ is_active: false, phase: 'paused' }).eq('id', gameState?.id)}>
                End Game
              </Button>
            </div>
          </Card>
        )}

        {section === 'Countries' && (
          <Card className="overflow-x-auto">
            <h2 className="mb-3 font-heading text-3xl uppercase tracking-[0.1em]">All Countries Overview</h2>
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="p-2">Country</th>
                  <th className="p-2">GC</th>
                  <th className="p-2">Food</th>
                  <th className="p-2">Population</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => (
                  <tr key={country.id} className="border-b border-border">
                    <td className="p-2">
                      {country.flag_emoji} {country.name}
                    </td>
                    <td className="p-2">{country.gc_balance.toLocaleString()}</td>
                    <td className="p-2">
                      {country.food_produced}/{country.food_req}
                    </td>
                    <td className="p-2">{country.population}</td>
                    <td className="p-2">{country.food_produced >= country.food_req ? 'OK' : 'SHORTAGE'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {section === 'Trade Monitor' && (
          <Card className="space-y-3">
            <h2 className="font-heading text-3xl uppercase tracking-[0.1em]">Trade Monitor</h2>
            {trades.map((trade) => (
              <div key={trade.id} className="rounded border border-border bg-surface p-3 text-sm">
                <p>
                  Round {trade.round_number} • {trade.status}
                </p>
                <Button
                  className="mt-2"
                  variant="danger"
                  onClick={() => void supabase.from('trade_offers').update({ status: 'voided', responded_at: new Date().toISOString() }).eq('id', trade.id)}
                >
                  Void Trade
                </Button>
              </div>
            ))}
          </Card>
        )}

        {section === 'Events' && (
          <Card className="space-y-3">
            <h2 className="font-heading text-3xl uppercase tracking-[0.1em]">Event Cards</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {eventCards.map((eventCard) => (
                <Card key={eventCard.type} className="bg-surface">
                  <h3 className="font-heading text-2xl uppercase tracking-[0.1em]">{eventCard.type}</h3>
                  <p className="mt-1 text-sm text-text-muted">{eventCard.description}</p>
                  <Button className="mt-3" onClick={() => setSelectedEvent(eventCard)}>
                    Trigger
                  </Button>
                </Card>
              ))}
            </div>
            <p className="text-xs text-text-muted">Recent events: {events.length}</p>
          </Card>
        )}

        {section === 'Leaderboard' && (
          <Card className="overflow-x-auto">
            <h2 className="mb-3 font-heading text-3xl uppercase tracking-[0.1em]">Live Leaderboard</h2>
            <table className="w-full min-w-[820px] text-left">
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
                {leaderboard.map((item, index) => (
                  <LeaderboardRow
                    key={item.country}
                    rank={index + 1}
                    country={item.country}
                    scores={{
                      economic: item.economic,
                      sustainability: item.sustainability,
                      diplomacy: item.diplomacy,
                      social: item.social,
                      resilience: item.resilience,
                      total: item.total,
                    }}
                  />
                ))}
              </tbody>
            </table>
            <Button className="mt-3" variant="secondary">
              Export PDF
            </Button>
          </Card>
        )}
      </section>
      <Modal open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} title="Confirm Event Trigger">
        <p className="text-sm text-text-muted">{selectedEvent?.type}</p>
        <p className="text-sm text-text-muted">{selectedEvent?.description}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => void triggerEvent()}>Confirm</Button>
          <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </main>
  )
}
