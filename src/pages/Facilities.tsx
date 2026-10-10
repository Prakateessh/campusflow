import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { FACILITIES, CATEGORIES, type CategoryId } from '../data/facilities';

export default function Facilities() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return FACILITIES.filter((f) => {
      const matchesCategory = activeCategory === 'all' || f.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === '' ||
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <Layout>
      {/* HEADING */}
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Facilities</h1>
          </div>
          <span className="label num">
            {String(filtered.length).padStart(2, '0')} / {FACILITIES.length}
          </span>
        </div>
      </section>

      {/* FILTERS */}
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

      {/* LIST */}
      <section className="pb-24">
        <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
            <span className="col-span-1 label">Code</span>
            <span className="col-span-6 label">Facility</span>
            <span className="col-span-3 label">Category</span>
            <span className="col-span-2 label text-right">View</span>
          </div>

          <div className="divide-y divide-[var(--color-rule)]">
            {filtered.map((f) => {
              const cat = CATEGORIES.find((c) => c.id === f.category);
              return (
                <Link
                  key={f.id}
                  to={`/facilities/${f.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 items-center transition-colors hover:bg-[var(--color-surface-low)]"
                >
                  <span className="md:col-span-1 label num">{f.code}</span>
                  <span className="md:col-span-6 text-[16px]">{f.name}</span>
                  <span className="md:col-span-3 text-[15px] text-[var(--color-ink-3)]">
                    {cat?.name}
                  </span>
                  <span className="md:col-span-2 md:text-right text-[var(--color-ink-4)]">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <span className="label">No facilities match your filters</span>
          </div>
        )}
      </section>
    </Layout>
  );
}