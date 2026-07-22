import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/src/convex/api";
import { clearCredentials, readCredentials, writeCredentials } from "@/src/lib/auth-storage";
import { useIsOnline } from "@/src/providers/connectivity";
import type { AuthUser, Customer } from "@/src/types/domain";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  customer: Customer | null;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const online = useIsOnline();
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const logoutMutation = useMutation(api.phoneAuth.logout);

  useEffect(() => {
    readCredentials()
      .then((credentials) => {
        setToken(credentials?.token ?? null);
        setUser(credentials?.user ?? null);
      })
      .finally(() => setHydrated(true));
  }, []);

  const session = useQuery(api.phoneAuth.validateSession, token && online ? { token } : "skip");
  const customer = useQuery(
    api.customers.getByPhone,
    token && user && online ? { phone: user.phone, token } : "skip",
  );

  useEffect(() => {
    if (!hydrated || !online || !token || session === undefined) return;
    if (session === null || session.role !== "customer") {
      void clearCredentials().finally(() => {
        setToken(null);
        setUser(null);
      });
    }
  }, [hydrated, online, session, token]);

  const signIn = useCallback(async (nextToken: string, nextUser: AuthUser) => {
    await writeCredentials(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    const current = token;
    setToken(null);
    setUser(null);
    await clearCredentials();
    if (current && online) await logoutMutation({ token: current }).catch(() => undefined);
  }, [logoutMutation, online, token]);

  const ready = hydrated && (!token || !online || session !== undefined);
  const value = useMemo<AuthContextValue>(() => ({
    ready,
    authenticated: Boolean(token && user && (!online || session?.role === "customer")),
    token,
    user,
    customer: customer ?? null,
    signIn,
    signOut,
  }), [customer, online, ready, session?.role, signIn, signOut, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
