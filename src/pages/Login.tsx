import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password.');
      return;
    }

    if (!email.endsWith('@cb.amrita.edu') && !email.endsWith('@amrita.edu')) {
      setError('Use your Amrita email address.');
      return;
    }

    setLoading(true);
    // TODO: replace with real auth call
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex">
      {/* Left — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="" className="h-8 w-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[20px] tracking-tight">CampusFlow</span>
              <span className="label text-[10px] text-[var(--color-ink-4)] mt-0.5">
                Amrita Vishwa Vidyapeetham · Ettimadai
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <span className="label label-accent">Sign in</span>
          </div>
          <h1 className="text-3xl leading-tight">
            Welcome back.
          </h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-3)] leading-relaxed">
            Use your campus credentials to access your requests, bookings, and orders.
          </p>

          {/* Form */}
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

          {/* Alternative */}
          <div className="mt-8 pt-8 border-t border-[var(--color-rule)]">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full btn btn-outline text-sm"
            >
              Continue as guest
            </button>
            <p className="mt-4 text-[12px] text-[var(--color-ink-4)] text-center leading-relaxed">
              Guest access is read-only. Bookings require sign-in.
            </p>
          </div>

          {/* Help */}
          <div className="mt-12 text-center">
            <a href="#" className="label hover:text-[var(--color-ink)] transition">
              Forgot password?
            </a>
          </div>
        </div>
      </div>

      {/* Right — visual panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 border-l border-[var(--color-rule)] bg-[var(--color-card)] items-center justify-center p-16">
        <div className="max-w-md">
          <span className="label label-accent">Access</span>
          <h2 className="mt-6 text-3xl leading-tight">
            One portal for every campus resource.
          </h2>

          <ul className="mt-12 space-y-6 border-t border-[var(--color-rule)] pt-8">
            {[
              { k: 'Labs',     v: 'Equipment, components, supervised slots' },
              { k: 'Canteen',  v: 'Pre-order meals, skip the queue' },
              { k: 'Library',  v: 'Search, borrow, and renew' },
              { k: 'Sports',   v: 'Reserve rackets, balls, and gear' },
              { k: 'Stores',   v: 'Reserve essentials for pickup' },
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