import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { TradeOfferCard } from '../components/game/TradeOfferCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Tabs } from '../components/ui/Tabs'
import { Toast } from '../components/ui/Toast'
import { useCountry } from '../hooks/useCountry'
import { useGameState } from '../hooks/useGameState'
import { useTrades } from '../hooks/useTrades'
import { optimisticTradeUpdate, phaseCountdownHint, summarizeTradeSide } from '../lib/gameLogic'
import { supabase } from '../lib/supabase'
import type { Country, ResourceType, TradeOffer, TradeSide } from '../types'

const resourceOptions: ResourceType[] = [
  'Manpower',
  'Energy',
  'Food',
  'Technology',
  'Finance',
  'Minerals',
  'Manufacturing',
  'Influence',
]

export const Trade = () => {
  const { country } = useCountry()
  const { gameState } = useGameState()
  const { incoming, sent, loading, newTradeToast, setTrades } = useTrades(country?.id)

  const [countries, setCountries] = useState<Country[]>([])
  const [tradeTab, setTradeTab] = useState('propose')
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterTarget, setCounterTarget] = useState<TradeOffer | null>(null)

  const [toCountryId, setToCountryId] = useState('')
  const [offerResource, setOfferResource] = useState<ResourceType | ''>('')
  const [offerQty, setOfferQty] = useState<number>(0)
  const [offerGc, setOfferGc] = useState<number>(0)
  const [wantResource, setWantResource] = useState<ResourceType | ''>('')
  const [wantQty, setWantQty] = useState<number>(0)
  const [wantGc, setWantGc] = useState<number>(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await supabase.from('countries').select('*').order('name')
      setCountries((data ?? []) as Country[])
    }
    void fetchCountries()
  }, [])

  const counterpartCountries = useMemo(() => countries.filter((c) => c.id !== country?.id), [countries, country?.id])
  const isDiplomacyPhase = gameState?.phase === 'diplomacy'

  const clearForm = () => {
    setOfferResource('')
    setOfferQty(0)
    setOfferGc(0)
    setWantResource('')
    setWantQty(0)
    setWantGc(0)
    setMessage('')
  }

  const buildTradeSide = (resource: ResourceType | '', qty: number, gc: number): TradeSide => ({
    resource: resource || undefined,
    qty: qty > 0 ? qty : undefined,
    gc: gc > 0 ? gc : undefined,
  })

  const submitTrade = async (event: FormEvent) => {
    event.preventDefault()
    if (!country || !toCountryId) return
    const offering = buildTradeSide(offerResource, offerQty, offerGc)
    const requesting = buildTradeSide(wantResource, wantQty, wantGc)

    await supabase.from('trade_offers').insert({
      from_country_id: country.id,
      to_country_id: toCountryId,
      round_number: gameState?.current_round ?? 1,
      status: 'pending',
      offering_json: offering,
      requesting_json: requesting,
      message: message.slice(0, 100),
    })
    clearForm()
  }

  const applyStatus = async (tradeId: string, status: TradeOffer['status']) => {
    setTrades((current) => optimisticTradeUpdate(current, tradeId, status))
    const { error } = await supabase
      .from('trade_offers')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', tradeId)
    if (error) {
      const { data } = await supabase.from('trade_offers').select('*').order('created_at', { ascending: false })
      setTrades((data ?? []) as TradeOffer[])
    }
  }

  const acceptTrade = async (tradeId: string) => {
    setTrades((current) => optimisticTradeUpdate(current, tradeId, 'accepted'))
    const { error } = await supabase.rpc('execute_trade', { trade_id: tradeId })
    if (error) {
      const { data } = await supabase.from('trade_offers').select('*').order('created_at', { ascending: false })
      setTrades((data ?? []) as TradeOffer[])
    }
  }

  const counterTrade = async (baseTrade: TradeOffer) => {
    if (!country) return
    await supabase.from('trade_offers').insert({
      from_country_id: country.id,
      to_country_id: baseTrade.from_country_id,
      round_number: gameState?.current_round ?? 1,
      status: 'pending',
      offering_json: baseTrade.requesting_json,
      requesting_json: baseTrade.offering_json,
      message: `Counter: ${baseTrade.message ?? ''}`.slice(0, 100),
    })
    await applyStatus(baseTrade.id, 'countered')
    setCounterOpen(false)
  }

  return (
    <div className="space-y-4">
      {newTradeToast && <Toast message={newTradeToast} />}
      <Tabs
        tabs={[
          { id: 'propose', label: 'Propose Trade' },
          { id: 'incoming', label: 'Incoming Offers' },
          { id: 'sent', label: 'My Sent Offers' },
        ]}
        activeTab={tradeTab}
        onChange={setTradeTab}
        compact
      />

      {tradeTab === 'propose' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-2xl uppercase tracking-[0.1em]">Trade Proposal</h3>
            <p className="text-xs text-text-muted">{phaseCountdownHint(gameState?.phase ?? 'paused')}</p>
          </div>
          <form className="grid gap-3" onSubmit={submitTrade}>
            <select
              className="rounded-sm border border-border bg-surface p-2 text-sm"
              value={toCountryId}
              onChange={(event) => setToCountryId(event.target.value)}
              required
            >
              <option value="">Send to...</option>
              {counterpartCountries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.flag_emoji} {item.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="space-y-2 bg-surface">
                <p className="text-xs uppercase tracking-[0.2em] text-accent-cyan">I Offer</p>
                <select className="w-full rounded-sm border border-border bg-base p-2 text-sm" value={offerResource} onChange={(event) => setOfferResource(event.target.value as ResourceType | '')}>
                  <option value="">Resource</option>
                  {resourceOptions.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
                <input className="w-full rounded-sm border border-border bg-base p-2 text-sm" type="number" min={0} value={offerQty} onChange={(event) => setOfferQty(Number(event.target.value))} placeholder="Qty" />
                <input className="w-full rounded-sm border border-border bg-base p-2 text-sm" type="number" min={0} value={offerGc} onChange={(event) => setOfferGc(Number(event.target.value))} placeholder="GC" />
              </Card>
              <Card className="space-y-2 bg-surface">
                <p className="text-xs uppercase tracking-[0.2em] text-accent-lime">I Want</p>
                <select className="w-full rounded-sm border border-border bg-base p-2 text-sm" value={wantResource} onChange={(event) => setWantResource(event.target.value as ResourceType | '')}>
                  <option value="">Resource</option>
                  {resourceOptions.map((resource) => (
                    <option key={resource} value={resource}>
                      {resource}
                    </option>
                  ))}
                </select>
                <input className="w-full rounded-sm border border-border bg-base p-2 text-sm" type="number" min={0} value={wantQty} onChange={(event) => setWantQty(Number(event.target.value))} placeholder="Qty" />
                <input className="w-full rounded-sm border border-border bg-base p-2 text-sm" type="number" min={0} value={wantGc} onChange={(event) => setWantGc(Number(event.target.value))} placeholder="GC" />
              </Card>
            </div>
            <input
              className="rounded-sm border border-border bg-surface p-2 text-sm"
              placeholder="Optional message (max 100)"
              maxLength={100}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Card className="bg-surface text-sm">
              <p className="font-data text-xs uppercase tracking-[0.2em] text-text-muted">Preview</p>
              <p className="mt-2">Offer: {summarizeTradeSide(buildTradeSide(offerResource, offerQty, offerGc))}</p>
              <p>Request: {summarizeTradeSide(buildTradeSide(wantResource, wantQty, wantGc))}</p>
            </Card>
            <Button disabled={!isDiplomacyPhase}>Send</Button>
          </form>
        </Card>
      )}

      {tradeTab === 'incoming' && (
        <div className="space-y-3">
          {loading && <Card>Loading offers...</Card>}
          {incoming.map((trade) => {
            const sender = countries.find((countryItem) => countryItem.id === trade.from_country_id)
            return (
              <TradeOfferCard
                key={trade.id}
                trade={trade}
                senderLabel={`${sender?.flag_emoji ?? '🏳️'} ${sender?.name ?? 'Unknown'}`}
                onAccept={() => void acceptTrade(trade.id)}
                onReject={() => void applyStatus(trade.id, 'rejected')}
                onCounter={() => {
                  setCounterTarget(trade)
                  setCounterOpen(true)
                }}
              />
            )
          })}
        </div>
      )}

      {tradeTab === 'sent' && (
        <div className="space-y-3">
          {sent.map((trade) => {
            const target = countries.find((countryItem) => countryItem.id === trade.to_country_id)
            return (
              <TradeOfferCard
                key={trade.id}
                trade={trade}
                senderLabel={`To: ${target?.flag_emoji ?? '🏳️'} ${target?.name ?? 'Unknown'}`}
                onCancel={trade.status === 'pending' ? () => void applyStatus(trade.id, 'cancelled') : undefined}
              />
            )
          })}
        </div>
      )}

      <Modal open={counterOpen} onClose={() => setCounterOpen(false)} title="Counter Offer">
        <p className="text-sm text-text-muted">Creates a reversed pending offer and marks original offer as countered.</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => (counterTarget ? void counterTrade(counterTarget) : undefined)}>Send Counter</Button>
          <Button variant="secondary" onClick={() => setCounterOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}
