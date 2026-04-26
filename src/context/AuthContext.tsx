"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Session } from "@/types/auth";
import {
  signIn,
  signUp,
  logOut,
  readSession,
  type AuthResult,
} from "@/lib/auth";

interface AuthContextState {
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => AuthResult;
  signIn: (email: string, password: string) => AuthResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = readSession();
    setSession(stored);
    setIsLoading(false);
  }, []);

  const signup = useCallback((email: string, password: string): AuthResult => {
    const result = signUp(email, password);
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const signin = useCallback((email: string, password: string): AuthResult => {
    const result = signIn(email, password);

    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logOut();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, isLoading, signUp: signup, signIn: signin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");

  return ctx;
}
