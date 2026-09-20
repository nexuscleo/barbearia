'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  login: (email: string, role?: UserRole, nome?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  cliente: {
    uid: 'cli-demo-user',
    nome: 'Felipe Santana',
    email: 'cliente@barbearia.com',
    telefone: '(11) 98765-4321',
    role: 'cliente',
    criadoEm: '2026-01-10T10:00:00Z',
  },
  admin: {
    uid: 'adm-demo-user',
    nome: 'Mestre Carlos (Administrador)',
    email: 'admin@barbearia.com',
    telefone: '(11) 99999-8888',
    role: 'admin',
    criadoEm: '2025-11-01T08:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Inicializa com o usuário demo de cliente para fluidez imediata
    const saved = localStorage.getItem('barbearia_active_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEMO_USERS.cliente);
      }
    } else {
      setUser(DEMO_USERS.cliente);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, targetRole: UserRole = 'cliente', nome?: string) => {
    const newUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      nome: nome || (targetRole === 'admin' ? 'Gerente / Dono' : 'Cliente Convidado'),
      email,
      role: targetRole,
      telefone: '(11) 99876-5432',
      criadoEm: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('barbearia_active_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('barbearia_active_user');
  };

  const switchRole = (newRole: UserRole) => {
    const selected = DEMO_USERS[newRole];
    setUser(selected);
    localStorage.setItem('barbearia_active_user', JSON.stringify(selected));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'cliente',
        login,
        logout,
        switchRole,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
