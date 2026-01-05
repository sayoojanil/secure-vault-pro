import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types/vault';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loginAsGuest: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@vault.app',
  name: 'Alex Morgan',
  createdAt: new Date('2024-01-15'),
  storageUsed: 245 * 1024 * 1024, // 245 MB
  storageLimit: 1024 * 1024 * 1024, // 1 GB
  isGuest: false,
};

const GUEST_USER: User = {
  id: 'guest-user',
  email: 'guest@vault.app',
  name: 'Guest User',
  createdAt: new Date(),
  storageUsed: 0,
  storageLimit: 100 * 1024 * 1024, // 100 MB
  isGuest: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('vault_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (email === 'demo@vault.app' && password === 'demo123') {
      setUser(DEMO_USER);
      localStorage.setItem('vault_user', JSON.stringify(DEMO_USER));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date(),
      storageUsed: 0,
      storageLimit: 1024 * 1024 * 1024,
      isGuest: false,
    };
    
    setUser(newUser);
    localStorage.setItem('vault_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vault_user');
  }, []);

  const loginAsGuest = useCallback(() => {
    setUser(GUEST_USER);
    localStorage.setItem('vault_user', JSON.stringify(GUEST_USER));
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, loginAsGuest, resetPassword }}>
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
