import { useEffect, useMemo, useState } from 'react';
import { getPortfolioContent } from '../services/contentService';
import type { PortfolioData } from '../types/database';

export function usePortfolioContent() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const content = await getPortfolioContent();
        if (isMounted) {
          setData(content);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load portfolio content.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo(
    () => ({
      data,
      loading,
      error,
    }),
    [data, loading, error],
  );
}
