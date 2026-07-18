import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthApi } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (token: string, email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { user: current } = await AuthApi.me();
    setUser(current);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await AuthApi.login(email, password);
    setUser(loggedIn);
  }, []);

  const signup = useCallback(async (token: string, email: string, name: string, password: string) => {
    const created = await AuthApi.signup(token, email, name, password);
    setUser(created);
  }, []);

  const logout = useCallback(async () => {
    await AuthApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
