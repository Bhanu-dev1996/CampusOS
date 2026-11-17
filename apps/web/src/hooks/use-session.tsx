"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppRole, UserProfile } from "@/lib/types";
import { setAccessToken } from "@/lib/api-client";
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
  type StoredSession,
} from "@/lib/session-storage";

interface SessionContextValue {
  user: UserProfile | null;
  accessToken: string | null;
  isHydrated: boolean;
  setSession: (session: StoredSession) => void;
  setUser: (user: UserProfile | null) => void;
  switchRole: (role: AppRole) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: UserProfile | null;
}) {
  // Do not read sessionStorage in useState — that diverges from SSR and causes hydration errors.
  const [sessionState, setSessionState] = useState({
    user: initialUser as UserProfile | null,
    accessToken: null as string | null,
  });
  const { user, accessToken } = sessionState;
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredSession();
    if (stored?.accessToken) {
      setAccessToken(stored.accessToken);
      setSessionState({ user: stored.user, accessToken: stored.accessToken });
    } else {
      setAccessToken(null);
      if (stored && !stored.accessToken) {
        clearStoredSession();
      }
      setSessionState({ user: null, accessToken: null });
    }
    setIsHydrated(true);
  }, []);

  const setSession = useCallback((session: StoredSession) => {
    setAccessToken(session.accessToken);
    setSessionState({ user: session.user, accessToken: session.accessToken });
    saveStoredSession(session);
  }, []);

  const setUser = useCallback((next: UserProfile | null) => {
    if (!next) {
      clearStoredSession();
      setAccessToken(null);
      setSessionState({ user: null, accessToken: null });
      return;
    }
    setSessionState((prev) => ({ ...prev, user: next }));
    const token = sessionStorage.getItem("campusos_session_v1");
    if (token) {
      try {
        const parsed = JSON.parse(token) as StoredSession;
        saveStoredSession({ ...parsed, user: next });
      } catch {
        // ignore
      }
    }
  }, []);

  const switchRole = useCallback((role: AppRole) => {
    setSessionState((current) => {
      if (!current.user || !current.user.roles.includes(role)) return current;
      const nextUser = { ...current.user, activeRole: role };
      const stored = loadStoredSession();
      if (stored) {
        saveStoredSession({ ...stored, user: nextUser });
      }
      return { ...current, user: nextUser };
    });
  }, []);

  const signOut = useCallback(() => {
    setSessionState({ user: null, accessToken: null });
    setAccessToken(null);
    clearStoredSession();
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isHydrated,
      setSession,
      setUser,
      switchRole,
      signOut,
    }),
    [user, accessToken, isHydrated, setSession, setUser, switchRole, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}