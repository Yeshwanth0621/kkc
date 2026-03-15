import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { GameState } from '../types'

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    const loadGameState = async () => {
      const { data, error: gameStateError } = await supabase
        .from('game_state')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (!active) return
      if (gameStateError) setError(gameStateError.message)
      else setError(null)
      setGameState(data)
      setLoading(false)
    }

    loadGameState()

    const channel = supabase
      .channel('game_state_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state' }, () => {
        loadGameState()
      })
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [reloadToken])

  return {
    gameState,
    loading,
    error,
    retry: () => {
      setLoading(true)
      setReloadToken((value) => value + 1)
    },
  }
}
