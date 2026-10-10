import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();
  const user = { dept: 'CSE', year: 'Semester 5' };

  const linkClass = (path: string, exact = false) => {
    const active = exact ? pathname === path : pathname.startsWith(path);
    return active
      ? 'label label-accent border-b border-[var(--color-accent)] pb-0.5'
      : 'label hover:text-[var(--color-ink)] transition';
  };

  return (
    <header className="bg-[var(--color-card)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 h-20 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[19px] tracking-tight">CampusFlow</span>
            <span className="label text-[10px] text-[var(--color-ink-4)] mt-0.5">
              Amrita Vishwa Vidyapeetham · Ettimadai
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/"           className={linkClass('/', true)}>Home</Link>
          <Link to="/facilities" className={linkClass('/facilities')}>Facilities</Link>
          <Link to="/requests"   className={linkClass('/requests')}>Requests</Link>
          <Link to="/assistant"  className={linkClass('/assistant')}>Assistant</Link>
        </nav>

        <div className="flex items-center gap-6">
          <span className="label hidden md:inline">{user.dept} · {user.year}</span>
          <div className="h-9 w-9 bg-[var(--color-accent)] flex items-center justify-center">
            <span className="font-display text-white text-[15px] leading-none pt-px">A</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-[var(--color-accent)]" />
    </header>
  );
}