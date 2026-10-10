import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getFacilities, type Facility } from '../lib/api';

const CATEGORIES = [
  { id: 'electronics',  name: 'Electronics' },
  { id: 'computing_ai', name: 'Computing & AI' },
  { id: 'energy',       name: 'Energy' },
  { id: 'chemical',     name: 'Chemical' },
  { id: 'innovation',   name: 'Innovation' },
  { id: 'mechanical',   name: 'Mechanical' },
];

export default function Facilities() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: { category?: string; q?: string } = {};
    if (activeCategory !== 'all') params.category = activeCategory;
    if (query.trim()) params.q = query.trim();

    getFacilities(params)
      .then((data) => {
        if (!cancelled) setFacilities(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load facilities');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, query]);

  const categoryName = (id: string) =>
    CATEGORIES.find((c) => c.id === id)?.name ?? id;

  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Labs</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${String(facilities.length).padStart(2, '0')} shown`}
          </span>
        </div>
      </section>

      <section className="pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`tag cursor-pointer transition-colors ${
                activeCategory === 'all' ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`tag cursor-pointer transition-colors ${
                  activeCategory === c.id ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by name or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input md:max-w-xs"
          />
        </div>
      </section>

      <section className="pb-24">
        {error && (
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 mb-6">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        )}

        <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
            <span className="col-span-1 label">Code</span>
            <span className="col-span-6 label">Lab</span>
            <span className="col-span-3 label">Category</span>
            <span className="col-span-2 label text-right">View</span>
          </div>

          <div className="divide-y divide-[var(--color-rule)]">
            {loading ? (
              <div className="py-24 text-center">
                <span className="label">Loading…</span>
              </div>
            ) : facilities.length === 0 ? (
              <div className="py-24 text-center">
                <span className="label">No labs match your filters</span>
              </div>
            ) : (
              facilities.map((f) => (
                <Link
                  key={f.id}
                  to={`/facilities/${f.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 items-center transition-colors hover:bg-[var(--color-surface-low)]"
                >
                  <span className="md:col-span-1 label num">{f.code}</span>
                  <span className="md:col-span-6 text-[16px]">{f.name}</span>
                  <span className="md:col-span-3 text-[15px] text-[var(--color-ink-3)]">
                    {categoryName(f.category)}
                  </span>
                  <span className="md:col-span-2 md:text-right text-[var(--color-ink-4)]">
                    →
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}