import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface StoreItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  unit: string;
  available: number;
}

interface CartLine {
  item: StoreItem;
  qty: number;
}

export default function Store() {
  const { user } = useAuth();

  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');

  const [cart, setCart] = useState<Record<number, number>>({});
  const [pickupSlot, setPickupSlot] = useState('16:00');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    request_id: number;
    total_cents: number;
    pickup_slot: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/store/items`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(d.items ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(
    () => (category === 'All' ? items : items.filter((i) => i.category === category)),
    [items, category],
  );

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = items.find((i) => i.id === Number(id));
          return item ? { item, qty } : null;
        })
        .filter((l): l is CartLine => l !== null && l.qty > 0),
    [cart, items],
  );

  const subtotalCents = cartLines.reduce((s, l) => s + l.item.price_cents * l.qty, 0);
  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);

  const rupees = (cents: number) => `₹${(cents / 100).toFixed(0)}`;

  const add = (item: StoreItem) => {
    const cur = cart[item.id] ?? 0;
    if (cur >= item.available) return;
    setCart((c) => ({ ...c, [item.id]: cur + 1 }));
  };

  const remove = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const submitReservation = async () => {
    if (!user || cartLines.length === 0 || submitting) return;
    setFormError(null);
    if (!confirmed) {
      setFormError('Confirm the reservation.');
      return;
    }

    setSubmitting(true);
    const today = new Date();
    const [h, m] = pickupSlot.split(':');
    today.setHours(Number(h), Number(m), 0, 0);
    const pickupAt = today.toISOString().replace('T', ' ').slice(0, 19);

    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'store',
          requester_id: user.id,
          facility_id: 45,
          title: `Store pickup — ${totalItems} item${totalItems > 1 ? 's' : ''}`,
          scheduled_start: pickupAt,
          scheduled_end: pickupAt,
          items: cartLines.map((l) => ({
            item_type: 'material',
            quantity: l.qty,
            unit: l.item.unit,
            notes: `${l.item.name} · ${rupees(l.item.price_cents * l.qty)}`,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? 'Reservation failed');
      }

      const data = await res.json();
      setSuccess({
        request_id: data.request_id,
        total_cents: subtotalCents,
        pickup_slot: pickupSlot,
      });
      setCart({});
      setConfirmed(false);
    } catch (err: any) {
      setFormError(err.message ?? 'Reservation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const resetReservation = () => {
    setSuccess(null);
    setCart({});
    setConfirmed(false);
  };

  // ════════ SUCCESS ════════
  if (success) {
    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="section-rule" />
            <span className="label label-accent">Reserved</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">
            Ready for pickup.
          </h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            Your items are held at the store counter. Pay on collection.
          </p>
        </section>

        <section className="pb-24">
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <span className="label">Reservation</span>
              <span className="label num">
                R-{String(success.request_id).padStart(4, '0')}
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[var(--color-rule)]">
              <div className="px-6 py-6">
                <span className="label">Pickup</span>
                <div className="mt-3 font-display text-3xl num leading-none">
                  {success.pickup_slot}
                </div>
              </div>
              <div className="px-6 py-6">
                <span className="label">Pay at counter</span>
                <div className="mt-3 font-display text-3xl num leading-none">
                  {rupees(success.total_cents)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={resetReservation} className="btn btn-outline text-sm">
              Reserve more
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

  // ════════ BROWSE ════════
  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="section-rule" />
            <h1 className="text-2xl md:text-3xl">Stores</h1>
          </div>
          <span className="label">
            {loading ? '···' : `${items.length} items in stock`}
          </span>
        </div>
      </section>

      {items.length > 0 && (
        <section className="pb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`tag cursor-pointer transition-colors ${
                  category === c ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      )}

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
                <span className="label">Loading…</span>
              </div>
            ) : items.length === 0 ? (
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
                <span className="label">No items available</span>
              </div>
            ) : (
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                {filtered.map((item) => {
                  const qty = cart[item.id] ?? 0;
                  const out = item.available === 0;
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-4 items-center px-6 py-5 ${
                        out ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="col-span-8 md:col-span-9">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-[16px]">{item.name}</h3>
                          <span className="label">{item.category}</span>
                          {out && <span className="label label-accent">Out</span>}
                        </div>
                        <p className="mt-1 text-[14px] text-[var(--color-ink-3)] leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--color-ink-3)]">
                          <span className="num">
                            {rupees(item.price_cents)} / {item.unit}
                          </span>
                          <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                          <span className="num">{item.available} in stock</span>
                        </div>
                      </div>

                      <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                        {qty === 0 ? (
                          <button
                            disabled={out}
                            onClick={() => add(item)}
                            className="btn btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
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
                              onClick={() => add(item)}
                              disabled={qty >= item.available}
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
            )}
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="border border-[var(--color-rule)] bg-[var(--color-card)] lg:sticky lg:top-6">
              <div className="px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
                <span className="label">Your reservation</span>
                <span className="label num">
                  {String(totalItems).padStart(2, '0')} items
                </span>
              </div>

              {cartLines.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-[14px] text-[var(--color-ink-3)]">
                    Add items to reserve them for pickup.
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

                  <div className="px-6 py-4 border-t border-[var(--color-rule)] text-[14px]">
                    <div className="flex items-center justify-between pt-1 text-[16px]">
                      <span>Subtotal</span>
                      <span className="num">{rupees(subtotalCents)}</span>
                    </div>
                    <p className="mt-2 text-[12px] text-[var(--color-ink-4)] leading-relaxed">
                      Pay at the counter on collection.
                    </p>
                  </div>

                  <div className="px-6 py-4 border-t border-[var(--color-rule)]">
                    <label className="label block mb-2">Pickup slot</label>
                    <input
                      type="time"
                      value={pickupSlot}
                      onChange={(e) => setPickupSlot(e.target.value)}
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
                          I will collect and pay at the counter.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="px-6 py-5 border-t border-[var(--color-rule)]">
                    <button
                      onClick={submitReservation}
                      disabled={submitting || !confirmed}
                      className="btn btn-accent w-full disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Reserving…' : 'Confirm reservation'}
                    </button>
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