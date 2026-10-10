import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth, getUsers, type DirectoryUser } from '../lib/auth';
import { getFacility, type Facility } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Electronics',
  computing_ai: 'Computing & AI',
  energy: 'Energy',
  chemical: 'Chemical',
  innovation: 'Innovation',
  mechanical: 'Mechanical',
  general: 'General',
};

interface FormItem {
  name: string;
  quantity: number;
  unit: string;
}

export default function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [faculty, setFaculty] = useState<DirectoryUser[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [sponsorId, setSponsorId] = useState<number | ''>('');
  const [isLoan, setIsLoan] = useState(false);
  const [returnBy, setReturnBy] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [items, setItems] = useState<FormItem[]>([]);
  const [draftItemName, setDraftItemName] = useState('');
  const [draftItemQty, setDraftItemQty] = useState('1');
  const [draftItemUnit, setDraftItemUnit] = useState('piece');
  const [confirmed, setConfirmed] = useState(false);

  // Fetch facility
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getFacility(Number(id))
      .then((data) => {
        if (cancelled) return;
        if (!data) setError('not_found');
        else setFacility(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load lab');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load faculty list when form opens
  useEffect(() => {
    if (!showForm || faculty.length > 0) return;
    getUsers('faculty')
      .then(setFaculty)
      .catch(() => {});
  }, [showForm, faculty.length]);

  const resetForm = () => {
    setPurpose('');
    setDescription('');
    setSponsorId('');
    setIsLoan(false);
    setReturnBy('');
    setScheduledStart('');
    setScheduledEnd('');
    setItems([]);
    setDraftItemName('');
    setDraftItemQty('1');
    setDraftItemUnit('piece');
    setConfirmed(false);
    setFormError(null);
  };

  const addItem = () => {
    const name = draftItemName.trim();
    const qty = Number(draftItemQty);
    if (!name || !qty || qty < 1) return;
    setItems((prev) => [...prev, { name, quantity: qty, unit: draftItemUnit }]);
    setDraftItemName('');
    setDraftItemQty('1');
    setDraftItemUnit('piece');
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !facility) return;
    setFormError(null);

    // Validation — option D, everything enforced
    if (!purpose.trim() || purpose.trim().length < 15) {
      setFormError('Purpose is required and must be at least 15 characters — explain what you need this for.');
      return;
    }
    if (!sponsorId) {
      setFormError('Select a faculty sponsor.');
      return;
    }
    if (items.length === 0) {
      setFormError('List at least one item, component, or service you need.');
      return;
    }
    if (isLoan && !returnBy) {
      setFormError('Return by date is required for borrowed items.');
      return;
    }
    if (!confirmed) {
      setFormError('You must confirm that this request is accurate.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'lab',
          requester_id: user.id,
          sponsor_id: sponsorId,
          facility_id: facility.id,
          title: `Access — ${facility.name}`,
          description: description.trim() || null,
          purpose: purpose.trim(),
          return_by: isLoan ? returnBy : null,
          scheduled_start: scheduledStart || null,
          scheduled_end: scheduledEnd || null,
          items: items.map((item) => ({
            item_type: isLoan ? 'inventory' : 'service',
            quantity: item.quantity,
            unit: item.unit,
            notes: item.name,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Request failed');
      }

      const data = await res.json();
      navigate(`/requests/${data.request_id}`);
    } catch (err: any) {
      setFormError(err.message ?? 'Request failed');
    } finally {
      setSubmitting(false);
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

  if (error === 'not_found' || !facility) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <span className="label label-accent">404</span>
          <h1 className="mt-4 text-3xl">Lab not found</h1>
          <Link to="/facilities" className="btn-link text-sm inline-block mt-6">
            ← Back to labs
          </Link>
        </div>
      </Layout>
    );
  }

  const categoryLabel = CATEGORY_LABELS[facility.category] ?? facility.category;

  return (
    <Layout>
      <section className="pt-10 pb-6">
        <Link to="/facilities" className="label hover:text-[var(--color-ink)] transition">
          ← All labs
        </Link>
      </section>

      <section className="pb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="label label-accent num">{facility.code}</span>
          <span className="w-6 h-px bg-[var(--color-rule)]" />
          <span className="label">{categoryLabel}</span>
        </div>
        <h1 className="text-3xl md:text-4xl leading-tight max-w-3xl">
          {facility.name}
        </h1>
      </section>

      <section className="pb-24">
        <div className="grid grid-cols-12 gap-10">

          <div className="col-span-12 lg:col-span-8 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="section-rule" />
                <h2 className="text-lg">About</h2>
              </div>
              <p className="text-[16px] text-[var(--color-ink-2)] leading-relaxed">
                {facility.description}
              </p>
            </div>

            {facility.equipment.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="section-rule" />
                    <h2 className="text-lg">Equipment</h2>
                  </div>
                  <span className="label num">
                    {String(facility.equipment.length).padStart(2, '0')} items
                  </span>
                </div>

                <ul className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                  {facility.equipment.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 px-5 py-3">
                      <span className="label num shrink-0 mt-0.5 w-8">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[15px] text-[var(--color-ink-2)] leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="col-span-12 lg:col-span-4 space-y-8">
            <div className="space-y-3">
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-accent w-full text-sm"
              >
                Request access
              </button>
              <p className="text-[12px] text-[var(--color-ink-4)] text-center leading-relaxed">
                Requires a faculty sponsor, a stated purpose, and a list of items.
              </p>
            </div>

            {facility.contact && (
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Contact</span>
                <p className="mt-3 text-[15px] text-[var(--color-ink-2)] leading-relaxed">
                  {facility.contact}
                </p>
              </div>
            )}

            <div className="border-t border-[var(--color-rule)] pt-6">
              <span className="label">Details</span>
              <dl className="mt-3 space-y-3 text-[15px]">
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-ink-3)]">Code</dt>
                  <dd className="num">{facility.code}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-ink-3)]">Category</dt>
                  <dd>{categoryLabel}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-ink-3)]">Equipment</dt>
                  <dd className="num">{facility.equipment.length}</dd>
                </div>
                {facility.location && (
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--color-ink-3)]">Location</dt>
                    <dd className="text-right">{facility.location}</dd>
                  </div>
                )}
                {facility.open_hours && (
                  <div className="flex items-center justify-between">
                    <dt className="text-[var(--color-ink-3)]">Hours</dt>
                    <dd className="num">{facility.open_hours}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {/* ════════ REQUEST FORM MODAL ════════ */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-[var(--color-ink)]/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div
            className="bg-[var(--color-card)] border border-[var(--color-rule)] w-full max-w-2xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <div className="flex items-center gap-3">
                <span className="label label-accent num">{facility.code}</span>
                <span className="label">New request</span>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="label hover:text-[var(--color-ink)] transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitRequest} className="px-6 py-6 space-y-6">

              {/* Purpose — required, min length */}
              <div>
                <label className="label block mb-2">
                  Purpose <span className="text-[var(--color-accent)]">*</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  placeholder="What is this for? Minimum 15 characters. Sponsors and technicians review this."
                  className="input resize-none"
                />
                <p className="mt-1 text-[11px] text-[var(--color-ink-4)] num">
                  {purpose.trim().length} / 15 min
                </p>
              </div>

              {/* Description — optional */}
              <div>
                <label className="label block mb-2">Additional notes (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Any specific slot time, workspace, or context…"
                  className="input resize-none"
                />
              </div>

              {/* Sponsor — required */}
              <div>
                <label className="label block mb-2">
                  Faculty sponsor <span className="text-[var(--color-accent)]">*</span>
                </label>
                <select
                  value={sponsorId}
                  onChange={(e) => setSponsorId(e.target.value ? Number(e.target.value) : '')}
                  className="input cursor-pointer"
                >
                  <option value="">Select a faculty member</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} · {f.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-2">Start (optional)</label>
                  <input
                    type="datetime-local"
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="input num"
                  />
                </div>
                <div>
                  <label className="label block mb-2">End (optional)</label>
                  <input
                    type="datetime-local"
                    value={scheduledEnd}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="input num"
                  />
                </div>
              </div>

              {/* Items — required, at least one */}
              <div>
                <label className="label block mb-2">
                  Items / components needed <span className="text-[var(--color-accent)]">*</span>
                </label>

                {items.length > 0 && (
                  <ul className="border border-[var(--color-rule)] divide-y divide-[var(--color-rule)] mb-3">
                    {items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        <span className="label num shrink-0 w-8">
                          {String(item.quantity).padStart(2, '0')}×
                        </span>
                        <span className="flex-1 text-[14px]">{item.name}</span>
                        <span className="label">{item.unit}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="label hover:text-[var(--color-accent)] transition-colors"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={draftItemName}
                    onChange={(e) => setDraftItemName(e.target.value)}
                    placeholder="e.g. Raspberry Pi 4, Oscilloscope, Bench slot"
                    className="input col-span-12 md:col-span-6"
                  />
                  <input
                    type="number"
                    min={1}
                    value={draftItemQty}
                    onChange={(e) => setDraftItemQty(e.target.value)}
                    className="input col-span-3 md:col-span-2 num"
                  />
                  <select
                    value={draftItemUnit}
                    onChange={(e) => setDraftItemUnit(e.target.value)}
                    className="input col-span-4 md:col-span-2 cursor-pointer"
                  >
                    <option value="piece">piece</option>
                    <option value="set">set</option>
                    <option value="slot">slot</option>
                    <option value="hour">hour</option>
                    <option value="gram">gram</option>
                    <option value="metre">metre</option>
                  </select>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-ghost text-sm col-span-5 md:col-span-2"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Loan toggle */}
              <div className="border border-[var(--color-rule)] p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLoan}
                    onChange={(e) => setIsLoan(e.target.checked)}
                    className="mt-1 accent-[var(--color-accent)]"
                  />
                  <div>
                    <span className="text-[14px]">
                      This request borrows equipment or a component
                    </span>
                    <p className="mt-1 text-[12px] text-[var(--color-ink-4)]">
                      A return deadline is required.
                    </p>
                  </div>
                </label>

                {isLoan && (
                  <div className="mt-4">
                    <label className="label block mb-2">
                      Return by <span className="text-[var(--color-accent)]">*</span>
                    </label>
                    <input
                      type="date"
                      value={returnBy}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setReturnBy(e.target.value)}
                      className="input num"
                    />
                  </div>
                )}
              </div>

              {/* Confirm checkbox */}
              <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[var(--color-accent)]"
                  />
                  <span className="text-[13px] leading-relaxed">
                    I confirm that this request is accurate and that I will
                    return any borrowed equipment by the stated deadline.
                  </span>
                </label>
              </div>

              {formError && (
                <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
                  <span className="text-[13px] text-[var(--color-accent)]">{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !confirmed}
                  className="btn btn-accent text-sm flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}