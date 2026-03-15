import { useEffect, useMemo, useState } from 'react'
import { EventOverlay } from '../components/game/EventOverlay'
import { PhaseIndicator } from '../components/game/PhaseIndicator'
import { ResourceCard } from '../components/game/ResourceCard'
import { BottomNav } from '../components/layout/BottomNav'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { useCountry } from '../hooks/useCountry'
import { useGameState } from '../hooks/useGameState'
import { useResources } from '../hooks/useResources'
import { formatGc } from '../lib/gameLogic'
import { supabase } from '../lib/supabase'
import type { EventLog } from '../types'
import { Crafting } from './Crafting'
import { Trade } from './Trade'

const dashboardTabs = [
  { id: 'nation', label: 'My Nation' },
  { id: 'crafting', label: 'Crafting' },
  { id: 'trade', label: 'Trade' },
  { id: 'map', label: 'World Map' },
]

export const Dashboard = () => {
  const { country, loading: countryLoading } = useCountry()
  const { gameState, loading: gameLoading } = useGameState()
  const { resources, loading: resourcesLoading } = useResources(country?.id)
  const [tab, setTab] = useState('nation')
  const [eventOverlay, setEventOverlay] = useState<EventLog | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('player_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_log' }, (payload) => {
        setEventOverlay(payload.new as EventLog)
        setTimeout(() => setEventOverlay(null), 5000)
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  const foodPercent = useMemo(() => {
    if (!country) return 0
    return Math.min(100, Math.round((country.food_produced / Math.max(1, country.food_req)) * 100))
  }, [country])

  const renderNationTab = () => {
    if (countryLoading || gameLoading || resourcesLoading) {
      return (
        <div className="grid gap-3 md:grid-cols-4">
          {[...Array.from({ length: 8 })].map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      )
    }
    if (!country) return <Card>No country linked to this login.</Card>

    return (
      <div className="space-y-4 pb-16 md:pb-0">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl uppercase tracking-[0.1em]">
              {country.flag_emoji} {country.name}
            </h1>
            <p className="font-data text-xs uppercase tracking-[0.2em] text-text-muted">Round {gameState?.current_round ?? 1}</p>
          </div>
          <div className="space-y-2 text-right">
            <PhaseIndicator phase={gameState?.phase ?? 'paused'} />
            <p className="font-data text-lg text-accent-cyan">GC {formatGc(country.gc_balance)}</p>
          </div>
        </Card>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </section>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-data text-xs uppercase tracking-[0.2em] text-text-muted">Food Status</p>
            <Badge className={foodPercent >= 100 ? 'border-green-400/40 bg-green-500/20 text-green-300' : 'border-red-400/40 bg-red-500/20 text-red-300'}>
              {foodPercent >= 100 ? 'Stable' : 'Shortage'}
            </Badge>
          </div>
          <div className="h-3 rounded bg-surface">
            <div className="h-3 rounded bg-accent-lime" style={{ width: `${foodPercent}%` }} />
          </div>
          <p className="text-xs text-text-muted">
            Produced {country.food_produced} / Required {country.food_req}
          </p>
        </Card>
      </div>
    )
  }

  const renderTab = () => {
    if (tab === 'nation') return renderNationTab()
    if (tab === 'crafting') return <Crafting />
    if (tab === 'trade') return <Trade />
    return (
      <Card className="space-y-3">
        <h2 className="font-heading text-3xl uppercase tracking-[0.1em]">World Map</h2>
        <div className="grid place-items-center rounded border border-border bg-surface p-6">
          <p className="text-sm text-text-muted">Map layer placeholder with country connectors and diplomacy lines.</p>
        </div>
      </Card>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-4 md:py-6">
      <EventOverlay eventItem={eventOverlay} />
      <div className="mb-4 hidden gap-2 md:grid md:grid-cols-4">
        {dashboardTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`rounded-sm border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
              tab === item.id ? 'border-accent-cyan bg-accent-cyan/20 text-accent-cyan' : 'border-border bg-surface text-text-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {renderTab()}
      <BottomNav items={dashboardTabs} activeId={tab} onSelect={setTab} />
    </main>
  )
}
