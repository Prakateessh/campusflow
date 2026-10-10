import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface QueueItem {
  id: number;
  kind: string;
  title: string;
  status: string;
  purpose: string | null;
  return_by: string | null;
  created_at: string;
  submitted_at: string | null;
  facility_id: number;
  facility_code: string;
  facility_name: string;
  requester_name: string;
  requester_email: string;
  sponsor_name: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  submitted: 'Awaiting sponsor',
  pending_approval: 'Awaiting technician',
  approved: 'Approved',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
};

const KIND_LABEL: Record<string, string> = {
  lab: 'Lab',
  canteen: 'Canteen',
  library: 'Library',
  sports: 'Sports',
  store: 'Store',
};

export default function AdminQueue() {
  const { user } = useAuth();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [decided, setDecided] = useState<Record<number, string>>({});

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/queue?approver_id=${user.id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to load queue');
      }
      const data = await res.json();
      setQueue(data.queue ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openItem = useMemo(
    () => queue.find((q) => q.id === activeId) ?? null,
    [queue, activeId],
  );

  const submitDecision = async (decision: 'approved' | 'rejected' | 'needs_info') => {
    if (!user || !openItem) return;
    setDeciding(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests/${openItem.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: user.id,
          decision,
          comments: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Decision failed');
      }

      const result = await res.json();
      setDecided((d) => ({ ...d, [openItem.id]: result.status }));
      setActiveId(null);
      setNote('');
      await reload();
    } catch (err: any) {
      setError(err.message ?? 'Decision failed');
    } finally {
      setDeciding(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const roleTitle: Record<string, string> = {
    faculty: 'Requests awaiting your sponsorship',
    technician: 'Requests awaiting your review',
    admin: 'All active requests',
  };

  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Approval queue</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${String(queue.length).padStart(2, '0')} pending`}
          </span>
        </div>
        {user && (
          <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
            {roleTitle[user.role] ?? 'Your queue'}
          </p>
        )}
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
            <span className="col-span-3 label">Lab</span>
            <span className="col-span-2 label text-right">Status</span>
          </div>

          <div className="divide-y divide-[var(--color-rule)]">
            {loading ? (
              <div className="py-24 text-center">
                <span className="label">Loading…</span>
              </div>
            ) : queue.length === 0 ? (
              <div className="py-24 text-center">
                <span className="label">Queue is clear</span>
              </div>
            ) : (
              queue.map((q) => {
                const alreadyDecided = decided[q.id];
                return (
                  <div
                    key={q.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-5 items-center"
                  >
                    <div className="md:col-span-2 flex flex-col gap-1">
                      <span className="label num">R-{String(q.id).padStart(4, '0')}</span>
                      <span className="text-[12px] text-[var(--color-ink-4)] num">
                        {formatDate(q.submitted_at)} · {formatTime(q.submitted_at)}
                      </span>
                    </div>

                    <div className="md:col-span-5">
                      <p className="text-[16px]">{q.title}</p>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                        {q.requester_name}
                        {q.sponsor_name ? ` · sponsor ${q.sponsor_name}` : ''}
                      </p>
                      {q.purpose && (
                        <p className="mt-2 text-[12px] text-[var(--color-ink-4)] leading-relaxed line-clamp-2">
                          {q.purpose}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-3">
                      <p className="text-[14px] text-[var(--color-ink-2)]">
                        {q.facility_name}
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--color-ink-4)] num">
                        {q.facility_code} · {KIND_LABEL[q.kind] ?? q.kind}
                      </p>
                    </div>

                    <div className="md:col-span-2 md:text-right">
                      {alreadyDecided ? (
                        <span className="label label-accent">
                          {STATUS_LABEL[alreadyDecided] ?? alreadyDecided}
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveId(q.id)}
                          className="btn btn-ghost text-sm"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ════════ REVIEW MODAL ════════ */}
      {openItem && (
        <div
          className="fixed inset-0 z-50 bg-[var(--color-ink)]/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setActiveId(null);
            setNote('');
          }}
        >
          <div
            className="bg-[var(--color-card)] border border-[var(--color-rule)] w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <div className="flex items-center gap-3">
                <span className="label label-accent num">
                  R-{String(openItem.id).padStart(4, '0')}
                </span>
                <span className="label">Review</span>
              </div>
              <button
                onClick={() => {
                  setActiveId(null);
                  setNote('');
                }}
                className="label hover:text-[var(--color-ink)] transition"
              >
                Close
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div>
                <h2 className="text-2xl leading-tight">{openItem.title}</h2>
                <p className="mt-2 text-[14px] text-[var(--color-ink-3)]">
                  {openItem.requester_name} · {openItem.requester_email}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-6 border-t border-b border-[var(--color-rule)] py-5 text-[14px]">
                <div>
                  <dt className="label">Lab</dt>
                  <dd className="mt-2">{openItem.facility_name}</dd>
                  <dd className="mt-0.5 text-[12px] text-[var(--color-ink-3)] num">
                    {openItem.facility_code}
                  </dd>
                </div>
                <div>
                  <dt className="label">Submitted</dt>
                  <dd className="mt-2 num">
                    {formatDate(openItem.submitted_at)} · {formatTime(openItem.submitted_at)}
                  </dd>
                </div>
                {openItem.sponsor_name && (
                  <div>
                    <dt className="label">Sponsor</dt>
                    <dd className="mt-2">{openItem.sponsor_name}</dd>
                  </div>
                )}
                {openItem.return_by && (
                  <div>
                    <dt className="label">Return by</dt>
                    <dd className="mt-2 num">{openItem.return_by}</dd>
                  </div>
                )}
              </dl>

              {openItem.purpose && (
                <div>
                  <span className="label">Purpose</span>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-2)]">
                    {openItem.purpose}
                  </p>
                </div>
              )}

              <div>
                <label className="label block mb-2">Your note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the requester…"
                  className="input resize-none"
                />
              </div>

              <Link
                to={`/requests/${openItem.id}`}
                className="inline-block text-[13px] text-[var(--color-accent)] underline hover:no-underline"
              >
                View full request →
              </Link>
            </div>

            <div className="px-6 py-5 border-t border-[var(--color-rule)] bg-[var(--color-surface-low)] grid grid-cols-3 gap-3">
              <button
                onClick={() => submitDecision('rejected')}
                disabled={deciding}
                className="btn btn-outline text-sm disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => submitDecision('needs_info')}
                disabled={deciding}
                className="btn btn-ghost text-sm disabled:opacity-50"
              >
                Request info
              </button>
              <button
                onClick={() => submitDecision('approved')}
                disabled={deciding}
                className="btn btn-accent text-sm disabled:opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}