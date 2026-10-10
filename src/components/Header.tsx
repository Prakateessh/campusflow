import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const user = { name: 'Ashwin Raj', dept: 'CSE', year: 'Semester 5' };

  const linkClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return active
      ? 'label label-accent border-b border-[var(--color-accent)] pb-0.5'
      : 'label hover:text-[var(--color-ink)] transition';
  };

  return (
    <header className="bg-[var(--color-card)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 h-20 flex items-center justify-between">

        {/* Left — back (only on sub-pages) + logo */}
        <div className="flex items-center gap-4">
          {!isHome && (
            <>
              <button
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="h-8 w-8 flex items-center justify-center border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
              >
                ←
              </button>
              <span className="w-px h-6 bg-[var(--color-rule)]" />
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

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/"           className={linkClass('/', true)}>Home</Link>
          <Link to="/facilities" className={linkClass('/facilities')}>Facilities</Link>
          <Link to="/assistant"  className={linkClass('/assistant')}>Assistant</Link>
          <Link to="/admin"      className={linkClass('/admin')}>Queue</Link>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <span className="text-[14px] text-[var(--color-ink)]">{user.name}</span>
            <span className="label text-[10px] text-[var(--color-ink-4)] mt-0.5">
              {user.dept} · {user.year}
            </span>
          </div>

          <Link to="/requests" className="group relative" aria-label="My requests">
            <div className="h-10 w-10 bg-[var(--color-accent)] flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-display text-white text-[16px] leading-none pt-px">A</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="h-px bg-[var(--color-accent)]" />
    </header>
  );
}