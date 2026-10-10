import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'technician' | 'service_provider' | 'admin';
  department: string;
  year?: string;
  initials: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const STORAGE_KEY = 'campusflow.session';

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 8,
    email: 'ashwin@cb.amrita.edu',
    password: 'demo',
    name: 'Ashwin Raj',
    role: 'student',
    department: 'CSE',
    year: 'Semester 5',
    initials: 'AR',
  },
  {
    id: 9,
    email: 'divya@cb.amrita.edu',
    password: 'demo',
    name: 'Divya Menon',
    role: 'student',
    department: 'ECE',
    year: 'Semester 5',
    initials: 'DM',
  },
  {
    id: 2,
    email: 'priya@cb.amrita.edu',
    password: 'demo',
    name: 'Dr. Priya Nair',
    role: 'faculty',
    department: 'CSE',
    initials: 'PN',
  },
  {
    id: 4,
    email: 'suresh@cb.amrita.edu',
    password: 'demo',
    name: 'Suresh M.',
    role: 'technician',
    department: 'ECE Labs',
    initials: 'SM',
  },
  {
    id: 1,
    email: 'admin@cb.amrita.edu',
    password: 'demo',
    name: 'Admin',
    role: 'admin',
    department: 'Administration',
    initials: 'AD',
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        setUser(parsed);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    await new Promise((r) => setTimeout(r, 500));

    const normalized = email.trim().toLowerCase();
    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === normalized && u.password === password,
    );

    if (!found) {
      throw new Error('Invalid email or password.');
    }

    const { password: _pw, ...session } = found;
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