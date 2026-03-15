import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { GameState } from '../types';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameState = useCallback(async () => {
    try {
      const { data, error: fbError } = await supabase
        .from('game_state')
        .select('*')
        .eq('is_active', true)
        .single();

      if (fbError) throw fbError;
      setGameState(data);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch game state';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameState();

    const channel = supabase
      .channel('game_state_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state' },
        (payload) => {
          const newState = payload.new as GameState;
          if (newState.is_active) {
            setGameState(newState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGameState]);

  return { gameState, loading, error, refetch: fetchGameState };
}
