import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      setUser({
        id: data.user.id,
        email: data.user.email || '',
      });

      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
      throw error;
    }
  };

  const register = async (email: string, password: string, passwordConfirm: string) => {
    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      throw new Error('Passwords do not match');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from registration');

      setUser({
        id: data.user.id,
        email: data.user.email || '',
      });

      toast.success('Registered successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
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