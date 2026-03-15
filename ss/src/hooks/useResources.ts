import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Resource } from '../types'

export const useResources = (countryId?: string) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!countryId) {
      setLoading(false)
      return
    }

    let active = true
    const fetchResources = async () => {
      const { data, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('country_id', countryId)
        .order('resource_type')
      if (!active) return
      if (resourcesError) setError(resourcesError.message)
      setResources(data ?? [])
      setLoading(false)
    }

    fetchResources()

    const channel = supabase
      .channel(`resources_${countryId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, fetchResources)
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [countryId])

  return { resources, loading, error }
}
