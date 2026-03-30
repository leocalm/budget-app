import { useCallback, useEffect, useRef } from 'react';

interface InfiniteScrollCallbacks {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

/**
 * Returns a ref callback to attach to a sentinel element for infinite scroll.
 * When the sentinel enters the viewport and there are more pages to load, it triggers fetchNextPage.
 */
export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollCallbacks) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const stableCallbacks = useRef({ fetchNextPage, hasNextPage, isFetchingNextPage });
  stableCallbacks.current = { fetchNextPage, hasNextPage, isFetchingNextPage };

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (!node) {
      return;
    }
    observerRef.current = new IntersectionObserver((entries) => {
      const {
        hasNextPage: has,
        isFetchingNextPage: fetching,
        fetchNextPage: fetch,
      } = stableCallbacks.current;
      if (entries[0].isIntersecting && has && !fetching) {
        fetch();
      }
    });
    observerRef.current.observe(node);
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return sentinelRef;
}
