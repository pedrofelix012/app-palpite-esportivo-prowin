'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = authLogin(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (email: string, password: string, name: string) => {
    const result = authRegister(email, password, name);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const refreshUser = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
