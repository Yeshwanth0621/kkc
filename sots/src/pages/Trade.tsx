import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { TradeOfferCard } from '../components/game/TradeOfferCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useMarket } from '../hooks/useMarket';
import { MarketPostCard } from '../components/game/MarketPostCard';
import { RESOURCE_CONFIG, RESOURCE_TYPES, formatGC } from '../lib/constants';
import { validateTrade } from '../lib/gameLogic';
import type { Country, Resource, GameState, TradeOffer, ResourceType, TradePayload, MarketPost } from '../types';

interface TradeProps {
  country: Country | null;
  allCountries: Country[];
  resources: Resource[];
  gameState: GameState | null;
  incomingOffers: TradeOffer[];
  sentOffers: TradeOffer[];
  onTradeAction: () => void;
}

export function Trade({ country, allCountries, resources, gameState, incomingOffers, sentOffers, onTradeAction }: TradeProps) {
  const { addToast } = useToast();
  const { openPosts, myPosts, refetch: refetchMarket } = useMarket(country?.id);
  const [subTab, setSubTab] = useState<'marketplace' | 'propose' | 'incoming' | 'sent'>('marketplace');
  const [loading, setLoading] = useState(false);

  // Propose state
  const [toCountryId, setToCountryId] = useState('');
  const [offerResource, setOfferResource] = useState<ResourceType | ''>('');
  const [offerQty, setOfferQty] = useState(0);
  const [offerGC, setOfferGC] = useState(0);
  const [wantResource, setWantResource] = useState<ResourceType | ''>('');
  const [wantQty, setWantQty] = useState(0);
  const [wantGC, setWantGC] = useState(0);
  const [message, setMessage] = useState('');

  // Counter modal
  const [counterOffer, setCounterOffer] = useState<TradeOffer | null>(null);
  const [counterOfferResource, setCounterOfferResource] = useState<ResourceType | ''>('');
  const [counterOfferQty, setCounterOfferQty] = useState(0);
  const [counterOfferGC, setCounterOfferGC] = useState(0);
  const [counterWantResource, setCounterWantResource] = useState<ResourceType | ''>('');
  const [counterWantQty, setCounterWantQty] = useState(0);
  const [counterWantGC, setCounterWantGC] = useState(0);
  const [counterMessage, setCounterMessage] = useState('');

  // Market post state
  const [marketOfferResource, setMarketOfferResource] = useState<ResourceType | ''>('');
  const [marketOfferQty, setMarketOfferQty] = useState(0);
  const [marketOfferGC, setMarketOfferGC] = useState(0);
  const [marketWantResource, setMarketWantResource] = useState<ResourceType | ''>('');
  const [marketWantQty, setMarketWantQty] = useState(0);
  const [marketWantGC, setMarketWantGC] = useState(0);
  const [marketMessage, setMarketMessage] = useState('');

  const otherCountries = allCountries.filter(c => c.id !== country?.id);
  const isDiplomacyPhase = gameState?.phase === 'diplomacy';

  const pendingIncoming = incomingOffers.filter(o => o.status === 'pending');
  const historyIncoming = incomingOffers.filter(o => o.status !== 'pending');

  const handlePropose = async () => {
    if (!country || !gameState) return;

    const offering: TradePayload = {};
    const requesting: TradePayload = {};

    if (offerResource) { offering.resource = offerResource; offering.qty = offerQty; }
    if (offerGC > 0) offering.gc = offerGC;
    if (wantResource) { requesting.resource = wantResource; requesting.qty = wantQty; }
    if (wantGC > 0) requesting.gc = wantGC;

    const validation = validateTrade({ offering_json: offering, requesting_json: requesting }, resources, country);
    if (!validation.valid) {
      addToast(validation.reason, 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('trade_offers').insert({
        from_country_id: country.id,
        to_country_id: toCountryId,
        round_number: gameState.current_round,
        status: 'pending',
        offering_json: offering,
        requesting_json: requesting,
        message,
      });
      if (error) throw error;

      addToast('Trade offer sent!', 'success', '📤');
      // Reset form
      setToCountryId('');
      setOfferResource('');
      setOfferQty(0);
      setOfferGC(0);
      setWantResource('');
      setWantQty(0);
      setWantGC(0);
      setMessage('');
      onTradeAction();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send trade';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offer: TradeOffer) => {
    setLoading(true);
    try {
      // Execute trade: call RPC or do client-side
      // Deduct from sender (offering) and add to receiver
      const { offering_json, requesting_json } = offer;

      // Update sender's resources (subtract offering, add requesting)
      if (offering_json.resource && offering_json.qty) {
        const fromRes = await supabase.from('resources')
          .select('*').eq('country_id', offer.from_country_id).eq('resource_type', offering_json.resource).single();
        const toRes = await supabase.from('resources')
          .select('*').eq('country_id', offer.to_country_id).eq('resource_type', offering_json.resource).single();

        if (fromRes.data) {
          await supabase.from('resources').update({ quantity: fromRes.data.quantity - offering_json.qty }).eq('id', fromRes.data.id);
        }
        if (toRes.data) {
          await supabase.from('resources').update({ quantity: toRes.data.quantity + offering_json.qty }).eq('id', toRes.data.id);
        }
      }

      if (requesting_json.resource && requesting_json.qty) {
        const fromRes = await supabase.from('resources')
          .select('*').eq('country_id', offer.to_country_id).eq('resource_type', requesting_json.resource).single();
        const toRes = await supabase.from('resources')
          .select('*').eq('country_id', offer.from_country_id).eq('resource_type', requesting_json.resource).single();

        if (fromRes.data) {
          await supabase.from('resources').update({ quantity: fromRes.data.quantity - requesting_json.qty }).eq('id', fromRes.data.id);
        }
        if (toRes.data) {
          await supabase.from('resources').update({ quantity: toRes.data.quantity + requesting_json.qty }).eq('id', toRes.data.id);
        }
      }

      // Handle GC transfers
      if (offering_json.gc) {
        const fromCountry = allCountries.find(c => c.id === offer.from_country_id);
        const toCntry = allCountries.find(c => c.id === offer.to_country_id);
        if (fromCountry) await supabase.from('countries').update({ gc_balance: fromCountry.gc_balance - offering_json.gc }).eq('id', fromCountry.id);
        if (toCntry) await supabase.from('countries').update({ gc_balance: toCntry.gc_balance + offering_json.gc }).eq('id', toCntry.id);
      }
      if (requesting_json.gc) {
        const fromCountry = allCountries.find(c => c.id === offer.to_country_id);
        const toCntry = allCountries.find(c => c.id === offer.from_country_id);
        if (fromCountry) await supabase.from('countries').update({ gc_balance: fromCountry.gc_balance - requesting_json.gc }).eq('id', fromCountry.id);
        if (toCntry) await supabase.from('countries').update({ gc_balance: toCntry.gc_balance + requesting_json.gc }).eq('id', toCntry.id);
      }

      // Update trade status
      await supabase.from('trade_offers').update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      }).eq('id', offer.id);

      addToast('Trade accepted! Resources exchanged.', 'success', '✅');
      onTradeAction();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Trade failed';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (offerId: string) => {
    await supabase.from('trade_offers').update({
      status: 'rejected',
      responded_at: new Date().toISOString(),
    }).eq('id', offerId);
    addToast('Trade rejected', 'info');
    onTradeAction();
  };

  const handleCancel = async (offerId: string) => {
    await supabase.from('trade_offers').delete().eq('id', offerId);
    addToast('Trade cancelled', 'info');
    onTradeAction();
  };

  const handleCounterSubmit = async () => {
    if (!counterOffer || !country || !gameState) return;
    setLoading(true);
    try {
      await supabase.from('trade_offers').update({
        status: 'countered',
        responded_at: new Date().toISOString(),
      }).eq('id', counterOffer.id);

      const offering: TradePayload = {};
      const requesting: TradePayload = {};
      if (counterOfferResource) { offering.resource = counterOfferResource; offering.qty = counterOfferQty; }
      if (counterOfferGC > 0) offering.gc = counterOfferGC;
      if (counterWantResource) { requesting.resource = counterWantResource; requesting.qty = counterWantQty; }
      if (counterWantGC > 0) requesting.gc = counterWantGC;

      await supabase.from('trade_offers').insert({
        from_country_id: country.id,
        to_country_id: counterOffer.from_country_id,
        round_number: gameState.current_round,
        status: 'pending',
        offering_json: offering,
        requesting_json: requesting,
        message: counterMessage || 'Counter offer',
      });

      addToast('Counter offer sent!', 'success', '🔄');
      setCounterOffer(null);
      onTradeAction();
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Counter failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!country || !gameState) return;
    const offering: TradePayload = {};
    const requesting: TradePayload = {};
    if (marketOfferResource) { offering.resource = marketOfferResource; offering.qty = marketOfferQty; }
    if (marketOfferGC > 0) offering.gc = marketOfferGC;
    if (marketWantResource) { requesting.resource = marketWantResource; requesting.qty = marketWantQty; }
    if (marketWantGC > 0) requesting.gc = marketWantGC;

    const validation = validateTrade({ offering_json: offering, requesting_json: requesting }, resources, country);
    if (!validation.valid) { addToast(validation.reason, 'error'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('market_posts').insert({
        from_country_id: country.id,
        round_number: gameState.current_round,
        status: 'open',
        offering_json: offering,
        requesting_json: requesting,
        message: marketMessage,
      });
      if (error) throw error;
      addToast('Market post published!', 'success', '📢');
      setMarketOfferResource(''); setMarketOfferQty(0); setMarketOfferGC(0);
      setMarketWantResource(''); setMarketWantQty(0); setMarketWantGC(0);
      setMarketMessage('');
      refetchMarket();
      onTradeAction();
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Failed to post', 'error');
    } finally { setLoading(false); }
  };

  const handleAcceptMarketPost = async (post: MarketPost) => {
    if (!country) return;
    setLoading(true);
    try {
      const { offering_json, requesting_json } = post;
      
      // Need to make sure WE have what THEY are requesting
      const validation = validateTrade({ offering_json: requesting_json, requesting_json: offering_json }, resources, country);
      if (!validation.valid) { addToast(validation.reason, 'error'); return; }

      // Exchange resources
      if (offering_json.resource && offering_json.qty) {
        const fromRes = await supabase.from('resources').select('*').eq('country_id', post.from_country_id).eq('resource_type', offering_json.resource).single();
        const toRes = await supabase.from('resources').select('*').eq('country_id', country.id).eq('resource_type', offering_json.resource).single();
        if (fromRes.data) await supabase.from('resources').update({ quantity: fromRes.data.quantity - offering_json.qty }).eq('id', fromRes.data.id);
        if (toRes.data) await supabase.from('resources').update({ quantity: toRes.data.quantity + offering_json.qty }).eq('id', toRes.data.id);
      }
      if (requesting_json.resource && requesting_json.qty) {
        const fromRes = await supabase.from('resources').select('*').eq('country_id', country.id).eq('resource_type', requesting_json.resource).single();
        const toRes = await supabase.from('resources').select('*').eq('country_id', post.from_country_id).eq('resource_type', requesting_json.resource).single();
        if (fromRes.data) await supabase.from('resources').update({ quantity: fromRes.data.quantity - requesting_json.qty }).eq('id', fromRes.data.id);
        if (toRes.data) await supabase.from('resources').update({ quantity: toRes.data.quantity + requesting_json.qty }).eq('id', toRes.data.id);
      }

      // Handle GC transfers (they give us GC, we give them GC)
      if (offering_json.gc) {
        const fromCountry = allCountries.find(c => c.id === post.from_country_id);
        if (fromCountry) await supabase.from('countries').update({ gc_balance: fromCountry.gc_balance - offering_json.gc }).eq('id', fromCountry.id);
        await supabase.from('countries').update({ gc_balance: country.gc_balance + offering_json.gc }).eq('id', country.id);
      }
      if (requesting_json.gc) {
        const fromCountry = allCountries.find(c => c.id === post.from_country_id);
        if (fromCountry) await supabase.from('countries').update({ gc_balance: fromCountry.gc_balance + requesting_json.gc }).eq('id', fromCountry.id);
        await supabase.from('countries').update({ gc_balance: country.gc_balance - requesting_json.gc }).eq('id', country.id);
      }

      // Mark post as fulfilled
      await supabase.from('market_posts').update({
        status: 'fulfilled',
        fulfilled_by: country.id,
        fulfilled_at: new Date().toISOString(),
      }).eq('id', post.id);

      addToast('Market offer accepted! Resources exchanged.', 'success', '✅');
      refetchMarket();
      onTradeAction();
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Trade failed', 'error');
    } finally { setLoading(false); }
  };

  const handleCancelMarketPost = async (post: MarketPost) => {
    await supabase.from('market_posts').update({ status: 'cancelled' }).eq('id', post.id);
    addToast('Market post cancelled', 'info');
    refetchMarket();
  };

  return (
    <div className="space-y-5 fade-in">
      <h2 className="font-heading text-lg text-primary tracking-[4px] flex items-center gap-3">
        <span className="w-8 h-px bg-gradient-to-r from-neon-cyan to-transparent" />
        Trade Center
      </h2>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-[rgba(0,240,255,0.06)] overflow-x-auto">
        {[
          { id: 'marketplace' as const, label: 'Marketplace', icon: '🌐' },
          { id: 'propose' as const, label: 'Direct Trade', icon: '📤' },
          { id: 'incoming' as const, label: `Incoming (${pendingIncoming.length})`, icon: '📥' },
          { id: 'sent' as const, label: 'Sent', icon: '📋' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`
              px-4 py-3 font-mono text-[10px] uppercase tracking-[3px] border-b-2 transition-all duration-300
              ${subTab === tab.id ? 'text-neon-cyan border-neon-cyan' : 'text-muted border-transparent hover:text-primary hover:border-[rgba(0,240,255,0.15)]'}
            `}
            style={subTab === tab.id ? { textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' } : {}}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Marketplace Tab */}
      {subTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Post New Offer */}
          <div className="space-y-4">
            <h3 className="font-heading text-primary flex items-center gap-2">
              <span className="text-neon-cyan">▶</span> CREATE MARKET POST
            </h3>
            {!isDiplomacyPhase && (
              <div className="bg-[rgba(255,215,0,0.05)] border border-[rgba(255,215,0,0.2)] rounded-xl px-4 py-2.5 text-[10px] font-mono text-neon-gold tracking-wider">
                ⚠ Market posts can only be created during the Diplomacy phase
              </div>
            )}
            
            <Card>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2.5 p-4 bg-base/40 rounded-xl border border-[rgba(57,255,20,0.08)]">
                    <h3 className="text-[10px] font-mono text-neon-lime uppercase tracking-[3px]" style={{ textShadow: '0 0 8px rgba(57,255,20,0.3)' }}>I HAVE</h3>
                    <select value={marketOfferResource} onChange={e => setMarketOfferResource(e.target.value as ResourceType)} className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all">
                      <option value="">Resource (optional)</option>
                      {RESOURCE_TYPES.map(r => <option key={r} value={r}>{RESOURCE_CONFIG[r].emoji} {r} ({resources.find(res => res.resource_type === r)?.quantity ?? 0})</option>)}
                    </select>
                    {marketOfferResource && <input type="number" min={0} value={marketOfferQty} onChange={e => setMarketOfferQty(parseInt(e.target.value) || 0)} placeholder="Quantity" className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all" />}
                    <div>
                      <label className="text-[9px] font-mono text-muted tracking-wider">GC Amount</label>
                      <input type="number" min={0} value={marketOfferGC} onChange={e => setMarketOfferGC(parseInt(e.target.value) || 0)} className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2.5 p-4 bg-base/40 rounded-xl border border-[rgba(0,240,255,0.08)]">
                    <h3 className="text-[10px] font-mono text-neon-cyan uppercase tracking-[3px]" style={{ textShadow: '0 0 8px rgba(0,240,255,0.3)' }}>I WANT</h3>
                    <select value={marketWantResource} onChange={e => setMarketWantResource(e.target.value as ResourceType)} className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all">
                      <option value="">Resource (optional)</option>
                      {RESOURCE_TYPES.map(r => <option key={r} value={r}>{RESOURCE_CONFIG[r].emoji} {r}</option>)}
                    </select>
                    {marketWantResource && <input type="number" min={0} value={marketWantQty} onChange={e => setMarketWantQty(parseInt(e.target.value) || 0)} placeholder="Quantity" className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all" />}
                    <div>
                      <label className="text-[9px] font-mono text-muted tracking-wider">GC Amount</label>
                      <input type="number" min={0} value={marketWantGC} onChange={e => setMarketWantGC(parseInt(e.target.value) || 0)} className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all" />
                    </div>
                  </div>
                </div>

                <div>
                  <input type="text" value={marketMessage} onChange={e => setMarketMessage(e.target.value.slice(0, 100))} placeholder="Message (optional)..." className="w-full bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-4 py-3 font-mono text-xs text-white placeholder:text-muted/30 focus:outline-none focus:border-[rgba(0,240,255,0.4)] focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-300 tracking-wider" />
                </div>

                <Button variant="primary" size="md" className="w-full" disabled={!isDiplomacyPhase || (!marketOfferResource && marketOfferGC <= 0)} loading={loading} onClick={handleCreatePost}>
                  ⚡ POST TO MARKETPLACE
                </Button>
              </div>
            </Card>
          </div>

          {/* Open Market Board */}
          <div className="space-y-4">
            <h3 className="font-heading text-primary flex items-center gap-2">
              <span className="text-neon-lime">▶</span> OPEN MARKET BOARD
            </h3>
            {openPosts.length === 0 ? (
              <Card><p className="text-center text-muted font-mono text-xs py-4 tracking-wider">Market is empty right now.</p></Card>
            ) : (
              <div className="space-y-3">
                {openPosts.map(post => <MarketPostCard key={post.id} post={post} type="open" onAccept={handleAcceptMarketPost} />)}
              </div>
            )}
          </div>

          {/* My Market Posts */}
          {myPosts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-heading text-primary flex items-center gap-2">
                <span className="text-neon-violet">▶</span> MY PAST & ACTIVE POSTS
              </h3>
              <div className="space-y-3">
                {myPosts.map(post => <MarketPostCard key={post.id} post={post} type="mine" onCancel={handleCancelMarketPost} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Direct Trade (Propose) */}
      {subTab === 'propose' && (
        <div className="space-y-4">
          {!isDiplomacyPhase && (
            <div className="bg-[rgba(255,215,0,0.05)] border border-[rgba(255,215,0,0.2)] rounded-xl px-4 py-2.5 text-[10px] font-mono text-neon-gold tracking-wider">
              ⚠ Trade proposals can only be sent during the Diplomacy phase
            </div>
          )}

          <Card>
            <div className="space-y-4">
              {/* Target country */}
              <div>
                <label className="block text-[9px] font-mono text-muted uppercase tracking-[3px] mb-1.5">
                  Send to
                </label>
                <select
                  value={toCountryId}
                  onChange={e => setToCountryId(e.target.value)}
                  className="w-full bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-4 py-3
                             font-mono text-sm text-white focus:outline-none focus:border-[rgba(0,240,255,0.4)] focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-300"
                >
                  <option value="">Select a country...</option>
                  {otherCountries.map(c => (
                    <option key={c.id} value={c.id}>{c.flag_emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Two columns: I Offer / I Want */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* I Offer */}
                <div className="space-y-2.5 p-4 bg-base/40 rounded-xl border border-[rgba(57,255,20,0.08)]">
                  <h3 className="text-[10px] font-mono text-neon-lime uppercase tracking-[3px]" style={{ textShadow: '0 0 8px rgba(57,255,20,0.3)' }}>I OFFER</h3>
                  <select
                    value={offerResource}
                    onChange={e => setOfferResource(e.target.value as ResourceType)}
                    className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all"
                  >
                    <option value="">Resource (optional)</option>
                    {RESOURCE_TYPES.map(r => (
                      <option key={r} value={r}>
                        {RESOURCE_CONFIG[r].emoji} {r} ({resources.find(res => res.resource_type === r)?.quantity ?? 0})
                      </option>
                    ))}
                  </select>
                  {offerResource && (
                    <input
                      type="number"
                      min={0}
                      value={offerQty}
                      onChange={e => setOfferQty(parseInt(e.target.value) || 0)}
                      placeholder="Quantity"
                      className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all"
                    />
                  )}
                  <div>
                    <label className="text-[9px] font-mono text-muted tracking-wider">GC Amount</label>
                    <input
                      type="number"
                      min={0}
                      value={offerGC}
                      onChange={e => setOfferGC(parseInt(e.target.value) || 0)}
                      className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all"
                    />
                  </div>
                </div>

                {/* I Want */}
                <div className="space-y-2.5 p-4 bg-base/40 rounded-xl border border-[rgba(0,240,255,0.08)]">
                  <h3 className="text-[10px] font-mono text-neon-cyan uppercase tracking-[3px]" style={{ textShadow: '0 0 8px rgba(0,240,255,0.3)' }}>I WANT</h3>
                  <select
                    value={wantResource}
                    onChange={e => setWantResource(e.target.value as ResourceType)}
                    className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all"
                  >
                    <option value="">Resource (optional)</option>
                    {RESOURCE_TYPES.map(r => (
                      <option key={r} value={r}>{RESOURCE_CONFIG[r].emoji} {r}</option>
                    ))}
                  </select>
                  {wantResource && (
                    <input
                      type="number"
                      min={0}
                      value={wantQty}
                      onChange={e => setWantQty(parseInt(e.target.value) || 0)}
                      placeholder="Quantity"
                      className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all"
                    />
                  )}
                  <div>
                    <label className="text-[10px] font-mono text-muted">GC Amount</label>
                    <input
                      type="number"
                      min={0}
                      value={wantGC}
                      onChange={e => setWantGC(parseInt(e.target.value) || 0)}
                      className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary focus:outline-none focus:border-[rgba(0,240,255,0.3)] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[9px] font-mono text-muted uppercase tracking-[3px] mb-1.5">Message (optional, max 100 chars)</label>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 100))}
                  placeholder="Let's make a deal..."
                  className="w-full bg-base/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-4 py-3 font-mono text-xs text-white
                             placeholder:text-muted/30 focus:outline-none focus:border-[rgba(0,240,255,0.4)] focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all duration-300 tracking-wider"
                />
                <div className="text-right text-[9px] font-mono text-muted/50 mt-1 tracking-wider">{message.length}/100</div>
              </div>

              {/* Preview */}
              {(toCountryId && (offerResource || offerGC > 0)) && (
                <Card className="border-[rgba(57,255,20,0.15)]">
                  <h4 className="text-[10px] font-mono text-neon-lime uppercase tracking-[3px] mb-2" style={{ textShadow: '0 0 8px rgba(57,255,20,0.3)' }}>Trade Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                    <div>
                      <span className="text-muted">Offering: </span>
                      {offerResource && <span>{RESOURCE_CONFIG[offerResource]?.emoji} {offerQty} {offerResource}</span>}
                      {offerGC > 0 && <span> + 💰{formatGC(offerGC)} GC</span>}
                    </div>
                    <div>
                      <span className="text-muted">Wanting: </span>
                      {wantResource && <span>{RESOURCE_CONFIG[wantResource]?.emoji} {wantQty} {wantResource}</span>}
                      {wantGC > 0 && <span> + 💰{formatGC(wantGC)} GC</span>}
                    </div>
                  </div>
                </Card>
              )}

              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={!isDiplomacyPhase || !toCountryId || (!offerResource && offerGC <= 0)}
                loading={loading}
                onClick={handlePropose}
              >
                ⚡ SEND TRADE OFFER
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Incoming Offers */}
      {subTab === 'incoming' && (
        <div className="space-y-3">
          {pendingIncoming.length === 0 && historyIncoming.length === 0 ? (
            <Card>
              <p className="text-center text-muted font-mono text-xs py-4 tracking-wider">
                No incoming trade offers yet
              </p>
            </Card>
          ) : (
            <>
              {pendingIncoming.length > 0 && (
                <>
                  <h3 className="text-[10px] font-mono text-neon-gold uppercase tracking-[3px]" style={{ textShadow: '0 0 8px rgba(255,215,0,0.3)' }}>Pending ({pendingIncoming.length})</h3>
                  {pendingIncoming.map(offer => (
                    <TradeOfferCard
                      key={offer.id}
                      offer={offer}
                      type="incoming"
                      onAccept={() => handleAccept(offer)}
                      onReject={() => handleReject(offer.id)}
                      onCounter={() => {
                        setCounterOffer(offer);
                        setCounterOfferResource('');
                        setCounterOfferQty(0);
                        setCounterOfferGC(0);
                        setCounterWantResource('');
                        setCounterWantQty(0);
                        setCounterWantGC(0);
                        setCounterMessage('');
                      }}
                      loading={loading}
                    />
                  ))}
                </>
              )}
              {historyIncoming.length > 0 && (
                <>
                  <h3 className="text-[10px] font-mono text-muted uppercase tracking-[3px] mt-5">History</h3>
                  {historyIncoming.map(offer => (
                    <TradeOfferCard key={offer.id} offer={offer} type="incoming" />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Sent Offers */}
      {subTab === 'sent' && (
        <div className="space-y-3">
          {sentOffers.length === 0 ? (
            <Card>
              <p className="text-center text-muted font-mono text-xs py-4 tracking-wider">
                No sent trade offers yet
              </p>
            </Card>
          ) : (
            sentOffers.map(offer => (
              <TradeOfferCard
                key={offer.id}
                offer={offer}
                type="sent"
                onCancel={() => handleCancel(offer.id)}
                loading={loading}
              />
            ))
          )}
        </div>
      )}

      {/* Counter Offer Modal */}
      <Modal
        isOpen={!!counterOffer}
        onClose={() => setCounterOffer(null)}
        title="COUNTER OFFER"
        maxWidth="500px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2.5 p-4 bg-base/40 rounded-xl border border-[rgba(57,255,20,0.08)]">
              <h3 className="text-[10px] font-mono text-neon-lime uppercase tracking-[3px]">I Offer</h3>
              <select
                value={counterOfferResource}
                onChange={e => setCounterOfferResource(e.target.value as ResourceType)}
                className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary"
              >
                <option value="">Resource</option>
                {RESOURCE_TYPES.map(r => (
                  <option key={r} value={r}>{RESOURCE_CONFIG[r].emoji} {r}</option>
                ))}
              </select>
              {counterOfferResource && (
                <input type="number" min={0} value={counterOfferQty}
                  onChange={e => setCounterOfferQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-card border border-border rounded-[4px] px-3 py-2 font-mono text-sm text-primary" />
              )}
              <input type="number" min={0} value={counterOfferGC} placeholder="GC"
                onChange={e => setCounterOfferGC(parseInt(e.target.value) || 0)}
                className="w-full bg-card border border-border rounded-[4px] px-3 py-2 font-mono text-sm text-primary" />
            </div>
            <div className="space-y-2.5 p-4 bg-base/40 rounded-xl border border-[rgba(0,240,255,0.08)]">
              <h3 className="text-[10px] font-mono text-neon-cyan uppercase tracking-[3px]">I Want</h3>
              <select
                value={counterWantResource}
                onChange={e => setCounterWantResource(e.target.value as ResourceType)}
                className="w-full bg-card border border-border rounded-[4px] px-3 py-2 font-mono text-sm text-primary"
              >
                <option value="">Resource</option>
                {RESOURCE_TYPES.map(r => (
                  <option key={r} value={r}>{RESOURCE_CONFIG[r].emoji} {r}</option>
                ))}
              </select>
              {counterWantResource && (
                <input type="number" min={0} value={counterWantQty}
                  onChange={e => setCounterWantQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-card border border-border rounded-[4px] px-3 py-2 font-mono text-sm text-primary" />
              )}
              <input type="number" min={0} value={counterWantGC} placeholder="GC"
                onChange={e => setCounterWantGC(parseInt(e.target.value) || 0)}
                className="w-full bg-card border border-border rounded-[4px] px-3 py-2 font-mono text-sm text-primary" />
            </div>
          </div>
          <input
            type="text"
            value={counterMessage}
            onChange={e => setCounterMessage(e.target.value.slice(0, 100))}
            placeholder="Message..."
            className="w-full bg-card/60 border border-[rgba(0,240,255,0.1)] rounded-xl px-3 py-2.5 font-mono text-xs text-primary"
          />
          <Button variant="primary" size="md" className="w-full" loading={loading} onClick={handleCounterSubmit}>
            ⚡ SEND COUNTER OFFER
          </Button>
        </div>
      </Modal>
    </div>
  );
}
