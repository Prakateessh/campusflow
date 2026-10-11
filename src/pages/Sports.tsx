import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Facility {
  id: number;
  code: string;
  name: string;
  kind: string;
  description: string;
  location: string;
  open_hours: string | null;
}

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  kind: string;
  quantity_total: number;
  quantity_available: number;
  unit: string;
  requires_return: number;
  return_days: number | null;
  notes: string | null;
}

interface CartLine {
  item: InventoryItem;
  qty: number;
}

export default function Sports() {
  const { user } = useAuth();

  const [bookable, setBookable] = useState<Facility[]>([]);
  const [borrowable, setBorrowable] = useState<Facility | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<number, number>>({});
  const [returnBy, setReturnBy] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const [activeBooking, setActiveBooking] = useState<Facility | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    kind: 'book' | 'borrow';
    request_id: number;
    title: string;
    meta?: string;
  } | null>(null);

  // Fetch sports facilities + inventory
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/facilities?kind=sports`)
      .then((r) => r.json())
      .then(async (data) => {
        if (cancelled) return;
        const sports: Facility[] = data.facilities ?? [];
        const pool = sports.filter((f) => f.code === 'G-05');
        const materials = sports.find((f) => f.code === 'G-07') ?? null;

        setBookable(pool);
        setBorrowable(materials);

        if (materials) {
          const inv = await fetch(
            `${API_BASE}/api/inventory?facility_id=${materials.id}`,
          ).then((r) => r.json());
          if (!cancelled) setInventory(inv.items ?? []);
        }
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

  const cartLines: CartLine[] = Object.entries(cart)
    .map(([id, qty]) => {
      const item = inventory.find((i) => i.id === Number(id));
      return item ? { item, qty } : null;
    })
    .filter((l): l is CartLine => l !== null && l.qty > 0);

  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const longestReturnDays = cartLines.reduce(
    (m, l) => Math.max(m, l.item.return_days ?? 0),
    0,
  );

  const addToCart = (item: InventoryItem) => {
    const cur = cart[item.id] ?? 0;
    if (cur >= item.quantity_available) return;
    setCart((c) => ({ ...c, [item.id]: cur + 1 }));
  };

  const removeFromCart = (item: InventoryItem) => {
    const next = { ...cart };
    if (!next[item.id]) return;
    next[item.id] -= 1;
    if (next[item.id] <= 0) delete next[item.id];
    setCart(next);
  };

  const openBooking = (facility: Facility) => {
    setActiveBooking(facility);
    setBookingDate(new Date().toISOString().slice(0, 10));
    setBookingTime('06:00');
    setBookingConfirmed(false);
    setFormError(null);
  };

  const closeBooking = () => {
    setActiveBooking(null);
    setFormError(null);
    setBookingConfirmed(false);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeBooking) return;
    setFormError(null);

    if (!bookingDate) return setFormError('Select a date.');
    if (!bookingTime) return setFormError('Select a start time.');
    if (!bookingConfirmed) return setFormError('Confirm the booking.');

    setSubmitting(true);
    try {
      const [h, m] = bookingTime.split(':').map(Number);
      const endH = (h + 1) % 24;
      const start = `${bookingDate} ${bookingTime}:00`;
      const end = `${bookingDate} ${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'sports',
          requester_id: user.id,
          facility_id: activeBooking.id,
          title: `${activeBooking.name} — 1 hour session`,
          scheduled_start: start,
          scheduled_end: end,
          items: [],
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Booking failed');
      }

      const data = await res.json();
      setSuccess({
        kind: 'book',
        request_id: data.request_id,
        title: activeBooking.name,
        meta: `${bookingDate} · ${bookingTime}`,
      });
      closeBooking();
    } catch (err: any) {
      setFormError(err.message ?? 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const submitBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !borrowable) return;
    setFormError(null);

    if (cartLines.length === 0) return setFormError('Add at least one item.');
    if (!returnBy) return setFormError('Select a return date.');
    if (!confirmed) return setFormError('Confirm the request.');

    setSubmitting(true);
    try {
      const title = `Sports gear — ${totalItems} item${totalItems > 1 ? 's' : ''}`;

      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'sports',
          requester_id: user.id,
          facility_id: borrowable.id,
          title,
          return_by: returnBy,
          items: cartLines.map((l) => ({
            item_type: 'sports_equipment',
            inventory_id: l.item.id,
            quantity: l.qty,
            unit: l.item.unit,
            notes: l.item.name,
          })),
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Request failed');
      }

      const data = await res.json();
      setSuccess({
        kind: 'borrow',
        request_id: data.request_id,
        title,
        meta: `Return by ${returnBy}`,
      });
      setCart({});
      setReturnBy('');
      setConfirmed(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ════════ SUCCESS ════════
  if (success) {
    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-rule" />
            <span className="label label-accent">
              {success.kind === 'book' ? 'Booked' : 'Requested'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">{success.title}</h1>
          {success.meta && (
            <p className="mt-4 text-[15px] text-[var(--color-ink-2)]">{success.meta}</p>
          )}
        </section>

        <section className="pb-24">
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <span className="label">Reference</span>
              <span className="label num">
                R-{String(success.request_id).padStart(4, '0')}
              </span>
            </div>
            <div className="px-6 py-6 space-y-2 text-[14px] text-[var(--color-ink-2)] leading-relaxed">
              {success.kind === 'book' ? (
                <>
                  <p>· Arrive 5 minutes early</p>
                  <p>· Carry your student ID</p>
                  <p>· Free cancellation up to 2 hours before</p>
                </>
              ) : (
                <>
                  <p>· Collect from the Sports Complex counter</p>
                  <p>· Bring your student ID</p>
                  <p>· Return by the date stated to avoid penalty</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => setSuccess(null)} className="btn btn-outline text-sm">
              Back to sports
            </button>
            <Link
              to={`/requests/${success.request_id}`}
              className="btn-link text-sm"
            >
              View in requests →
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  // ════════ MAIN ════════
  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Sports</h1>
          </div>
        </div>
      </section>

      {error && (
        <section className="pb-6">
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        </section>
      )}

      {loading ? (
        <section className="pb-24">
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">Loading…</span>
          </div>
        </section>
      ) : (
        <>
          {/* ── BOOKABLE FACILITIES ── */}
          {bookable.length > 0 && (
            <section className="pb-16">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="label label-accent">Book a slot</span>
                  <h2 className="mt-2 text-xl md:text-2xl">Facilities</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[var(--color-rule)]">
                {bookable.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => openBooking(f)}
                    className="group bg-[var(--color-card)] border-r border-b border-[var(--color-rule)] p-8 text-left transition-colors hover:bg-[var(--color-surface-low)] min-h-[220px] flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <span className="label label-accent num">{f.code}</span>
                      <span className="text-[var(--color-ink-4)] group-hover:text-[var(--color-accent)] transition-colors">
                        →
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl group-hover:text-[var(--color-accent)] transition-colors">
                        {f.name}
                      </h3>
                      <p className="mt-3 text-[14px] text-[var(--color-ink-3)] leading-relaxed line-clamp-2">
                        {f.description}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--color-ink-4)]">
                        {f.location && <span>{f.location}</span>}
                        {f.open_hours && (
                          <>
                            <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                            <span className="num">{f.open_hours}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* ── BORROWABLE EQUIPMENT ── */}
          {/* Only renders when inventory has real items from the DB. */}
          {borrowable && inventory.length > 0 && (
            <section className="pb-24">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="label label-accent">Borrow gear</span>
                  <h2 className="mt-2 text-xl md:text-2xl">{borrowable.name}</h2>
                </div>
                <span className="label num">
                  {inventory.length} items
                </span>
              </div>

              <div className="grid grid-cols-12 gap-10">
                {/* Inventory list */}
                <div className="col-span-12 lg:col-span-8">
                  <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                    {inventory.map((item) => {
                      const qty = cart[item.id] ?? 0;
                      return (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-4 items-center px-6 py-4"
                        >
                          <div className="col-span-8 md:col-span-9">
                            <h3 className="text-[15px]">{item.name}</h3>
                            {item.notes && (
                              <p className="mt-0.5 text-[12px] text-[var(--color-ink-4)]">
                                {item.notes}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-3 text-[12px] text-[var(--color-ink-3)]">
                              <span className="num">
                                {item.quantity_available} available
                              </span>
                              {item.requires_return === 1 && item.return_days && (
                                <>
                                  <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                                  <span>
                                    Return in {item.return_days} day
                                    {item.return_days > 1 ? 's' : ''}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                            {qty === 0 ? (
                              <button
                                onClick={() => addToCart(item)}
                                disabled={item.quantity_available === 0}
                                className="btn btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Add
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => removeFromCart(item)}
                                  className="h-8 w-8 flex items-center justify-center border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink)] transition-colors"
                                >
                                  −
                                </button>
                                <span className="num text-[15px] w-6 text-center">
                                  {qty}
                                </span>
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={qty >= item.quantity_available}
                                  className="h-8 w-8 flex items-center justify-center border border-[var(--color-ink)] bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-30"
                                >
                                  +
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cart */}
                <aside className="col-span-12 lg:col-span-4">
                  <div className="border border-[var(--color-rule)] bg-[var(--color-card)] lg:sticky lg:top-6">
                    <div className="px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
                      <span className="label">Your cart</span>
                      <span className="label num">
                        {String(totalItems).padStart(2, '0')} items
                      </span>
                    </div>

                    {cartLines.length === 0 ? (
                      <div className="px-6 py-12 text-center">
                        <p className="text-[13px] text-[var(--color-ink-3)]">
                          Add items to request a loan.
                        </p>
                      </div>
                    ) : (
                      <>
                        <ul className="divide-y divide-[var(--color-rule)]">
                          {cartLines.map((l) => (
                            <li
                              key={l.item.id}
                              className="flex items-start gap-3 px-6 py-3"
                            >
                              <span className="label num mt-0.5 shrink-0 w-8">
                                {String(l.qty).padStart(2, '0')}×
                              </span>
                              <span className="flex-1 text-[13px] leading-snug">
                                {l.item.name}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="px-6 py-4 border-t border-[var(--color-rule)] text-[13px]">
                          <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                            <span>Return window</span>
                            <span className="num">
                              {longestReturnDays || 1} day
                              {longestReturnDays > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="px-6 py-4 border-t border-[var(--color-rule)]">
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

                        <div className="px-6 py-4 border-t border-[var(--color-rule)]">
                          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-3">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-0.5 accent-[var(--color-accent)]"
                              />
                              <span className="text-[12px] leading-relaxed">
                                I will return all items by the stated date.
                              </span>
                            </label>
                          </div>
                        </div>

                        {formError && (
                          <div className="px-6 pb-4">
                            <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2">
                              <span className="text-[12px] text-[var(--color-accent)]">
                                {formError}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="px-6 py-5 border-t border-[var(--color-rule)]">
                          <button
                            onClick={submitBorrow}
                            disabled={submitting || !confirmed}
                            className="btn btn-accent w-full text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {submitting ? 'Submitting…' : 'Request loan'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </aside>
              </div>
            </section>
          )}

          {/* ── EMPTY STATE — only when there is truly nothing ── */}
          {bookable.length === 0 && (!borrowable || inventory.length === 0) && (
            <section className="pb-24">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
                <span className="label">No sports facilities available</span>
              </div>
            </section>
          )}
        </>
      )}

      {/* ════════ BOOKING MODAL ════════ */}
      {activeBooking && (
        <div
          className="fixed inset-0 z-50 bg-[var(--color-ink)]/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeBooking}
        >
          <div
            className="bg-[var(--color-card)] border border-[var(--color-rule)] w-full max-w-lg my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <div className="flex items-center gap-3">
                <span className="label label-accent num">{activeBooking.code}</span>
                <span className="label">Book session</span>
              </div>
              <button
                onClick={closeBooking}
                className="label hover:text-[var(--color-ink)] transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitBooking} className="px-6 py-6 space-y-6">
              <h2 className="text-2xl leading-tight">{activeBooking.name}</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label block mb-2">
                    Date <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="input num"
                  />
                </div>
                <div>
                  <label className="label block mb-2">
                    Start time <span className="text-[var(--color-accent)]">*</span>
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="input num"
                  />
                </div>
              </div>

              <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingConfirmed}
                    onChange={(e) => setBookingConfirmed(e.target.checked)}
                    className="mt-0.5 accent-[var(--color-accent)]"
                  />
                  <span className="text-[13px] leading-relaxed">
                    I confirm this slot and will carry my student ID.
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
                  onClick={closeBooking}
                  className="btn btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !bookingConfirmed}
                  className="btn btn-accent text-sm flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Booking…' : 'Confirm booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}