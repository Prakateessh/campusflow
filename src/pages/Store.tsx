import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface StoreItem {
  id: number;
  name: string;
  category: 'Stationery' | 'Daily' | 'Food' | 'Instruments';
  price: number;
  unit: string;
  available: number;
  description: string;
}

const ITEMS: StoreItem[] = [];
type CategoryFilter = 'All' | StoreItem['category'];
const CATEGORIES: CategoryFilter[] = ['All', 'Stationery', 'Instruments', 'Daily', 'Food'];

interface CartLine {
  item: StoreItem;
  qty: number;
}

export default function Store() {
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [pickupSlot, setPickupSlot] = useState('16:00');
  const [stage, setStage] = useState<'browse' | 'reserved'>('browse');

  const filtered = useMemo(
    () => (category === 'All' ? ITEMS : ITEMS.filter((i) => i.category === category)),
    [category],
  );

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({
          item: ITEMS.find((i) => i.id === Number(id))!,
          qty,
        }))
        .filter((l) => l.qty > 0),
    [cart],
  );

  const subtotal = cartLines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);

  const add = (id: number) =>
    setCart((c) => {
      const item = ITEMS.find((i) => i.id === id)!;
      const cur = c[id] ?? 0;
      if (cur >= item.available) return c;
      return { ...c, [id]: cur + 1 };
    });

  const remove = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const submitReservation = () => setStage('reserved');

  const resetReservation = () => {
    setCart({});
    setStage('browse');
  };

  // ═══════════════════════════════════════════════════════════════
  // RESERVED STATE
  // ═══════════════════════════════════════════════════════════════
  if (stage === 'reserved') {
    const [h, m] = pickupSlot.split(':').map(Number);
    const cutoff = new Date();
    cutoff.setHours(h - 1, m);
    const cutoffStr = `${String(cutoff.getHours()).padStart(2, '0')}:${String(cutoff.getMinutes()).padStart(2, '0')}`;

    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <span className="label label-accent">Reservation confirmed</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">Ready for pickup.</h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            Your items are held at the store counter. Pay on collection —
            cancel by {cutoffStr} if plans change.
          </p>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-12 gap-10">

            <div className="col-span-12 lg:col-span-7">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
                  <span className="label">Reservation</span>
                  <span className="label num">ST-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[var(--color-rule)]">
                  <div className="px-6 py-6">
                    <span className="label">Pickup</span>
                    <div className="mt-3 font-display text-3xl num leading-none">{pickupSlot}</div>
                  </div>
                  <div className="px-6 py-6">
                    <span className="label">Pay at counter</span>
                    <div className="mt-3 font-display text-3xl num leading-none">₹{subtotal}</div>
                  </div>
                </div>

                <div className="px-6 py-6 border-t border-[var(--color-rule)]">
                  <span className="label">Items</span>
                  <ul className="mt-4 divide-y divide-[var(--color-rule)]">
                    {cartLines.map((l) => (
                      <li key={l.item.id} className="flex items-center justify-between py-3">
                        <span className="text-[15px]">
                          <span className="num text-[var(--color-ink-3)] mr-3">
                            {String(l.qty).padStart(2, '0')}×
                          </span>
                          {l.item.name}
                        </span>
                        <span className="text-[15px] num">₹{l.item.price * l.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-6 py-4 border-t border-[var(--color-rule)] bg-[var(--color-surface-low)] flex items-center justify-between">
                  <span className="label">Total at counter</span>
                  <span className="label num">₹{subtotal}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={resetReservation} className="btn btn-outline text-sm">
                  Reserve more
                </button>
                <Link to="/requests" className="btn-link text-sm">
                  View in requests →
                </Link>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-5">
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Pickup location</span>
                <p className="mt-3 text-[15px] text-[var(--color-ink-2)] leading-relaxed">
                  General & Co-operative Stores<br />
                  Main Campus · Open 08:00 – 21:00
                </p>
              </div>

              <div className="border-t border-[var(--color-rule)] pt-6 mt-8">
                <span className="label">Notes</span>
                <ul className="mt-3 space-y-2 text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  <li>· Pay by cash or UPI at the counter</li>
                  <li>· Bring student ID for record</li>
                  <li>· Uncollected items are released after 2 hours</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </Layout>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BROWSE STATE
  // ═══════════════════════════════════════════════════════════════
  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Stores</h1>
          </div>
          <span className="label">
            {ITEMS.filter((i) => i.available > 0).length} of {ITEMS.length} in stock
          </span>
        </div>
      </section>

      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
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

      <section className="pb-24">
        <div className="grid grid-cols-12 gap-10">

          <div className="col-span-12 lg:col-span-8">
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
                        {out && <span className="label label-accent">Out of stock</span>}
                      </div>
                      <p className="mt-1 text-[14px] text-[var(--color-ink-3)] leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--color-ink-3)]">
                        <span className="num">₹{item.price} / {item.unit}</span>
                        <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                        <span className="num">{item.available} in stock</span>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                      {qty === 0 ? (
                        <button
                          disabled={out}
                          onClick={() => add(item.id)}
                          className="btn btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => remove(item.id)}
                            className="h-8 w-8 flex items-center justify-center border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink)] transition-colors"
                            aria-label="Remove"
                          >
                            −
                          </button>
                          <span className="num text-[15px] w-6 text-center">{qty}</span>
                          <button
                            onClick={() => add(item.id)}
                            disabled={qty >= item.available}
                            className="h-8 w-8 flex items-center justify-center border border-[var(--color-ink)] bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Add"
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
                      <li key={l.item.id} className="flex items-start gap-3 px-6 py-4">
                        <span className="label num mt-0.5 shrink-0 w-8">
                          {String(l.qty).padStart(2, '0')}×
                        </span>
                        <span className="flex-1 text-[14px] leading-snug">{l.item.name}</span>
                        <span className="text-[14px] num">₹{l.item.price * l.qty}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="px-6 py-4 border-t border-[var(--color-rule)] space-y-2 text-[14px]">
                    <div className="flex items-center justify-between pt-1 text-[16px]">
                      <span>Subtotal</span>
                      <span className="num">₹{subtotal}</span>
                    </div>
                    <p className="text-[12px] text-[var(--color-ink-4)] leading-relaxed">
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

                  <div className="px-6 py-5 border-t border-[var(--color-rule)]">
                    <button
                      onClick={submitReservation}
                      className="btn btn-accent w-full"
                    >
                      Confirm reservation
                    </button>
                    <p className="mt-3 text-[12px] text-[var(--color-ink-4)] text-center leading-relaxed">
                      Free to reserve. Pay only when you collect.
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