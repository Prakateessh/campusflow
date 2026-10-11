import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  prep_time_minutes: number;
  category: string;
  available: number;
  image_url: string | null;
}

interface CartLine {
  item: MenuItem;
  qty: number;
}

interface QueueOrder {
  request_id: number;
  queue_position: number;
  pickup_at: string;
  paid_at: string | null;
  prep_started_at: string | null;
  prep_completed_at: string | null;
  title: string;
  status: string;
  requester_name: string;
  requester_email: string;
  items: Array<{ quantity: number; notes: string | null }>;
}

const CATEGORY_ORDER = ['All', 'breakfast', 'lunch', 'dinner', 'snacks', 'bakery', 'beverages', 'icecream'];

export default function Canteen() {
  const { user } = useAuth();

  // ── Role check: canteen staff see the queue, everyone else sees the menu
  const isCanteenStaff =
    user?.role === 'service_provider' && user?.department === 'Canteen';

  if (isCanteenStaff) return <CanteenQueue />;
  return <CanteenMenu />;
}

// ═══════════════════════════════════════════════════════════════
// CANTEEN STAFF — Order queue
// ═══════════════════════════════════════════════════════════════
function CanteenQueue() {
  const [queue, setQueue] = useState<QueueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState<number | null>(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/canteen/queue`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed to load queue');
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
    // Refresh every 15 seconds while on this page
    const timer = setInterval(reload, 15_000);
    return () => clearInterval(timer);
  }, []);

  const markReady = async (requestId: number) => {
    if (marking) return;
    setMarking(requestId);
    try {
      const res = await fetch(`${API_BASE}/api/canteen/order/${requestId}/ready`, {
        method: 'POST',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed to mark ready');
      }
      await reload();
    } catch (err: any) {
      setError(err.message ?? 'Failed to mark ready');
    } finally {
      setMarking(null);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    return iso.slice(11, 16);
  };

  const minutesAgo = (iso: string | null) => {
    if (!iso) return '';
    const past = new Date(iso.replace(' ', 'T')).getTime();
    const mins = Math.floor((Date.now() - past) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Order queue</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="label num">
              {loading ? '···' : `${String(queue.length).padStart(2, '0')} active`}
            </span>
            <button
              onClick={reload}
              className="label hover:text-[var(--color-accent)] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
          Prepare orders in queue order. Mark ready when the item is on the counter.
        </p>
      </section>

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
        ) : queue.length === 0 ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">Queue is clear</span>
            <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
              New orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
            {queue.map((o) => {
              const isReady = o.prep_completed_at !== null;
              const isPrepping = o.prep_started_at !== null && !isReady;
              return (
                <div
                  key={o.request_id}
                  className="grid grid-cols-12 gap-4 px-6 py-5 items-center"
                >
                  {/* Queue number */}
                  <div className="col-span-2 md:col-span-1">
                    <span className="font-display text-3xl num leading-none">
                      #{String(o.queue_position).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Order details */}
                  <div className="col-span-10 md:col-span-6">
                    <p className="text-[16px]">{o.title}</p>
                    <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                      {o.requester_name}
                    </p>
                    {o.items.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {o.items.map((it, i) => (
                          <li
                            key={i}
                            className="text-[13px] text-[var(--color-ink-2)]"
                          >
                            <span className="num text-[var(--color-ink-3)] mr-2">
                              {String(it.quantity).padStart(2, '0')}×
                            </span>
                            {it.notes}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="col-span-6 md:col-span-3">
                    <span className="label">Pickup</span>
                    <p className="mt-1 text-[15px] num">
                      {formatTime(o.pickup_at)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--color-ink-4)]">
                      Paid {minutesAgo(o.paid_at)}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="col-span-6 md:col-span-2 md:text-right">
                    {isReady ? (
                      <span className="label">Ready</span>
                    ) : (
                      <button
                        onClick={() => markReady(o.request_id)}
                        disabled={marking === o.request_id}
                        className="btn btn-accent text-sm disabled:opacity-50"
                      >
                        {marking === o.request_id
                          ? '···'
                          : isPrepping
                          ? 'Mark ready'
                          : 'Start now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════════════
// STUDENTS / FACULTY / ADMIN — Order menu
// ═══════════════════════════════════════════════════════════════
function CanteenMenu() {
  const { user } = useAuth();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<string>('All');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [pickupTime, setPickupTime] = useState('13:00');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    request_id: number;
    queue_position: number;
    total_cents: number;
    prep_start: string;
    pickup_at: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/canteen/menu`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMenu(d.menu ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (category === 'All' ? menu : menu.filter((m) => m.category === category)),
    [menu, category],
  );

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = menu.find((m) => m.id === Number(id));
          return item ? { item, qty } : null;
        })
        .filter((l): l is CartLine => l !== null && l.qty > 0),
    [cart, menu],
  );

  const subtotalCents = cartLines.reduce((s, l) => s + l.item.price_cents * l.qty, 0);
  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const prepMax = cartLines.reduce((m, l) => Math.max(m, l.item.prep_time_minutes), 0);
  const gstCents = Math.round(subtotalCents * 0.05);
  const totalCents = subtotalCents + gstCents;

  const rupees = (cents: number) => `₹${(cents / 100).toFixed(0)}`;

  const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const submitOrder = async () => {
    if (!user || cartLines.length === 0 || submitting) return;
    setFormError(null);
    setSubmitting(true);

    const today = new Date();
    const [h, m] = pickupTime.split(':');
    today.setHours(Number(h), Number(m), 0, 0);
    const pickupAt = today.toISOString().replace('T', ' ').slice(0, 19);

    try {
      const res = await fetch(`${API_BASE}/api/canteen/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          facility_id: 40,
          pickup_at: pickupAt,
          items: cartLines.map((l) => ({
            menu_item_id: l.item.id,
            name: l.item.name,
            price_cents: l.item.price_cents,
            prep_time_minutes: l.item.prep_time_minutes,
            quantity: l.qty,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Order failed: ${res.status}`);
      }

      const data = await res.json();
      setConfirmation(data);
      setCart({});
    } catch (err: any) {
      setFormError(err.message ?? 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const resetOrder = () => {
    setConfirmation(null);
    setCart({});
  };

  // ════════ CONFIRMATION ════════
  if (confirmation) {
    const pickupTimeStr = confirmation.pickup_at.slice(11, 16);
    const prepStartStr = confirmation.prep_start.slice(11, 16);
    const requestCode = `R-${String(confirmation.request_id).padStart(4, '0')}`;

    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-rule" />
            <span className="label label-accent">Order confirmed</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">Your order is queued.</h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            The kitchen has started preparing. You'll be notified when it's ready for pickup.
          </p>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-7">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
                  <span className="label">Queue ticket</span>
                  <span className="label num">
                    #{String(confirmation.queue_position).padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-[var(--color-rule)]">
                  <div className="px-6 py-6">
                    <span className="label">Pickup</span>
                    <div className="mt-3 font-display text-3xl num leading-none">
                      {pickupTimeStr}
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <span className="label">Prep starts</span>
                    <div className="mt-3 font-display text-3xl num leading-none">
                      {prepStartStr}
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <span className="label">Total</span>
                    <div className="mt-3 font-display text-3xl num leading-none">
                      {rupees(confirmation.total_cents)}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
                  <span className="label">Request</span>
                  <span className="label num">{requestCode}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={resetOrder} className="btn btn-outline text-sm">
                  Order again
                </button>
                <Link
                  to={`/requests/${confirmation.request_id}`}
                  className="btn-link text-sm"
                >
                  View in requests →
                </Link>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-5">
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Timeline</span>
                <ol className="mt-6 space-y-6">
                  {[
                    { t: 'Now', label: 'Payment confirmed', active: true },
                    { t: `${prepMax} min`, label: 'Kitchen begins', active: false },
                    { t: `~${prepMax + 5} min`, label: 'Ready for pickup', active: false },
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 ${
                          step.active ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-ink-4)]'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span
                            className={`text-[15px] ${
                              step.active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-3)]'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="label num">{step.t}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </section>
      </Layout>
    );
  }

  // ════════ MENU ════════
  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Canteen</h1>
          </div>
          <span className="label">
            {loading ? '···' : `Open · ${menu.length} items available`}
          </span>
        </div>
      </section>

      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`tag cursor-pointer transition-colors capitalize ${
                category === c ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-24">
        {formError && (
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 mb-6">
            <span className="text-[13px] text-[var(--color-accent)]">{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-8">
            {loading ? (
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
                <span className="label">Loading menu…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
                <span className="label">
                  {menu.length === 0 ? 'Menu not published yet' : 'No items in this category'}
                </span>
              </div>
            ) : (
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                {filtered.map((item) => {
                  const qty = cart[item.id] ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-center px-6 py-5"
                    >
                      <div className="col-span-8 md:col-span-9 flex items-center gap-4">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            loading="lazy"
                            className="h-20 w-20 object-cover shrink-0 border border-[var(--color-rule)]"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-[16px]">{item.name}</h3>
                            <span className="label capitalize">{item.category}</span>
                          </div>
                          <p className="mt-1 text-[14px] text-[var(--color-ink-3)] leading-relaxed">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--color-ink-3)]">
                            <span className="num">{rupees(item.price_cents)}</span>
                            <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                            <span className="num">{item.prep_time_minutes} min</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                        {qty === 0 ? (
                          <button
                            onClick={() => add(item.id)}
                            className="btn btn-ghost text-sm"
                          >
                            Add
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => remove(item.id)}
                              className="h-8 w-8 flex items-center justify-center border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink)] transition-colors"
                            >
                              −
                            </button>
                            <span className="num text-[15px] w-6 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => add(item.id)}
                              className="h-8 w-8 flex items-center justify-center border border-[var(--color-ink)] bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
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
            )}
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="border border-[var(--color-rule)] bg-[var(--color-card)] lg:sticky lg:top-6">
              <div className="px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
                <span className="label">Your order</span>
                <span className="label num">
                  {String(totalItems).padStart(2, '0')} items
                </span>
              </div>

              {cartLines.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-[14px] text-[var(--color-ink-3)]">
                    Add items from the menu to place an order.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-[var(--color-rule)]">
                    {cartLines.map((l) => (
                      <li
                        key={l.item.id}
                        className="flex items-start gap-3 px-6 py-4"
                      >
                        <span className="label num mt-0.5 shrink-0 w-8">
                          {String(l.qty).padStart(2, '0')}×
                        </span>
                        <span className="flex-1 text-[14px] leading-snug">
                          {l.item.name}
                        </span>
                        <span className="text-[14px] num">
                          {rupees(l.item.price_cents * l.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="px-6 py-4 border-t border-[var(--color-rule)] space-y-2 text-[14px]">
                    <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                      <span>Subtotal</span>
                      <span className="num">{rupees(subtotalCents)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                      <span>GST (5%)</span>
                      <span className="num">{rupees(gstCents)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--color-rule)] text-[16px]">
                      <span>Total</span>
                      <span className="num">{rupees(totalCents)}</span>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-[var(--color-rule)] space-y-4">
                    <div>
                      <label className="label block mb-2">Pickup time</label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="input num"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[13px] text-[var(--color-ink-3)]">
                      <span>Prep time</span>
                      <span className="num">~{prepMax} min</span>
                    </div>
                  </div>

                  <div className="px-6 py-5 border-t border-[var(--color-rule)]">
                    <button
                      onClick={submitOrder}
                      disabled={submitting}
                      className="btn btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting
                        ? 'Placing order…'
                        : `Pay ${rupees(totalCents)} · UPI`}
                    </button>
                    <p className="mt-3 text-[12px] text-[var(--color-ink-4)] text-center leading-relaxed">
                      Kitchen starts preparing only after payment.
                    </p>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}