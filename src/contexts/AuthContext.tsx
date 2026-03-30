import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import type { UserRole } from '../types';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
  isLoading: boolean;
  isRoleLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function coerceUserRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null

  const normalized = value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase()
  if (
    normalized === 'admin' ||
    normalized === 'warehouse' ||
    normalized === 'sales' ||
    normalized === 'crew'
  ) {
    return normalized;
  }
  return null;
}

function getRuntimeRoleOverride(): UserRole | null {
  const envOverride = coerceUserRole((import.meta as any)?.env?.VITE_ROLE_OVERRIDE)
  if (envOverride) return envOverride

  // Fallback for local/dev debugging when env injection is unreliable.
  if (typeof window !== 'undefined') {
    const localOverride = coerceUserRole(window.localStorage.getItem('pf_role_override'))
    if (localOverride) return localOverride
  }

  return null
}

function getRoleFromSupabaseUser(supabaseUser: { user_metadata?: unknown; app_metadata?: unknown }): UserRole {
  const userMetadata = (supabaseUser.user_metadata ?? {}) as Record<string, unknown>;
  const appMetadata = (supabaseUser.app_metadata ?? {}) as Record<string, unknown>;

  // Local dev escape hatch. Useful when roles table RLS blocks reads.
  const override = getRuntimeRoleOverride();
  if (override) return override;

  return (
    coerceUserRole(userMetadata.role) ??
    coerceUserRole(appMetadata.role) ??
    'crew'
  );
}

async function fetchRoleFromRolesTable(userId: string): Promise<UserRole | null> {
  try {
    // If an explicit override is set, don't hit the DB.
    const override = getRuntimeRoleOverride();
    if (override) return override;

    // Note: supabase types in this repo are not exhaustive; keep this query tolerant.
    // Also: the `roles` table schema may vary (role/name, user_id/userId/etc).
    const { data, error } = await (supabase as any)
      .from('roles')
      .select('*');

    if (error) throw error;
    const rows: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];

    const rowForUser = rows.find((row) => {
      const candidate =
        row.user_id ?? row.userId ?? row.uid ?? row.auth_user_id ?? row.authUserId;
      return candidate === userId;
    });

    if (!rowForUser) {
      console.warn(
        '[auth] No roles row found for user',
        userId,
        'rows:',
        rows.length
      );
      return null;
    }

    const roleValue =
      rowForUser.role ??
      rowForUser.name ??
      rowForUser.user_role ??
      rowForUser.userRole ??
      rowForUser.role_name ??
      rowForUser.roleName;

    const coerced = coerceUserRole(roleValue);
    if (!coerced) {
      console.warn('[auth] Unrecognized role value in roles row:', roleValue);
    }
    return coerced;
  } catch (err) {
    console.error('Error fetching role from roles table:', err);
    return null;
  }
}

function setUserFromSession(
  supabaseUser: { id: string; email?: string | null; user_metadata?: unknown; app_metadata?: unknown },
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
) {
  const role = getRoleFromSupabaseUser(supabaseUser)
  console.log('[auth] env', {
    VITE_ROLE_OVERRIDE: (import.meta as any)?.env?.VITE_ROLE_OVERRIDE,
    VITE_USE_ROLES_TABLE: (import.meta as any)?.env?.VITE_USE_ROLES_TABLE,
    LOCAL_ROLE_OVERRIDE:
      typeof window !== 'undefined'
        ? window.localStorage.getItem('pf_role_override')
        : null,
  })
  console.log('[auth] resolved role:', role)

  // Fast path: never block UI on a DB role lookup.
  setUser({
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role,
  })
}

async function hydrateRoleFromDb(
  userId: string,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setIsRoleLoading: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setIsRoleLoading(true)
  try {
    const roleFromTable = await fetchRoleFromRolesTable(userId)
    if (!roleFromTable) return

    setUser((prev) =>
      prev && prev.id === userId ? { ...prev, role: roleFromTable } : prev
    )
  } finally {
    setIsRoleLoading(false)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserFromSession(session.user, setUser)
          // Best-effort DB role hydration (does not block initial render).
          void hydrateRoleFromDb(session.user.id, setUser, setIsRoleLoading)
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserFromSession(session.user, setUser)
        void hydrateRoleFromDb(session.user.id, setUser, setIsRoleLoading)
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

      setUserFromSession(data.user, setUser)
      void hydrateRoleFromDb(data.user.id, setUser, setIsRoleLoading)

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

      setUserFromSession(data.user, setUser)
      void hydrateRoleFromDb(data.user.id, setUser, setIsRoleLoading)

      toast.success('Registered successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading, isRoleLoading }}>
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