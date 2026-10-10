import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

interface BackTarget {
  label: string;
  to: string;
}

function getBackTarget(pathname: string): BackTarget | null {
  if (pathname === '/') return null;

  // Child of a section → return to the section
  if (pathname.startsWith('/facilities/')) {
    return { label: 'All facilities', to: '/facilities' };
  }
  if (pathname.startsWith('/requests/')) {
    return { label: 'My requests', to: '/requests' };
  }

  // Section index → return to home
  const homeChildren = [
    '/facilities',
    '/requests',
    '/canteen',
    '/library',
    '/sports',
    '/store',
    '/assistant',
    '/admin',
  ];
  if (homeChildren.includes(pathname)) {
    return { label: 'Home', to: '/' };
  }

  // Fallback
  return { label: 'Home', to: '/' };
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const back = getBackTarget(pathname);

  const linkClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return active
      ? 'label label-accent border-b border-[var(--color-accent)] pb-0.5'
      : 'label hover:text-[var(--color-ink)] transition';
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[var(--color-card)] sticky top-0 z-40">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 h-20 flex items-center justify-between">

        {/* Left — back + logo */}
        <div className="flex items-center gap-4">
          {back && (
            <>
              <Link
                to={back.to}
                className="group flex items-center gap-2 text-[var(--color-ink-3)] hover:text-[var(--color-accent)] transition-colors"
                aria-label={`Back to ${back.label}`}
              >
                <span className="text-[16px] leading-none transition-transform group-hover:-translate-x-0.5">
                  ←
                </span>
                <span className="hidden md:inline label group-hover:text-[var(--color-accent)] transition-colors">
                  {back.label}
                </span>
              </Link>
              <span className="hidden md:block w-px h-6 bg-[var(--color-rule)]" />
            </>
          )}

          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[19px] tracking-tight">CampusFlow</span>
              <span className="label text-[10px] text-[var(--color-ink-4)] mt-0.5">
                Amrita Vishwa Vidyapeetham · Ettimadai
              </span>
            </div>
          </Link>
        </div>

        {/* Center — nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/"           className={linkClass('/', true)}>Home</Link>
          <Link to="/facilities" className={linkClass('/facilities')}>Facilities</Link>
          <Link to="/assistant"  className={linkClass('/assistant')}>Assistant</Link>
          <Link to="/admin"      className={linkClass('/admin')}>Queue</Link>
        </nav>

        {/* Right — user menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-3 group"
            >
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-[14px] text-[var(--color-ink)]">{user.name}</span>
                <span className="label text-[10px] text-[var(--color-ink-4)] mt-0.5">
                  {user.department}
                  {user.year ? ` · ${user.year}` : ''}
                </span>
              </div>
              <div className="h-10 w-10 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="font-display text-white text-[15px] leading-none pt-px">
                  {user.initials}
                </span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-[var(--color-card)] border border-[var(--color-rule)] shadow-lg z-50">
                <div className="px-4 py-3 border-b border-[var(--color-rule)]">
                  <p className="text-[14px]">{user.name}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--color-ink-3)] truncate">
                    {user.email}
                  </p>
                </div>

                <Link
                  to="/requests"
                  className="block px-4 py-3 text-[14px] hover:bg-[var(--color-surface-low)] transition-colors"
                >
                  My requests
                </Link>

                {user.role === 'admin' || user.role === 'technician' || user.role === 'faculty' ? (
                  <Link
                    to="/admin"
                    className="block px-4 py-3 text-[14px] hover:bg-[var(--color-surface-low)] transition-colors border-t border-[var(--color-rule)]"
                  >
                    Approval queue
                  </Link>
                ) : null}

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-[14px] text-[var(--color-accent)] hover:bg-[var(--color-surface-low)] transition-colors border-t border-[var(--color-rule)]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gradient rule */}
      <div className="h-px bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent)] to-transparent" />
    </header>
  );
}