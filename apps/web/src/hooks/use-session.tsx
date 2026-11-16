"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppRole, UserProfile } from "@/lib/types";
import { setAccessToken } from "@/lib/api-client";

interface SessionContextValue {
  user: UserProfile | null;
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
  const [user, setUser] = useState<UserProfile | null>(initialUser);

  const switchRole = useCallback((role: AppRole) => {
    setUser((current) =>
      current && current.roles.includes(role)
        ? { ...current, activeRole: role }
        : current,
    );
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, switchRole, signOut }),
    [user, switchRole, signOut],
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
