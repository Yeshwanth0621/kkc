import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Resource } from '../types';

export function useResources(countryId: string | undefined) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    if (!countryId) return;
    try {
      const { data, error: fbError } = await supabase
        .from('resources')
        .select('*')
        .eq('country_id', countryId);

      if (fbError) throw fbError;
      setResources(data || []);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch resources';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { resources, loading, error, refetch: fetchResources };
}
