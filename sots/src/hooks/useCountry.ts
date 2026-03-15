import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Country } from '../types';

export function useCountry(userId: string | undefined) {
  const [country, setCountry] = useState<Country | null>(null);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountry = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error: fbError } = await supabase
        .from('countries')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fbError) throw fbError;
      setCountry(data);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch country';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchAllCountries = useCallback(async () => {
    try {
      const { data, error: fbError } = await supabase
        .from('countries')
        .select('*')
        .order('name');

      if (fbError) throw fbError;
      setAllCountries(data || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCountry();
    fetchAllCountries();
  }, [fetchCountry, fetchAllCountries]);

  return { country, allCountries, loading, error, refetch: fetchCountry, refetchAll: fetchAllCountries };
}
