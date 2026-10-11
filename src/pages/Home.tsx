import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getRequests, type RequestListItem } from '../lib/api';

interface Tile {
  name: string;
  desc: string;
  to: string;
  image: string;
}

const LAB_TILE: Tile = {
  name: 'Lab access',
  desc: 'Request equipment, components, or a supervised slot.',
  to: '/facilities',
  image: '/lab.jpeg',
};

const CANTEEN_TILE: Tile = {
  name: 'Canteen',
  desc: 'Pre-order meals for pickup at your chosen time.',
  to: '/canteen',
  image: '/canteen.jpeg',
};

const LIBRARY_TILE: Tile = {
  name: 'Library',
  desc: 'Renew your active loans.',
  to: '/library',
  image: '/library.jpeg',
};

const SPORTS_TILE: Tile = {
  name: 'Sports',
  desc: 'Borrow sports equipment.',
  to: '/sports',
  image: '/sports.jpeg',
};

const STORE_TILE: Tile = {
  name: 'Stores',
  desc: 'Reserve stationery and daily essentials.',
  to: '/store',
  image: '/store.jpeg',
};

const QUEUE_TILE: Tile = {
  name: 'Approval queue',
  desc: 'Review requests awaiting your decision.',
  to: '/admin',
  image: '/lab.jpeg',
};

const CANTEEN_QUEUE_TILE: Tile = {
  name: 'Order queue',
  desc: 'Prepare incoming canteen orders and mark them ready.',
  to: '/canteen',
  image: '/canteen.jpeg',
};

const LIBRARY_QUEUE_TILE: Tile = {
  name: 'Renewals log',
  desc: 'Recent book renewals from students and faculty.',
  to: '/library',
  image: '/library.jpeg',
};

function getTiles(role: string, department: string): Tile[] {
  if (role === 'student') {
    return [LAB_TILE, CANTEEN_TILE, LIBRARY_TILE, SPORTS_TILE, STORE_TILE];
  }
  if (role === 'faculty') {
    return [LAB_TILE, CANTEEN_TILE, LIBRARY_TILE, STORE_TILE, QUEUE_TILE];
  }
  if (role === 'technician') {
    return [CANTEEN_TILE, LIBRARY_TILE, STORE_TILE, QUEUE_TILE];
  }
  if (role === 'service_provider') {
    if (department === 'Canteen') {
      return [CANTEEN_QUEUE_TILE];
    }
    if (department === 'Library') {
      return [LIBRARY_QUEUE_TILE];
    }
    return [];
  }
  if (role === 'admin') {
    return [LAB_TILE, CANTEEN_TILE, LIBRARY_TILE, SPORTS_TILE, STORE_TILE, QUEUE_TILE];
  }
  return [];
}

export default function Home() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isRequesterRole =
    user?.role === 'student' || user?.role === 'faculty' || user?.role === 'admin';

  useEffect(() => {
    if (!user || !isRequesterRole) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    getRequests({ user_id: user.id })
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, isRequesterRole]);

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

  const tiles = useMemo(() => {
    if (!user) return [];
    return getTiles(user.role, user.department);
  }, [user]);

  const gridClass = (() => {
    if (tiles.length === 1) return 'grid-cols-1';
    if (tiles.length === 2) return 'grid-cols-1 md:grid-cols-2';
    if (tiles.length === 3) return 'grid-cols-1 md:grid-cols-3';
    if (tiles.length === 4) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-6';
  })();

  const spanFor = (index: number, total: number) => {
    if (total === 1) return 'md:col-span-1';
    if (total === 2) return 'md:col-span-1';
    if (total === 3) return 'md:col-span-1';
    if (total === 4) return 'md:col-span-1';
    if (total === 6) return 'md:col-span-2';
    return index < 3 ? 'md:col-span-2' : 'md:col-span-3';
  };

  const roleLabel: Record<string, string> = {
    student: 'Student',
    faculty: 'Faculty',
    technician: 'Technician',
    service_provider: 'Service Provider',
    admin: 'Admin',
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

      {isRequesterRole && (
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
      )}

      {tiles.length > 0 && (
        <section className="pb-24">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="section-rule" />
              <h2 className="text-2xl md:text-3xl">
                {user?.role === 'technician' || user?.role === 'service_provider'
                  ? 'Your workspace'
                  : 'Services'}
              </h2>
            </div>
            <span className="label num">
              {String(tiles.length).padStart(2, '0')} available
            </span>
          </div>

          <div className={`grid ${gridClass} border-t border-l border-[var(--color-rule)]`}>
            {tiles.map((t, i) => (
              <Link
                key={t.name}
                to={t.to}
                className={`group relative bg-[var(--color-card)] p-8 border-r border-b border-[var(--color-rule)] transition-colors overflow-hidden min-h-[280px] flex flex-col justify-between ${spanFor(i, tiles.length)}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundImage: `url(${t.image})` }}
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
                    {t.name}
                  </h3>
                  <p className="mt-3 text-[15px] text-[var(--color-ink-3)] group-hover:text-white/85 leading-relaxed transition-colors">
                    {t.desc}
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