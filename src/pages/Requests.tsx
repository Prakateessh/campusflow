import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getRequests, type RequestListItem } from '../lib/api';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  pending_approval: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
  ready: 'Ready',
};

export default function Requests() {
  const [requests, setRequests] = useState<RequestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRequests({ user_id: 8 })
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
  }, []);

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? requests
        : requests.filter((r) => {
            if (filter === 'pending') return r.status === 'pending_approval' || r.status === 'submitted';
            if (filter === 'approved') return r.status === 'approved' || r.status === 'scheduled';
            return r.status === filter;
          }),
    [requests, filter],
  );

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending_approval' || r.status === 'submitted').length,
      approved: requests.filter((r) => r.status === 'approved' || r.status === 'scheduled').length,
      completed: requests.filter((r) => r.status === 'completed').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests],
  );

  const statusStyle = (s: string) => {
    if (s === 'ready' || s === 'scheduled') return 'label label-accent';
    if (s === 'pending_approval' || s === 'submitted') return 'label label-ink';
    return 'label';
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const filters = [
    { id: 'all',       label: 'All',       count: counts.all },
    { id: 'pending',   label: 'Pending',   count: counts.pending },
    { id: 'approved',  label: 'Approved',  count: counts.approved },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'rejected',  label: 'Rejected',  count: counts.rejected },
  ];

  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">My requests</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${String(filtered.length).padStart(2, '0')} / ${requests.length}`}
          </span>
        </div>
      </section>

      <section className="pb-8">
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
      </section>

      <section className="pb-24">
        {error && (
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 mb-6">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        )}

        <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
            <span className="col-span-2 label">ID</span>
            <span className="col-span-5 label">Request</span>
            <span className="col-span-3 label">Facility</span>
            <span className="col-span-2 label text-right">Status</span>
          </div>

          <div className="divide-y divide-[var(--color-rule)]">
            {loading ? (
              <div className="py-24 text-center">
                <span className="label">Loading…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <span className="label">No requests match this filter</span>
              </div>
            ) : (
              filtered.map((r) => (
                <Link
                  key={r.id}
                  to={`/requests/${r.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 items-center transition-colors hover:bg-[var(--color-surface-low)]"
                >
                  <div className="md:col-span-2 flex flex-col gap-1">
                    <span className="label num">R-{String(r.id).padStart(4, '0')}</span>
                    <span className="text-[12px] text-[var(--color-ink-4)] num">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                  <span className="md:col-span-5 text-[16px]">{r.title}</span>
                  <span className="md:col-span-3 text-[15px] text-[var(--color-ink-3)]">
                    {r.facility_name}
                  </span>
                  <span className={`md:col-span-2 md:text-right ${statusStyle(r.status)}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
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