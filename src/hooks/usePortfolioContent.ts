import { useEffect, useMemo, useState } from 'react';
import { getPortfolioContent, getPreviewPortfolioContent } from '../services/contentService';
import type { PortfolioData } from '../types/database';

export function usePortfolioContent() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const isDraftPreview =
      typeof window !== 'undefined' && window.location.search.includes('preview=true');
    setIsPreview(isDraftPreview);

    const load = async () => {
      try {
        setLoading(true);
        const content = isDraftPreview
          ? await getPreviewPortfolioContent()
          : await getPortfolioContent();
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
      isPreview,
    }),
    [data, loading, error, isPreview],
  );
}
