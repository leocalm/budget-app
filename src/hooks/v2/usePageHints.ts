import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'piggy-pulse:dismissed-hints';

// Simple external store so all components stay in sync when a hint is dismissed.
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

// Cache the snapshot to avoid re-creating Sets on every render.
let cachedRaw: string | null = null;
let cachedSet = new Set<string>();

function getSnapshotCached(): Set<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSet = getSnapshot();
  }
  return cachedSet;
}

function dismiss(hintId: string) {
  const current = getSnapshot();
  current.add(hintId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  cachedRaw = null; // invalidate cache
  emitChange();
}

/**
 * Hook for managing dismissible page hints.
 * Returns whether a specific hint is visible and a function to dismiss it.
 */
export function usePageHint(hintId: string) {
  const dismissed = useSyncExternalStore(subscribe, getSnapshotCached, getSnapshotCached);

  const isVisible = !dismissed.has(hintId);
  const dismissHint = useCallback(() => dismiss(hintId), [hintId]);

  return { isVisible, dismissHint };
}
