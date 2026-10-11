import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const SPORTS_FACILITY_ID = 42; // G-07 Sports Materials

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

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<number, number>>({});
  const [returnBy, setReturnBy] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [success, setSuccess] = useState<{
    request_id: number;
    totalItems: number;
    returnBy: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/inventory?facility_id=${SPORTS_FACILITY_ID}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setInventory(data.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load gear');
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

  const submitBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
          facility_id: SPORTS_FACILITY_ID,
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

      // Refresh inventory to reflect new stock
      const refreshed = await fetch(
        `${API_BASE}/api/inventory?facility_id=${SPORTS_FACILITY_ID}`,
      ).then((r) => r.json());
      setInventory(refreshed.items ?? []);

      setSuccess({
        request_id: data.request_id,
        totalItems,
        returnBy,
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
            <span className="label label-accent">Requested</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">Gear requested.</h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            Collect from the Sports Complex counter. Bring your student ID.
          </p>
        </section>

        <section className="pb-24">
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
              <span className="label">Reference</span>
              <span className="label num">
                R-{String(success.request_id).padStart(4, '0')}
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[var(--color-rule)]">
              <div className="px-6 py-6">
                <span className="label">Items</span>
                <div className="mt-3 font-display text-3xl num leading-none">
                  {String(success.totalItems).padStart(2, '0')}
                </div>
              </div>
              <div className="px-6 py-6">
                <span className="label">Return by</span>
                <div className="mt-3 font-display text-2xl num leading-none">
                  {success.returnBy}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => setSuccess(null)} className="btn btn-outline text-sm">
              Borrow more
            </button>
            <Link to={`/requests/${success.request_id}`} className="btn-link text-sm">
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
            <h1 className="text-2xl md:text-3xl">Sports</h1>
          </div>
          <span className="label num">
            {loading ? '···' : `${inventory.length} items`}
          </span>
        </div>
        <p className="mt-3 text-[13px] text-[var(--color-ink-3)]">
          Borrow sports equipment from the Sports Complex counter.
        </p>
      </section>

      {error && (
        <section className="pb-6">
          <div className="border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3">
            <span className="text-[13px] text-[var(--color-accent)]">{error}</span>
          </div>
        </section>
      )}

      <section className="pb-24">
        {loading ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">Loading…</span>
          </div>
        ) : inventory.length === 0 ? (
          <div className="border border-[var(--color-rule)] bg-[var(--color-card)] py-24 text-center">
            <span className="label">No equipment available</span>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-12 lg:col-span-8">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
                {inventory.map((item) => {
                  const qty = cart[item.id] ?? 0;
                  const out = item.quantity_available === 0;
                  return (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-4 items-center px-6 py-4 ${
                        out ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="col-span-8 md:col-span-9">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-[15px]">{item.name}</h3>
                          {out && <span className="label label-accent">Out</span>}
                        </div>
                        {item.notes && (
                          <p className="mt-1 text-[13px] text-[var(--color-ink-3)] leading-relaxed">
                            {item.notes}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-[12px] text-[var(--color-ink-4)]">
                          <span className="num">
                            {item.quantity_available} available
                          </span>
                          <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                          <span className="uppercase tracking-wider">{item.unit}</span>
                        </div>
                      </div>

                      <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={out}
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

            <aside className="col-span-12 lg:col-span-4">
              <form
                onSubmit={submitBorrow}
                className="border border-[var(--color-rule)] bg-[var(--color-card)] lg:sticky lg:top-6"
              >
                <div className="px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
                  <span className="label">Your request</span>
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
                          <span className="label">{l.item.unit}</span>
                        </li>
                      ))}
                    </ul>

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
                        type="submit"
                        disabled={submitting || !confirmed}
                        className="btn btn-accent w-full text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting…' : 'Request loan'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </aside>
          </div>
        )}
      </section>
    </Layout>
  );
}