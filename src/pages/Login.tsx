import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getUsers, type DirectoryUser } from '../lib/auth';

const ROLE_LABEL: Record<string, string> = {
  student: 'Student',
  faculty: 'Faculty',
  technician: 'Technician',
  service_provider: 'Service Provider',
  admin: 'Admin',
};

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!showAccounts || directory.length > 0) return;
    let cancelled = false;
    setDirectoryLoading(true);

    getUsers()
      .then((users) => {
        if (!cancelled) setDirectory(users);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDirectoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showAccounts, directory.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo');
    setError('');
    setShowAccounts(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[20px] tracking-tight">CampusFlow</span>
              <span className="label text-[10px] text-[var(--color-ink-4)] mt-0.5">
                Amrita Vishwa Vidyapeetham · Ettimadai
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <span className="section-rule" />
            <span className="label label-accent">Sign in</span>
          </div>
          <h1 className="text-3xl leading-tight">Welcome back.</h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-3)] leading-relaxed">
            Use your campus credentials to access your requests, bookings, and orders.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="label block mb-2">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cb.amrita.edu"
                className="input"
              />
            </div>

            <div>
              <label className="label block mb-2">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>

            {error && (
              <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
                <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--color-rule)]">
            <button
              type="button"
              onClick={() => setShowAccounts((s) => !s)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="label">Demo accounts</span>
              <span className="text-[12px] text-[var(--color-ink-4)]">
                {showAccounts ? '−' : '+'}
              </span>
            </button>

            {showAccounts && (
              <div className="mt-4 space-y-2">
                <p className="text-[12px] text-[var(--color-ink-4)] leading-relaxed mb-3">
                  Password for all accounts: <code className="text-[var(--color-ink-3)]">demo</code>
                </p>

                {directoryLoading && (
                  <div className="py-4 text-center">
                    <span className="label">Loading…</span>
                  </div>
                )}

                {!directoryLoading && directory.length === 0 && (
                  <div className="py-4 text-center">
                    <span className="label">No accounts available</span>
                  </div>
                )}

                {directory.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => fillDemo(acc.email)}
                    className="w-full text-left px-3 py-2 border border-[var(--color-rule)] hover:border-[var(--color-accent)] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] truncate">
                        {acc.name} · {ROLE_LABEL[acc.role] ?? acc.role}
                      </span>
                      <span className="text-[11px] text-[var(--color-ink-4)] num truncate">
                        {acc.email}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--color-ink-4)] group-hover:text-[var(--color-accent)] transition-colors shrink-0 ml-3">
                      Use
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 border-l border-[var(--color-rule)] bg-[var(--color-card)] items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-soft)] via-transparent to-transparent" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-gradient-to-bl from-[var(--color-accent)]/10 to-transparent" />

        <div className="max-w-md relative">
          <span className="label label-accent">Access</span>
          <h2 className="mt-6 text-3xl leading-tight">
            One portal for every campus resource.
          </h2>

          <ul className="mt-12 space-y-6 border-t border-[var(--color-rule)] pt-8">
            {[
              { k: 'Labs',    v: 'Equipment, components, supervised slots' },
              { k: 'Canteen', v: 'Pre-order meals, skip the queue' },
              { k: 'Library', v: 'Search, borrow, and renew' },
              { k: 'Sports',  v: 'Borrow sports equipment' },
              { k: 'Stores',  v: 'Reserve essentials for pickup' },
            ].map((item) => (
              <li key={item.k} className="flex items-baseline justify-between gap-6">
                <span className="label label-ink shrink-0">{item.k}</span>
                <span className="text-[14px] text-[var(--color-ink-2)] text-right leading-relaxed">
                  {item.v}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-12 text-[13px] text-[var(--color-ink-4)] leading-relaxed">
            Single sign-on with campus credentials. No separate accounts.
          </p>
        </div>
      </div>
    </div>
  );
}