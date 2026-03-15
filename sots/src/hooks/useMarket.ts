import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { MarketPost } from '../types';

export function useMarket(countryId: string | undefined) {
  const [openPosts, setOpenPosts] = useState<MarketPost[]>([]);
  const [myPosts, setMyPosts] = useState<MarketPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastCallback = useRef<((post: MarketPost) => void) | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!countryId) return;
    try {
      // Open posts from others
      const { data: open, error: openErr } = await supabase
        .from('market_posts')
        .select('*, from_country:countries!market_posts_from_country_id_fkey(*), fulfilled_country:countries!market_posts_fulfilled_by_fkey(*)')
        .eq('status', 'open')
        .neq('from_country_id', countryId)
        .order('created_at', { ascending: false });
      if (openErr) throw openErr;

      // My posts (all statuses to show history)
      const { data: mine, error: mineErr } = await supabase
        .from('market_posts')
        .select('*, from_country:countries!market_posts_from_country_id_fkey(*), fulfilled_country:countries!market_posts_fulfilled_by_fkey(*)')
        .eq('from_country_id', countryId)
        .order('created_at', { ascending: false });
      if (mineErr) throw mineErr;

      setOpenPosts(open || []);
      setMyPosts(mine || []);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch market posts';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  useEffect(() => {
    fetchPosts();

    if (!countryId) return;

    const channel = supabase
      .channel(`market_posts_${countryId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'market_posts' },
        (payload) => {
          const post = payload.new as MarketPost;
          // Notify if new open post from someone else
          if (payload.eventType === 'INSERT' && post.status === 'open' && post.from_country_id !== countryId) {
            toastCallback.current?.(post);
          }
          // Refresh
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [countryId, fetchPosts]);

  const setOnNewPost = (cb: (post: MarketPost) => void) => {
    toastCallback.current = cb;
  };

  return {
    openPosts,
    myPosts,
    loading,
    error,
    refetch: fetchPosts,
    setOnNewPost,
  };
}
