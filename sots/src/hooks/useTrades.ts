import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { TradeOffer } from '../types';

export function useTrades(countryId: string | undefined) {
  const [incomingOffers, setIncomingOffers] = useState<TradeOffer[]>([]);
  const [sentOffers, setSentOffers] = useState<TradeOffer[]>([]);
  const [allTrades, setAllTrades] = useState<TradeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastCallback = useRef<((offer: TradeOffer) => void) | null>(null);

  const fetchTrades = useCallback(async () => {
    if (!countryId) return;
    try {
      // Incoming offers
      const { data: incoming, error: inErr } = await supabase
        .from('trade_offers')
        .select('*, from_country:countries!trade_offers_from_country_id_fkey(*), to_country:countries!trade_offers_to_country_id_fkey(*)')
        .eq('to_country_id', countryId)
        .order('created_at', { ascending: false });
      if (inErr) throw inErr;

      // Sent offers
      const { data: sent, error: sentErr } = await supabase
        .from('trade_offers')
        .select('*, from_country:countries!trade_offers_from_country_id_fkey(*), to_country:countries!trade_offers_to_country_id_fkey(*)')
        .eq('from_country_id', countryId)
        .order('created_at', { ascending: false });
      if (sentErr) throw sentErr;

      setIncomingOffers(incoming || []);
      setSentOffers(sent || []);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch trades';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  const fetchAllTrades = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('trade_offers')
        .select('*, from_country:countries!trade_offers_from_country_id_fkey(*), to_country:countries!trade_offers_to_country_id_fkey(*)')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setAllTrades(data || []);
    } catch {
      // silent fail for admin view
    }
  }, []);

  useEffect(() => {
    fetchTrades();

    if (!countryId) return;

    const channel = supabase
      .channel(`trades_${countryId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trade_offers' },
        (payload) => {
          const offer = payload.new as TradeOffer;
          // Notify if new incoming offer
          if (payload.eventType === 'INSERT' && offer.to_country_id === countryId) {
            toastCallback.current?.(offer);
          }
          // Refresh all trades
          fetchTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [countryId, fetchTrades]);

  const setOnNewOffer = (cb: (offer: TradeOffer) => void) => {
    toastCallback.current = cb;
  };

  return {
    incomingOffers,
    sentOffers,
    allTrades,
    loading,
    error,
    refetch: fetchTrades,
    fetchAllTrades,
    setOnNewOffer,
  };
}
