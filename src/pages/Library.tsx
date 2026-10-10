import { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  total_copies: number;
  available_copies: number;
  shelf_code: string;
}

type Filter = 'all' | 'available' | 'out';

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [renewing, setRenewing] = useState<number | null>(null);
  const [renewed, setRenewed] = useState<Record<number, { due_date: string; days: number }>>({});

  // Debounce search + fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (filter === 'available') params.set('filter', 'available');
      if (filter === 'out') params.set('filter', 'out');

      fetch(`${API_BASE}/api/library/books?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          if (!cancelled) setBooks(data.books ?? []);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, filter]);

  const counts = useMemo(
    () => ({
      all: books.length,
      available: books.filter((b) => b.available_copies > 0).length,
      out: books.filter((b) => b.available_copies === 0).length,
    }),
    [books],
  );

  const handleRenew = async (book: Book) => {
    if (renewing) return;
    setRenewing(book.id);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/library/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 8, book_id: book.id }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message ?? `Renewal failed: ${res.status}`);
      }

      const data = await res.json();
      setRenewed((r) => ({
        ...r,
        [book.id]: { due_date: data.due_date, days: data.days },
      }));
    } catch (err: any) {
      setError(err.message ?? 'Failed to renew');
    } finally {
      setRenewing(null);
    }
  };

  const formatDueDate = (iso: string) => {
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'available', label: 'Available', count: counts.available },
    { id: 'out', label: 'Out', count: counts.out },
  ];

  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Library</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${String(books.length).padStart(2, '0')} shown`}
          </span>
        </div>
      </section>

      <section className="pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`tag cursor-pointer transition-colors ${
                  filter === f.id ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
                }`}
              >
                {f.label}
                <span className="ml-2 opacity-60 num">{String(f.count).padStart(2, '0')}</span>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search by title, author, or ISBN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input md:max-w-sm"
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
            <span className="col-span-5 label">Title</span>
            <span className="col-span-3 label">Author</span>
            <span className="col-span-2 label">Shelf</span>
            <span className="col-span-2 label text-right">Status</span>
          </div>

          <div className="divide-y divide-[var(--color-rule)]">
            {loading ? (
              <div className="py-24 text-center">
                <span className="label">Loading…</span>
              </div>
            ) : books.length === 0 ? (
              <div className="py-24 text-center">
                <span className="label">No books match your search</span>
              </div>
            ) : (
              books.map((b) => {
                const renewal = renewed[b.id];
                const isRenewing = renewing === b.id;

                return (
                  <div
                    key={b.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 items-center transition-colors hover:bg-[var(--color-surface-low)]"
                  >
                    <div className="md:col-span-5">
                      <h3 className="text-[16px] leading-snug">{b.title}</h3>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-4)] num">{b.isbn}</p>
                    </div>

                    <span className="md:col-span-3 text-[15px] text-[var(--color-ink-3)]">
                      {b.author}
                    </span>

                    <span className="md:col-span-2 text-[14px] num text-[var(--color-ink-3)]">
                      {b.shelf_code}
                    </span>

                    <div className="md:col-span-2 md:text-right">
                      {renewal ? (
                        <span className="label label-accent">
                          Renewed · due {formatDueDate(renewal.due_date)}
                        </span>
                      ) : (
                        <div className="flex items-center md:justify-end gap-3">
                          <span className="label">
                            {b.available_copies > 0
                              ? `${String(b.available_copies).padStart(2, '0')} available`
                              : 'Out'}
                          </span>
                          <button
                            onClick={() => handleRenew(b)}
                            disabled={isRenewing}
                            className="text-[12px] label hover:text-[var(--color-accent)] transition-colors disabled:opacity-30"
                          >
                            {isRenewing ? '···' : 'Renew'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 text-[13px] text-[var(--color-ink-4)] leading-relaxed">
          <span className="label">Note</span> · Renewals extend your loan by 14 days from today.
        </div>
      </section>
    </Layout>
  );
}