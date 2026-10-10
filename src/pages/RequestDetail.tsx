import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getRequestDetail, type RequestDetail as RequestDetailData } from '../lib/api';

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

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<RequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelledReq = false;
    setLoading(true);
    setError(null);

    getRequestDetail(Number(id))
      .then((res) => {
        if (cancelledReq) return;
        if (!res) setError('not_found');
        else setData(res);
      })
      .catch((err) => {
        if (!cancelledReq) setError(err.message);
      })
      .finally(() => {
        if (!cancelledReq) setLoading(false);
      });

    return () => {
      cancelledReq = true;
    };
  }, [id]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
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
  const displayStatus = cancelled ? 'cancelled' : req.status;
  const requestId = `R-${String(req.id).padStart(4, '0')}`;

  const statusStyle =
    displayStatus === 'ready' || displayStatus === 'scheduled'
      ? 'label label-accent'
      : displayStatus === 'pending_approval' || displayStatus === 'submitted'
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

  const formatShortDate = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso.replace(' ', 'T'));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  // Build timeline from request + approvals
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
      label: a.decision === 'approved' ? `${a.approver_role} approved` : a.decision === 'rejected' ? `${a.approver_role} rejected` : 'Info requested',
      actor: a.approver_name,
      note: a.comments ?? undefined,
      at: formatDate(a.decided_at),
      state: 'done',
    });
  }

  if (req.status === 'scheduled' || req.status === 'approved') {
    timeline.push({
      label: 'Scheduled',
      actor: 'System',
      at: formatDate(req.scheduled_start),
      state: 'active',
    });
    timeline.push({
      label: 'Completed',
      actor: 'System',
      at: null,
      state: 'pending',
    });
  } else if (req.status === 'completed') {
    timeline.push({
      label: 'Completed',
      actor: 'System',
      at: formatDate(req.completed_at ?? req.scheduled_end),
      state: 'done',
    });
  } else if (req.status === 'pending_approval' || req.status === 'submitted') {
    timeline.push({
      label: 'Awaiting approval',
      actor: 'Under review',
      at: null,
      state: 'active',
    });
    timeline.push({
      label: 'Scheduled',
      actor: 'System',
      at: null,
      state: 'pending',
    });
  }

  // Actions per status
  const actions: Array<{ label: string; kind: 'primary' | 'outline'; onClick: () => void }> = [];

  if (displayStatus === 'approved' || displayStatus === 'scheduled') {
    actions.push({ label: 'Download pass', kind: 'primary', onClick: () => flash('Pass downloaded · check your email') });
    actions.push({ label: 'Cancel request', kind: 'outline', onClick: () => {
      setCancelled(true);
      flash('Request cancelled');
    }});
  } else if (displayStatus === 'pending_approval' || displayStatus === 'submitted') {
    actions.push({ label: 'Send reminder', kind: 'primary', onClick: () => flash('Reminder sent to approver') });
    actions.push({ label: 'Cancel request', kind: 'outline', onClick: () => {
      setCancelled(true);
      flash('Request cancelled');
    }});
  } else if (displayStatus === 'ready') {
    actions.push({ label: 'Open queue ticket', kind: 'primary', onClick: () => navigate('/canteen') });
  } else if (displayStatus === 'rejected') {
    actions.push({ label: 'Resubmit request', kind: 'primary', onClick: () => navigate('/facilities') });
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
          <span className={statusStyle}>{STATUS_LABEL[displayStatus] ?? displayStatus}</span>
        </div>
        <h1 className="text-3xl md:text-4xl leading-tight max-w-3xl">{req.title}</h1>
        <p className="mt-4 text-[15px] text-[var(--color-ink-3)]">
          {req.facility_name} · {req.facility_code}
        </p>
      </section>

      <section className="pb-24">
        <div className="grid grid-cols-12 gap-10">

          <div className="col-span-12 lg:col-span-8 space-y-12">
            {req.description && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-px bg-[var(--color-accent)]" />
                  <h2 className="text-lg">Description</h2>
                </div>
                <p className="text-[16px] text-[var(--color-ink-2)] leading-relaxed">
                  {req.description}
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-[var(--color-accent)]" />
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
                          <span className="text-[15px] num">₹{(item.price_cents * item.quantity) / 100}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-[var(--color-accent)]" />
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
                        <span
                          className={`text-[15px] ${
                            step.state === 'pending'
                              ? 'text-[var(--color-ink-4)]'
                              : 'text-[var(--color-ink)]'
                          }`}
                        >
                          {step.label}
                        </span>
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
            {actions.length > 0 && (
              <div className="space-y-3">
                {actions.map((a, i) => (
                  <button
                    key={i}
                    onClick={a.onClick}
                    className={`${a.kind === 'primary' ? 'btn btn-accent' : 'btn btn-outline'} w-full text-sm`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Details</span>
              <dl className="mt-4 space-y-3 text-[15px]">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Submitted</dt>
                  <dd className="num text-right">{formatDate(req.submitted_at) ?? '—'}</dd>
                </div>
                {req.scheduled_start && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-ink-3)] shrink-0">Scheduled</dt>
                    <dd className="num text-right">{formatDate(req.scheduled_start)}</dd>
                  </div>
                )}
                {req.scheduled_end && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-[var(--color-ink-3)] shrink-0">Until</dt>
                    <dd className="num text-right">{formatDate(req.scheduled_end)}</dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Facility</dt>
                  <dd className="text-right">{req.facility_code}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-[var(--color-ink-3)] shrink-0">Category</dt>
                  <dd className="text-right capitalize">{req.facility_category}</dd>
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
                {req.sponsor_email && (
                  <p className="mt-1 text-[13px] text-[var(--color-ink-3)] num">
                    {req.sponsor_email}
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Related</span>
              <Link
                to={`/facilities/${req.facility_id}`}
                className="mt-4 inline-flex items-center gap-2 text-[15px] hover:text-[var(--color-accent)] transition-colors"
              >
                View facility →
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