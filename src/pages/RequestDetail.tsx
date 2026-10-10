import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';
import { getRequestDetail, type RequestDetail as RequestDetailData } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Awaiting sponsor',
  pending_approval: 'Awaiting technician',
  approved: 'Approved',
  rejected: 'Rejected',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
};

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState<RequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [decisionNote, setDecisionNote] = useState('');
  const [deciding, setDeciding] = useState(false);

  // Fetch request
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRequestDetail(Number(id))
      .then((res) => {
        if (cancelled) return;
        if (!res) setError('not_found');
        else setData(res);
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
  }, [id]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const reload = async () => {
    if (!id) return;
    const res = await getRequestDetail(Number(id));
    if (res) setData(res);
  };

  const submitDecision = async (decision: 'approved' | 'rejected' | 'needs_info') => {
    if (!user || !data) return;
    setDeciding(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests/${data.request.id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: user.id,
          decision,
          comments: decisionNote.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? 'Decision failed');
      }

      const result = await res.json();
      flash(`Marked as ${result.status}`);
      setDecisionNote('');
      await reload();
    } catch (err: any) {
      flash(err.message ?? 'Decision failed');
    } finally {
      setDeciding(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <span className="label">Loading…</span>
        </div>
      </Layout>
    );
  }

  if (error === 'not_found' || !data) {
    return (
      <Layout>
        <section className="py-24 text-center">
          <span className="label label-accent">404</span>
          <h1 className="mt-4 text-3xl">Request not found</h1>
          <Link to="/requests" className="btn-link text-sm inline-block mt-6">
            ← Back to requests
          </Link>
        </section>
      </Layout>
    );
  }

  const { request: req, items, approvals } = data;
  const requestId = `R-${String(req.id).padStart(4, '0')}`;

  const statusStyle =
    req.status === 'approved' || req.status === 'scheduled'
      ? 'label label-accent'
      : req.status === 'submitted' || req.status === 'pending_approval'
      ? 'label label-ink'
      : 'label';

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Can the current user act on this request?
  const canAct =
    user &&
    ((user.role === 'faculty' && req.status === 'submitted' && user.id === req.sponsor_id) ||
      (user.role === 'technician' && req.status === 'pending_approval') ||
      (user.role === 'admin' && !['completed', 'rejected', 'cancelled'].includes(req.status)));

  // Timeline
  const timeline: Array<{
    label: string;
    actor: string;
    note?: string;
    at: string | null;
    state: 'done' | 'active' | 'pending';
  }> = [];

  timeline.push({
    label: 'Submitted',
    actor: req.requester_name,
    at: formatDate(req.submitted_at),
    state: 'done',
  });

  for (const a of approvals) {
    timeline.push({
      label:
        a.decision === 'approved'
          ? `${a.approver_role} approved`
          : a.decision === 'rejected'
          ? `${a.approver_role} rejected`
          : 'Info requested',
      actor: a.approver_name,
      note: a.comments ?? undefined,
      at: formatDate(a.decided_at),
      state: 'done',
    });
  }

  if (req.status === 'submitted') {
    timeline.push({
      label: 'Awaiting sponsor',
      actor: 'Faculty review',
      at: null,
      state: 'active',
    });
  } else if (req.status === 'pending_approval') {
    timeline.push({
      label: 'Awaiting technician',
      actor: 'Lab review',
      at: null,
      state: 'active',
    });
  } else if (req.status === 'approved' || req.status === 'scheduled') {
    timeline.push({
      label: 'Approved',
      actor: 'System',
      at: formatDate(req.approved_at),
      state: 'active',
    });
  } else if (req.status === 'completed') {
    timeline.push({
      label: 'Completed',
      actor: 'System',
      at: formatDate(req.completed_at),
      state: 'done',
    });
  }

  return (
    <Layout>
      <section className="pt-10 pb-6">
        <Link to="/requests" className="label hover:text-[var(--color-ink)] transition">
          ← All requests
        </Link>
      </section>

      <section className="pb-12">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="label label-accent num">{requestId}</span>
          <span className="w-6 h-px bg-[var(--color-rule)]" />
          <span className={statusStyle}>{STATUS_LABEL[req.status] ?? req.status}</span>
        </div>
        <h1 className="text-3xl md:text-4xl leading-tight max-w-3xl">{req.title}</h1>
        <p className="mt-4 text-[15px] text-[var(--color-ink-3)]">
          {req.facility_name} · {req.facility_code}
        </p>
      </section>

      <section className="pb-24">
        <div className="grid grid-cols-12 gap-10">

          <div className="col-span-12 lg:col-span-8 space-y-12">
            {req.purpose && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="section-rule" />
                  <h2 className="text-lg">Purpose</h2>
                </div>
                <p className="text-[16px] text-[var(--color-ink-2)] leading-relaxed">
                  {req.purpose}
                </p>
              </div>
            )}

            {req.description && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="section-rule" />
                  <h2 className="text-lg">Notes</h2>
                </div>
                <p className="text-[15px] text-[var(--color-ink-2)] leading-relaxed">
                  {req.description}
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="section-rule" />
                    <h2 className="text-lg">Items</h2>
                  </div>
                  <span className="label num">
                    {String(items.length).padStart(2, '0')} line{items.length > 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                  {items.map((item) => {
                    const itemName =
                      item.menu_item_name ?? item.inventory_item_name ?? item.item_type;
                    return (
                      <li key={item.id} className="flex items-start gap-4 px-5 py-4">
                        <span className="label num shrink-0 mt-0.5 w-8">
                          {String(item.quantity).padStart(2, '0')}×
                        </span>
                        <div className="flex-1">
                          <p className="text-[15px]">{itemName}</p>
                          {item.notes && (
                            <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        {item.price_cents != null && (
                          <span className="text-[15px] num">
                            ₹{(item.price_cents * item.quantity) / 100}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="section-rule" />
                <h2 className="text-lg">Timeline</h2>
              </div>
              <ol className="space-y-6">
                {timeline.map((step, i) => (
                  <li key={i} className="grid grid-cols-12 gap-4">
                    <div className="col-span-1 flex justify-center pt-1.5">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 ${
                          step.state === 'done'
                            ? 'bg-[var(--color-ink)]'
                            : step.state === 'active'
                            ? 'bg-[var(--color-accent)]'
                            : 'bg-[var(--color-ink-4)]'
                        }`}
                      />
                    </div>
                    <div className="col-span-11">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-[15px]">{step.label}</span>
                        <span className="label num shrink-0">{step.at ?? '—'}</span>
                      </div>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">{step.actor}</p>
                      {step.note && (
                        <p className="mt-2 text-[14px] text-[var(--color-ink-2)] leading-relaxed italic">
                          “{step.note}”
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 space-y-8">
            {/* Decision panel — only for approvers */}
            {canAct && (
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
                <div className="px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
                  <span className="label label-accent">Your decision</span>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <textarea
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    rows={3}
                    placeholder="Add a note for the requester (optional)…"
                    className="input resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => submitDecision('rejected')}
                      disabled={deciding}
                      className="btn btn-outline text-sm disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => submitDecision('approved')}
                      disabled={deciding}
                      className="btn btn-accent text-sm disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </div>
                  <button
                    onClick={() => submitDecision('needs_info')}
                    disabled={deciding}
                    className="btn btn-ghost text-sm w-full disabled:opacity-50"
                  >
                    Request more info
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Details</span>
              <dl className="mt-4 space-y-3 text-[15px]">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Submitted</dt>
                  <dd className="num text-right">{formatDate(req.submitted_at) ?? '—'}</dd>
                </div>
                {req.return_by && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-ink-3)] shrink-0">Return by</dt>
                    <dd className="num text-right">{req.return_by}</dd>
                  </div>
                )}
                {req.scheduled_start && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-ink-3)] shrink-0">Scheduled</dt>
                    <dd className="num text-right">{formatDate(req.scheduled_start)}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Requester</dt>
                  <dd className="text-right">{req.requester_name}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Lab</dt>
                  <dd className="text-right">{req.facility_code}</dd>
                </div>
              </dl>
            </div>

            {req.sponsor_name && (
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Sponsor</span>
                <p className="mt-4 text-[15px]">{req.sponsor_name}</p>
                {req.sponsor_dept && (
                  <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">{req.sponsor_dept}</p>
                )}
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Related</span>
              <Link
                to={`/facilities/${req.facility_id}`}
                className="mt-4 inline-flex items-center gap-2 text-[15px] hover:text-[var(--color-accent)] transition-colors"
              >
                View lab →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-ink)] text-white px-5 py-3 shadow-lg">
          <span className="text-[14px]">{toast}</span>
        </div>
      )}
    </Layout>
  );
}