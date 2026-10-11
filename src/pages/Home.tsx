import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getRequests, type RequestListItem } from '../lib/api';

interface ServiceTile {
  name: string;
  desc: string;
  to: string;
  image: string;
}

const ALL_SERVICES: ServiceTile[] = [
  { name: 'Lab access', desc: 'Request equipment, components, or a supervised slot.', to: '/facilities', image: '/lab.jpeg' },
  { name: 'Canteen',    desc: 'Pre-order meals for pickup at your chosen time.',     to: '/canteen',    image: '/canteen.jpeg' },
  { name: 'Library',    desc: 'Renew your active loans.',                            to: '/library',    image: '/library.jpeg' },
  { name: 'Sports',     desc: 'Borrow sports equipment.',                            to: '/sports',     image: '/sports.jpeg' },
  { name: 'Stores',     desc: 'Reserve stationery and daily essentials.',            to: '/store',      image: '/store.jpeg' },
];

function getVisibleServiceNames(role: string, department: string): string[] {
  if (role === 'admin') return ['Lab access', 'Canteen', 'Library', 'Sports', 'Stores'];
  if (role === 'student' || role === 'faculty') return ['Lab access', 'Canteen', 'Library', 'Sports', 'Stores'];
  if (role === 'technician') return ['Lab access'];
  if (role === 'service_provider') {
    if (department === 'Canteen') return ['Canteen'];
    if (department === 'Library') return ['Library'];
    return [];
  }
  return [];
}

export default function Home() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRequests({ user_id: user.id })
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = [
    { label: 'Total',     value: requests.length },
    {
      label: 'Pending',
      value: requests.filter((r) => ['submitted', 'pending_approval'].includes(r.status)).length,
    },
    {
      label: 'Ongoing',
      value: requests.filter((r) => ['approved', 'scheduled', 'in_progress'].includes(r.status)).length,
    },
    {
      label: 'Completed',
      value: requests.filter((r) => r.status === 'completed').length,
    },
  ];

  const visibleServices = useMemo(() => {
    if (!user) return [];
    const names = getVisibleServiceNames(user.role, user.department);
    return ALL_SERVICES.filter((s) => names.includes(s.name));
  }, [user?.role, user?.department]);

  const roleLabel: Record<string, string> = {
    student: 'Student',
    faculty: 'Faculty',
    technician: 'Technician',
    service_provider: 'Service Provider',
    admin: 'Admin',
  };

  // Grid span classes based on tile count
  const gridClass =
    visibleServices.length === 1
      ? 'grid-cols-1'
      : visibleServices.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-6';

  const spanFor = (index: number, total: number) => {
    if (total === 1) return 'md:col-span-1';
    if (total === 2) return 'md:col-span-1';
    if (total === 3) return 'md:col-span-2';
    if (total === 4) return 'md:col-span-3';
    // 5 tiles: 3 up, 2 down
    return index < 3 ? 'md:col-span-2' : 'md:col-span-3';
  };

  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="label">Session 2025–26</span>
            <h1 className="mt-4 text-3xl md:text-4xl">
              Welcome, {user?.name ?? 'there'}.
            </h1>
            {user && (
              <p className="mt-2 text-[13px] text-[var(--color-ink-3)]">
                {roleLabel[user.role] ?? user.role} · {user.department}
              </p>
            )}
          </div>
          <span className="label hidden md:block num">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </section>

      {error && (
        <section className="pb-8">
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        </section>
      )}

      <section className="pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[var(--color-rule)]">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[var(--color-card)] border-r border-b border-[var(--color-rule)] px-8 py-10 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-16 h-px bg-gradient-to-r from-[var(--color-accent)] to-transparent" />
              <span className="label">{s.label}</span>
              <div className="mt-4 font-display text-4xl md:text-5xl num leading-none">
                {loading ? '··' : String(s.value).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {visibleServices.length > 0 && (
        <section className="pb-24">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="section-rule" />
              <h2 className="text-2xl md:text-3xl">Services</h2>
            </div>
            <span className="label num">
              {String(visibleServices.length).padStart(2, '0')} available
            </span>
          </div>

          <div className={`grid ${gridClass} border-t border-l border-[var(--color-rule)]`}>
            {visibleServices.map((s, i) => (
              <Link
                key={s.name}
                to={s.to}
                className={`group relative bg-[var(--color-card)] p-8 border-r border-b border-[var(--color-rule)] transition-colors overflow-hidden min-h-[280px] flex flex-col justify-between ${spanFor(i, visibleServices.length)}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundImage: `url(${s.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-accent-hover)]/85 via-[var(--color-ink)]/70 to-[var(--color-ink)]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex items-start justify-between">
                  <span className="label label-accent group-hover:text-white transition-colors num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[var(--color-ink-4)] group-hover:text-white transition-colors">
                    →
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl group-hover:text-white transition-colors">
                    {s.name}
                  </h3>
                  <p className="mt-3 text-[15px] text-[var(--color-ink-3)] group-hover:text-white/85 leading-relaxed transition-colors">
                    {s.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}