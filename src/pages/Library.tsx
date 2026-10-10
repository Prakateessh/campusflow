import { useState, useMemo } from 'react';
import Layout from '../components/Layout';

interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string;
  shelf: string;
  total: number;
  available: number;
  borrowedByYou?: { dueDate: string; daysLeft: number; overdue: boolean };
}

const BOOKS: Book[] = [
  { id: 1,  isbn: '978-0132350884', title: 'Clean Code',                               author: 'Robert C. Martin',   shelf: 'CS-A-01', total: 5, available: 2 },
  { id: 2,  isbn: '978-0201616224', title: 'The Pragmatic Programmer',                 author: 'Hunt & Thomas',      shelf: 'CS-A-02', total: 4, available: 3 },
  { id: 3,  isbn: '978-0262033848', title: 'Introduction to Algorithms',               author: 'CLRS',               shelf: 'CS-A-03', total: 6, available: 4, borrowedByYou: { dueDate: '22 Oct 2026', daysLeft: 9,  overdue: false } },
  { id: 4,  isbn: '978-0201633610', title: 'Design Patterns',                          author: 'Gang of Four',       shelf: 'CS-A-04', total: 3, available: 1 },
  { id: 5,  isbn: '978-0134610993', title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', shelf: 'CS-B-01', total: 4, available: 2, borrowedByYou: { dueDate: '18 Oct 2026', daysLeft: 5,  overdue: false } },
  { id: 6,  isbn: '978-0131873742', title: 'Digital Signal Processing',                author: 'Proakis & Manolakis',shelf: 'EC-A-01', total: 5, available: 3 },
  { id: 7,  isbn: '978-0190853464', title: 'Microelectronic Circuits',                 author: 'Sedra & Smith',      shelf: 'EC-A-02', total: 6, available: 4, borrowedByYou: { dueDate: '10 Oct 2026', daysLeft: -3, overdue: true } },
  { id: 8,  isbn: '978-0138147570', title: 'Signals and Systems',                      author: 'Oppenheim & Willsky',shelf: 'EC-A-03', total: 5, available: 2 },
  { id: 9,  isbn: '978-0132126953', title: 'Computer Networks',                        author: 'Tanenbaum',          shelf: 'CS-C-01', total: 4, available: 2 },
  { id: 10, isbn: '978-1118063330', title: 'Operating System Concepts',                author: 'Silberschatz',       shelf: 'CS-C-02', total: 5, available: 3 },
  { id: 11, isbn: '978-0133918922', title: 'Engineering Mechanics: Statics',           author: 'Hibbeler',           shelf: 'ME-A-01', total: 4, available: 2 },
  { id: 12, isbn: '978-8131808146', title: 'Strength of Materials',                    author: 'R.K. Bansal',        shelf: 'ME-A-02', total: 6, available: 5 },
  { id: 13, isbn: '978-0073398273', title: 'Fluid Mechanics',                          author: 'Cengel & Cimbala',   shelf: 'ME-A-03', total: 3, available: 1 },
  { id: 14, isbn: '978-0073402611', title: 'Organic Chemistry',                        author: 'Morrison & Boyd',    shelf: 'CH-A-01', total: 4, available: 3 },
  { id: 15, isbn: '978-0980232776', title: 'Linear Algebra Done Right',                author: 'Sheldon Axler',      shelf: 'MA-A-01', total: 3, available: 2 },
];

type Filter = 'all' | 'available' | 'borrowed' | 'overdue';

export default function Library() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [renewals, setRenewals] = useState<Record<number, boolean>>({});
  const [confirmed, setConfirmed] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOOKS.filter((b) => {
      const matchesQuery =
        q === '' ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q);

      const matchesFilter =
        filter === 'all' ? true :
        filter === 'available' ? b.available > 0 :
        filter === 'borrowed'  ? !!b.borrowedByYou :
        filter === 'overdue'   ? !!b.borrowedByYou?.overdue : true;

      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  const borrowedCount = BOOKS.filter((b) => b.borrowedByYou).length;
  const overdueCount = BOOKS.filter((b) => b.borrowedByYou?.overdue).length;

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'all',       label: 'All',        count: BOOKS.length },
    { id: 'available', label: 'Available',  count: BOOKS.filter((b) => b.available > 0).length },
    { id: 'borrowed',  label: 'Borrowed',   count: borrowedCount },
    { id: 'overdue',   label: 'Overdue',    count: overdueCount },
  ];

  const toggleRenew = (id: number) => {
    setRenewals((r) => ({ ...r, [id]: !r[id] }));
  };

  const confirmRenewal = (id: number) => {
    setConfirmed(id);
    setTimeout(() => setConfirmed(null), 2400);
  };

  return (
    <Layout>
      {/* HEADING */}
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Library</h1>
          </div>
          <span className="label">
            {borrowedCount} borrowed{overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}
          </span>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
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

      {/* BOOK LIST */}
      <section className="pb-24">
        <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
            <span className="col-span-5 label">Title</span>
            <span className="col-span-3 label">Author</span>
            <span className="col-span-2 label">Shelf</span>
            <span className="col-span-2 label text-right">Status</span>
          </div>

          <div className="divide-y divide-[var(--color-rule)]">
            {filtered.map((b) => {
              const borrowed = b.borrowedByYou;
              const isRenewing = renewals[b.id];
              const wasConfirmed = confirmed === b.id;

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
                    {b.shelf}
                  </span>

                  {/* Right — status OR renew action */}
                  <div className="md:col-span-2 md:text-right">
                    {borrowed ? (
                      wasConfirmed ? (
                        <span className="label label-accent">Renewed · 14 days</span>
                      ) : isRenewing ? (
                        <div className="flex items-center md:justify-end gap-2">
                          <button
                            onClick={() => toggleRenew(b.id)}
                            className="label hover:text-[var(--color-ink)] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => confirmRenewal(b.id)}
                            className="btn btn-accent text-[12px] py-1.5 px-3"
                          >
                            Renew
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleRenew(b.id)}
                          className="text-right"
                        >
                          {borrowed.overdue ? (
                            <span className="label label-accent">
                              Overdue · {Math.abs(borrowed.daysLeft)}d
                            </span>
                          ) : (
                            <span className="label">
                              Due in {borrowed.daysLeft}d
                            </span>
                          )}
                        </button>
                      )
                    ) : b.available > 0 ? (
                      <span className="label">
                        {String(b.available).padStart(2, '0')} available
                      </span>
                    ) : (
                      <span className="label">Unavailable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <span className="label">No books match your search</span>
          </div>
        )}
      </section>
    </Layout>
  );
}