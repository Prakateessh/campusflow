import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  prep: number;
  category: 'Breakfast' | 'Meal' | 'Snack' | 'Beverage';
  available: boolean;
}

const MENU: MenuItem[] = [
  { id: 1,  name: 'Masala Dosa',              desc: 'Crispy dosa with potato masala',               price: 60,  prep: 10, category: 'Breakfast', available: true },
  { id: 2,  name: 'Idli (2 pcs)',             desc: 'Steamed rice cakes with sambar and chutney',   price: 30,  prep: 5,  category: 'Breakfast', available: true },
  { id: 3,  name: 'Poori Masala',             desc: 'Fried bread with potato curry',                price: 50,  prep: 8,  category: 'Breakfast', available: true },
  { id: 4,  name: 'Pongal',                   desc: 'Rice and lentil porridge with ghee',           price: 45,  prep: 6,  category: 'Breakfast', available: false },
  { id: 5,  name: 'Veg Fried Rice',           desc: 'Wok-tossed rice with vegetables',              price: 80,  prep: 12, category: 'Meal',      available: true },
  { id: 6,  name: 'Curd Rice',                desc: 'Cooling yogurt rice with tempering',           price: 40,  prep: 5,  category: 'Meal',      available: true },
  { id: 7,  name: 'Paneer Butter Masala',     desc: 'Rich paneer curry with 2 rotis',               price: 120, prep: 15, category: 'Meal',      available: true },
  { id: 8,  name: 'Veg Biryani',              desc: 'Fragrant basmati rice with veggies',           price: 100, prep: 15, category: 'Meal',      available: true },
  { id: 9,  name: 'South Indian Thali',       desc: 'Rice, sambar, rasam, poriyal, curd, papad',    price: 110, prep: 12, category: 'Meal',      available: true },
  { id: 10, name: 'Samosa (2 pcs)',           desc: 'Crispy pastry with potato filling',            price: 25,  prep: 5,  category: 'Snack',     available: true },
  { id: 11, name: 'Vada (2 pcs)',             desc: 'Medu vada with chutney',                       price: 30,  prep: 6,  category: 'Snack',     available: true },
  { id: 12, name: 'Bajji (4 pcs)',            desc: 'Mixed vegetable fritters',                     price: 30,  prep: 7,  category: 'Snack',     available: true },
  { id: 13, name: 'Filter Coffee',            desc: 'Traditional South Indian coffee',              price: 20,  prep: 3,  category: 'Beverage',  available: true },
  { id: 14, name: 'Masala Chai',              desc: 'Spiced tea',                                   price: 15,  prep: 3,  category: 'Beverage',  available: true },
  { id: 15, name: 'Fresh Lime Soda',          desc: 'Sweet or salted',                              price: 25,  prep: 4,  category: 'Beverage',  available: true },
  { id: 16, name: 'Buttermilk',               desc: 'Spiced yogurt drink',                          price: 20,  prep: 3,  category: 'Beverage',  available: true },
];

const CATEGORY_ORDER: Array<MenuItem['category'] | 'All'> = ['All', 'Breakfast', 'Meal', 'Snack', 'Beverage'];

interface CartLine {
  item: MenuItem;
  qty: number;
}

export default function Canteen() {
  const [category, setCategory] = useState<MenuItem['category'] | 'All'>('All');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [pickupTime, setPickupTime] = useState('13:00');
  const [stage, setStage] = useState<'menu' | 'queued'>('menu');

  const filtered = useMemo(
    () => (category === 'All' ? MENU : MENU.filter((m) => m.category === category)),
    [category],
  );

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({
          item: MENU.find((m) => m.id === Number(id))!,
          qty,
        }))
        .filter((l) => l.qty > 0),
    [cart],
  );

  const subtotal = cartLines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const prepMax = cartLines.reduce((m, l) => Math.max(m, l.item.prep), 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });

  const submitOrder = () => setStage('queued');

  const resetOrder = () => {
    setCart({});
    setStage('menu');
  };

  // ═══════════════════════════════════════════════════════════════
  // QUEUED STATE
  // ═══════════════════════════════════════════════════════════════
  if (stage === 'queued') {
    const [h, m] = pickupTime.split(':').map(Number);
    const prepStart = new Date();
    prepStart.setHours(h, m - prepMax);

    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <span className="label label-accent">Order confirmed</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">Your order is queued.</h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            The kitchen has started preparing. You will be notified when it is ready for pickup.
          </p>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-12 gap-10">

            <div className="col-span-12 lg:col-span-7">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
                  <span className="label">Queue ticket</span>
                  <span className="label num">#01</span>
                </div>

                <div className="grid grid-cols-3 divide-x divide-[var(--color-rule)]">
                  <div className="px-6 py-6">
                    <span className="label">Pickup</span>
                    <div className="mt-3 font-display text-3xl num leading-none">{pickupTime}</div>
                  </div>
                  <div className="px-6 py-6">
                    <span className="label">Prep starts</span>
                    <div className="mt-3 font-display text-3xl num leading-none">
                      {String(prepStart.getHours()).padStart(2, '0')}:
                      {String(prepStart.getMinutes()).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <span className="label">Total</span>
                    <div className="mt-3 font-display text-3xl num leading-none">₹{total}</div>
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
                  <span className="label">Paid via UPI</span>
                  <span className="label num">UPI-DEMO-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={resetOrder} className="btn btn-outline text-sm">
                  Order again
                </button>
                <Link to="/requests/R-1044" className="btn-link text-sm">
                  View in requests →
                </Link>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-5">
              <div className="border-t border-[var(--color-rule)] pt-6">
                <span className="label">Timeline</span>
                <ol className="mt-6 space-y-6">
                  {[
                    { t: 'Now',                label: 'Payment confirmed',   active: true  },
                    { t: `${prepMax} min`,     label: 'Kitchen begins',      active: false },
                    { t: `~${prepMax + 5} min`, label: 'Ready for pickup',  active: false },
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

  // ═══════════════════════════════════════════════════════════════
  // MENU STATE
  // ═══════════════════════════════════════════════════════════════
  return (
    <Layout>
      <section className="pt-14 pb-10">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h1 className="text-2xl md:text-3xl">Canteen</h1>
          </div>
          <span className="label">
            Open · {MENU.filter((m) => m.available).length} items available
          </span>
        </div>
      </section>

      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((c) => (
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
                const disabled = !item.available;
                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-5 ${
                      disabled ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="col-span-8 md:col-span-9">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[16px]">{item.name}</h3>
                        {!item.available && <span className="label">Unavailable</span>}
                      </div>
                      <p className="mt-1 text-[14px] text-[var(--color-ink-3)] leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--color-ink-3)]">
                        <span className="num">₹{item.price}</span>
                        <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                        <span className="num">{item.prep} min</span>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                      {qty === 0 ? (
                        <button
                          disabled={disabled}
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
                            className="h-8 w-8 flex items-center justify-center border border-[var(--color-ink)] bg-[var(--color-ink)] text-white hover:bg-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
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
                    <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                      <span>Subtotal</span>
                      <span className="num">₹{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                      <span>GST (5%)</span>
                      <span className="num">₹{gst}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-[var(--color-rule)] text-[16px]">
                      <span>Total</span>
                      <span className="num">₹{total}</span>
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
                      className="btn btn-accent w-full"
                    >
                      Pay ₹{total} · UPI
                    </button>
                    <p className="mt-3 text-[12px] text-[var(--color-ink-4)] text-center leading-relaxed">
                      Kitchen starts preparing only after payment. You will be
                      notified when your order is ready.
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