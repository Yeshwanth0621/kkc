import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Country } from '../types'

export const useCountry = () => {
  const [country, setCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCountry = async () => {
    setLoading(true)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      setError(authError?.message ?? 'Not authenticated')
      setLoading(false)
      return
    }
    const { data, error: countryError } = await supabase
      .from('countries')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    if (countryError) setError(countryError.message)
    setCountry(data)
    setLoading(false)
  }

  useEffect(() => {
    void fetchCountry()
  }, [])

  return { country, loading, error, refetch: fetchCountry }
}
