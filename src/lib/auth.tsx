import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type Role = 'student' | 'faculty' | 'technician' | 'service_provider' | 'admin';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  department: string;
  initials: string;
}

export interface DirectoryUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  department: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const STORAGE_KEY = 'campusflow.session';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Sign in failed');
    }

    const data = await res.json();
    const session = data.user as User;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// ═══════════════════════════════════════════════════════════════
// Directory — for login demo list and sponsor dropdowns
// ═══════════════════════════════════════════════════════════════

export async function getUsers(role?: Role): Promise<DirectoryUser[]> {
  const url = new URL(`${API_BASE}/api/users`);
  if (role) url.searchParams.set('role', role);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
  const data = await res.json();
  return data.users ?? [];
}