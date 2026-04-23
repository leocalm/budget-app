import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  hasDek,
  loadDekFromSessionStorage,
  lockSession,
  postUnlock,
  rotateWrappedDek,
  subscribeToDek,
  unlockWithPassword,
} from '@/lib/encryption';

interface EncryptionContextValue {
  isUnlocked: boolean;
  isReady: boolean; // has been bootstrapped for the current session
  unlockWithPassword: (password: string) => Promise<void>;
  lock: () => void;
  // Re-syncs the server-side session DEK from the cached browser copy. Used on
  // page reloads and tab focus when the user still has the DEK in memory but
  // the server may have evicted it (new session cookie / restart).
  restoreServerSession: () => Promise<boolean>;
  // Called after the password has been changed so the server stores a new
  // wrapped DEK for next login.
  rotatePassword: (newPassword: string) => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextValue | undefined>(undefined);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => hasDek());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDek(setIsUnlocked);
    return unsubscribe;
  }, []);

  const restoreServerSession = useCallback(async () => {
    const dek = loadDekFromSessionStorage();
    if (!dek) {
      return false;
    }
    try {
      await postUnlock(dek);
      return true;
    } catch {
      return false;
    }
  }, []);

  // On mount: if we already have a DEK cached (tab reload with sessionStorage
  // still populated) push it back to the server so the Rocket session store
  // picks it up, then mark the context as ready.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (hasDek()) {
        await restoreServerSession();
      }
      if (!cancelled) {
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restoreServerSession]);

  const unlock = useCallback(async (password: string) => {
    await unlockWithPassword(password);
  }, []);

  const lock = useCallback(() => {
    lockSession();
  }, []);

  const rotatePassword = useCallback(async (newPassword: string) => {
    const dek = loadDekFromSessionStorage();
    if (!dek) {
      throw new Error('Cannot rotate wrapped DEK while session is locked');
    }
    await rotateWrappedDek(newPassword, dek);
  }, []);

  const value = useMemo<EncryptionContextValue>(
    () => ({
      isUnlocked,
      isReady,
      unlockWithPassword: unlock,
      lock,
      restoreServerSession,
      rotatePassword,
    }),
    [isUnlocked, isReady, unlock, lock, restoreServerSession, rotatePassword]
  );

  return <EncryptionContext.Provider value={value}>{children}</EncryptionContext.Provider>;
}

export function useEncryption(): EncryptionContextValue {
  const ctx = useContext(EncryptionContext);
  if (!ctx) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return ctx;
}
