import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TradeOffer } from '../types'

export const useTrades = (countryId?: string) => {
  const [trades, setTrades] = useState<TradeOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTradeToast, setNewTradeToast] = useState<string | null>(null)

  useEffect(() => {
    if (!countryId) {
      setLoading(false)
      return
    }
    let active = true

    const fetchTrades = async () => {
      const { data, error: tradesError } = await supabase
        .from('trade_offers')
        .select('*')
        .or(`from_country_id.eq.${countryId},to_country_id.eq.${countryId}`)
        .order('created_at', { ascending: false })
      if (!active) return
      if (tradesError) setError(tradesError.message)
      setTrades((data ?? []) as TradeOffer[])
      setLoading(false)
    }

    fetchTrades()

    const channel = supabase
      .channel(`trade_offers_${countryId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trade_offers' }, async (payload) => {
        const inserted = payload.new as TradeOffer
        if (inserted.to_country_id === countryId) {
          const { data } = await supabase.from('countries').select('name').eq('id', inserted.from_country_id).maybeSingle()
          setNewTradeToast(`🤝 New trade offer from ${data?.name ?? 'another country'}!`)
          setTimeout(() => setNewTradeToast(null), 3500)
        }
        fetchTrades()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trade_offers' }, fetchTrades)
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [countryId])

  const incoming = useMemo(
    () => trades.filter((trade) => trade.to_country_id === countryId && trade.status === 'pending'),
    [countryId, trades],
  )
  const sent = useMemo(() => trades.filter((trade) => trade.from_country_id === countryId), [countryId, trades])

  return { trades, incoming, sent, loading, error, newTradeToast, setTrades }
}
