import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb, getCurrentUser } from '../lib/pocketbase';
import type { Record } from 'pocketbase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: Record | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize auth state
    setUser(getCurrentUser());
    setIsLoading(false);

    // Subscribe to auth state changes
    pb.authStore.onChange(() => {
      setUser(getCurrentUser());
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password);
      toast.success('Logged in successfully');
      navigate('/inventory');
    } catch (error) {
      toast.error('Failed to login');
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const register = async (email: string, password: string, passwordConfirm: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
      });
      toast.success('Registered successfully');
      await login(email, password);
    } catch (error) {
      toast.error('Failed to register');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}