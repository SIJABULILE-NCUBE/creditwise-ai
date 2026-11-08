import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as authApi from './api/auth';
import type { AccountInfo, SessionInfo } from './api/auth';
import { clearSessionTimes, onSessionExpired, startSessionWatch } from './session';

export type ExitReason = 'expired' | 'deleted';

export interface AuthContextValue {
  loading: boolean;
  session: SessionInfo | null;
  account: AccountInfo | null;
  recovery: boolean;
  /** Why the session ended, so the route guards send the user to the right screen. */
  exitReason?: ExitReason | null;
  /** Clears the session at once, without waiting for Supabase's sign-out event. */
  markSignedOut?: (reason?: ExitReason) => void;
  refreshAccount: () => Promise<void>;
  clearRecovery: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [exitReason, setExitReason] = useState<ExitReason | null>(null);
  const userIdRef = useRef<string | null>(null);

  const loadAccount = useCallback(async () => {
    setAccount(await authApi.getAccount());
  }, []);

  const applySession = useCallback(
    async (next: SessionInfo | null) => {
      const changed = next?.userId !== userIdRef.current;
      userIdRef.current = next?.userId ?? null;
      setSession(next);
      if (next) setExitReason(null);
      if (!next) {
        setAccount(null);
        return;
      }
      if (changed) {
        setLoading(true);
        await loadAccount();
        setLoading(false);
      }
    },
    [loadAccount],
  );

  useEffect(() => {
    let active = true;
    authApi
      .getSession()
      .then((current) => (active ? applySession(current) : undefined))
      .finally(() => {
        if (active) setLoading(false);
      });
    const unsubscribe = authApi.onAuthChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') setRecovery(false);
      // Supabase holds a lock during this callback, so its own calls must wait for the next tick.
      setTimeout(() => {
        if (active) void applySession(next);
      }, 0);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [applySession]);

  const markSignedOut = useCallback((reason?: ExitReason) => {
    userIdRef.current = null;
    setSession(null);
    setAccount(null);
    setExitReason(reason ?? null);
  }, []);

  const userId = session?.userId;
  useEffect(() => {
    if (!userId || recovery || loading) return;
    const expire = () => {
      void authApi.logOut().finally(() => {
        clearSessionTimes();
        markSignedOut('expired');
      });
    };
    const stopWatch = startSessionWatch(expire);
    const stopListening = onSessionExpired(expire);
    return () => {
      stopWatch();
      stopListening();
    };
  }, [userId, recovery, loading, markSignedOut]);

  const clearRecovery = useCallback(() => setRecovery(false), []);

  const value = useMemo(
    () => ({ loading, session, account, recovery, exitReason, markSignedOut, refreshAccount: loadAccount, clearRecovery }),
    [loading, session, account, recovery, exitReason, markSignedOut, loadAccount, clearRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
