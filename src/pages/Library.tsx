import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Loan {
  loan_id: number;
  book_id: number;
  isbn: string;
  title: string;
  author: string;
  shelf_code: string;
  borrowed_at: string;
  due_date: string;
  renewals: number;
}

export default function Library() {
  const { user } = useAuth();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewing, setRenewing] = useState<number | null>(null);

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/library/loans?user_id=${user.id}`,
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to load loans');
      }

      const data = await res.json();
      setLoans(data.loans ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleRenew = async (loan: Loan) => {
    if (!user || renewing) return;
    setRenewing(loan.loan_id);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/library/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          loan_id: loan.loan_id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Renewal failed');
      }

      await reload();
    } catch (err: any) {
      setError(err.message ?? 'Failed to renew');
    } finally {
      setRenewing(null);
    }
  };

  // Days until due. Negative = overdue.
  const daysLeft = (dueDate: string) => {
    const due = new Date(dueDate.replace(' ', 'T'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const overdueCount = loans.filter((l) => daysLeft(l.due_date) < 0).length;

  return (
    <Layout>
      {/* ═══════ HEADING ═══════ */}
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Library</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${String(loans.length).padStart(2, '0')} active`}
          </span>
        </div>

        {!loading && loans.length > 0 && (
          <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
            {overdueCount > 0
              ? `${overdueCount} overdue · renew to extend by 14 days`
              : 'Your active loans. Renew to extend by 14 days.'}
          </p>
        )}
      </section>

      {/* ═══════ BODY ═══════ */}
      <section className="pb-24">
        {error && (
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 mb-6">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">Loading…</span>
          </div>
        ) : loans.length === 0 ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">No active loans</span>
            <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
              Books you borrow from the library will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
            {/* Desktop header row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <span className="col-span-5 label">Book</span>
              <span className="col-span-3 label">Shelf</span>
              <span className="col-span-2 label">Due</span>
              <span className="col-span-2 label text-right">Action</span>
            </div>

            <div className="divide-y divide-[var(--color-rule)]">
              {loans.map((loan) => {
                const days = daysLeft(loan.due_date);
                const overdue = days < 0;
                const dueSoon = days >= 0 && days <= 3;
                const isRenewing = renewing === loan.loan_id;

                return (
                  <div
                    key={loan.loan_id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 items-center transition-colors hover:bg-[var(--color-surface-low)]"
                  >
                    {/* Title + author */}
                    <div className="md:col-span-5">
                      <h3 className="text-[16px] leading-snug">{loan.title}</h3>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                        {loan.author}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--color-ink-4)] num">
                        {loan.isbn}
                      </p>
                    </div>

                    {/* Shelf code */}
                    <div className="md:col-span-3">
                      <span className="label md:hidden">Shelf</span>
                      <p className="mt-1 md:mt-0 text-[14px] num text-[var(--color-ink-3)]">
                        {loan.shelf_code}
                      </p>
                    </div>

                    {/* Due date + urgency */}
                    <div className="md:col-span-2">
                      <span className="label md:hidden">Due</span>
                      <p className="mt-1 md:mt-0 text-[14px] num">
                        {formatDate(loan.due_date)}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] ${
                          overdue || dueSoon
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-ink-4)]'
                        }`}
                      >
                        {overdue
                          ? `Overdue ${Math.abs(days)}d`
                          : days === 0
                          ? 'Due today'
                          : `${days}d left`}
                      </p>
                    </div>

                    {/* Renew button */}
                    <div className="md:col-span-2 md:text-right">
                      <button
                        onClick={() => handleRenew(loan)}
                        disabled={isRenewing}
                        className="btn btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed w-full md:w-auto"
                      >
                        {isRenewing ? '···' : 'Renew'}
                      </button>
                      {loan.renewals > 0 && (
                        <p className="mt-2 text-[11px] text-[var(--color-ink-4)] md:text-right">
                          Renewed {loan.renewals}×
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}