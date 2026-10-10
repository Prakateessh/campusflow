import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

interface GearItem {
  id: number;
  name: string;
  sport: 'Badminton' | 'Cricket' | 'Tennis' | 'Football' | 'Basketball' | 'Athletics';
  total: number;
  available: number;
  returnDays: number;
  description: string;
}

const GEAR: GearItem[] = [
  { id: 1,  name: 'Badminton Racket',        sport: 'Badminton',  total: 20, available: 12, returnDays: 1, description: 'Yonex GR-303, carbon frame, 85g' },
  { id: 2,  name: 'Shuttlecock (tube of 6)', sport: 'Badminton',  total: 40, available: 30, returnDays: 0, description: 'Yonex Mavis 350, nylon' },
  { id: 3,  name: 'Badminton Net',           sport: 'Badminton',  total: 4,  available: 3,  returnDays: 1, description: 'Tournament-grade, portable poles' },
  { id: 4,  name: 'Cricket Bat',             sport: 'Cricket',    total: 8,  available: 5,  returnDays: 1, description: 'Kashmir willow, size SH' },
  { id: 5,  name: 'Cricket Ball (leather)',  sport: 'Cricket',    total: 15, available: 10, returnDays: 1, description: 'Red leather, 156g, match grade' },
  { id: 6,  name: 'Wicket Keeping Gloves',   sport: 'Cricket',    total: 4,  available: 2,  returnDays: 1, description: 'Padded palm, adult size' },
  { id: 7,  name: 'Tennis Racket',           sport: 'Tennis',     total: 10, available: 6,  returnDays: 1, description: 'Wilson Pro Staff, 300g' },
  { id: 8,  name: 'Tennis Ball (can of 3)',  sport: 'Tennis',     total: 30, available: 22, returnDays: 0, description: 'Wilson Championship, pressurised' },
  { id: 9,  name: 'Football',                sport: 'Football',   total: 10, available: 6,  returnDays: 1, description: 'Nivia Storm, size 5, match' },
  { id: 10, name: 'Goalkeeper Gloves',       sport: 'Football',   total: 4,  available: 3,  returnDays: 1, description: 'Latex palm, size L' },
  { id: 11, name: 'Basketball',              sport: 'Basketball', total: 8,  available: 5,  returnDays: 1, description: 'Spalding NBA, size 7' },
  { id: 12, name: 'Stopwatch',               sport: 'Athletics',  total: 12, available: 9,  returnDays: 1, description: 'Digital, split-timing, 1/100s' },
  { id: 13, name: 'Measuring Tape (100m)',   sport: 'Athletics',  total: 3,  available: 2,  returnDays: 1, description: 'Fibreglass, wind-resistant' },
  { id: 14, name: 'Discus',                  sport: 'Athletics',  total: 4,  available: 2,  returnDays: 1, description: '1kg, aluminium rim' },
];

type SportFilter = 'All' | GearItem['sport'];
const SPORTS: SportFilter[] = ['All', 'Badminton', 'Cricket', 'Tennis', 'Football', 'Basketball', 'Athletics'];

interface CartLine {
  item: GearItem;
  qty: number;
}

export default function Sports() {
  const [sport, setSport] = useState<SportFilter>('All');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [stage, setStage] = useState<'browse' | 'reserved'>('browse');

  const filtered = useMemo(
    () => (sport === 'All' ? GEAR : GEAR.filter((g) => g.sport === sport)),
    [sport],
  );

  const cartLines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({
          item: GEAR.find((g) => g.id === Number(id))!,
          qty,
        }))
        .filter((l) => l.qty > 0),
    [cart],
  );

  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const totalReturnDays = cartLines.reduce((m, l) => Math.max(m, l.item.returnDays), 0);

  const add = (id: number) =>
    setCart((c) => {
      const item = GEAR.find((g) => g.id === id)!;
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
    const returnDate = (() => {
      const d = new Date(pickupDate);
      d.setDate(d.getDate() + (totalReturnDays || 1));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    })();

    return (
      <Layout>
        <section className="pt-14 pb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <span className="label label-accent">Reservation confirmed</span>
          </div>
          <h1 className="text-3xl md:text-4xl leading-tight">Gear reserved.</h1>
          <p className="mt-4 text-[15px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            Collect from the Sports Complex counter. Bring your student ID. Return
            by the date below to avoid penalty.
          </p>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-12 gap-10">

            <div className="col-span-12 lg:col-span-7">
              <div className="border border-[var(--color-rule)] bg-[var(--color-card)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-rule)] bg-[var(--color-surface-low)]">
                  <span className="label">Reservation</span>
                  <span className="label num">SP-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[var(--color-rule)]">
                  <div className="px-6 py-6">
                    <span className="label">Pickup</span>
                    <div className="mt-3 font-display text-2xl num leading-none">
                      {new Date(pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className="px-6 py-6">
                    <span className="label">Return by</span>
                    <div className="mt-3 font-display text-2xl num leading-none">{returnDate}</div>
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
                        <span className="label">{l.item.sport}</span>
                      </li>
                    ))}
                  </ul>
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
                  Sports Complex counter<br />
                  Open 06:00 – 21:00 · Bring student ID
                </p>
              </div>

              <div className="border-t border-[var(--color-rule)] pt-6 mt-8">
                <span className="label">Policy</span>
                <ul className="mt-3 space-y-2 text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  <li>· Return by the date shown to avoid a fine</li>
                  <li>· Report damage or loss to the counter</li>
                  <li>· Late return blocks future reservations</li>
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
            <h1 className="text-2xl md:text-3xl">Sports</h1>
          </div>
          <span className="label">
            {GEAR.filter((g) => g.available > 0).length} of {GEAR.length} in stock
          </span>
        </div>
      </section>

      <section className="pb-8">
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`tag cursor-pointer transition-colors ${
                sport === s ? 'tag-accent' : 'hover:border-[var(--color-ink-4)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-24">
        <div className="grid grid-cols-12 gap-10">

          <div className="col-span-12 lg:col-span-8">
            <div className="border border-[var(--color-rule)] bg-[var(--color-card)] divide-y divide-[var(--color-rule)]">
              {filtered.map((g) => {
                const qty = cart[g.id] ?? 0;
                const out = g.available === 0;
                return (
                  <div
                    key={g.id}
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-5 ${
                      out ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="col-span-8 md:col-span-9">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-[16px]">{g.name}</h3>
                        <span className="label">{g.sport}</span>
                        {out && <span className="label label-accent">Out of stock</span>}
                      </div>
                      <p className="mt-1 text-[14px] text-[var(--color-ink-3)] leading-relaxed">
                        {g.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--color-ink-3)]">
                        <span className="num">{g.available} available</span>
                        {g.returnDays > 0 && (
                          <>
                            <span className="w-1 h-1 bg-[var(--color-ink-4)] rounded-full" />
                            <span>Return in {g.returnDays} day{g.returnDays > 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3">
                      {qty === 0 ? (
                        <button
                          disabled={out}
                          onClick={() => add(g.id)}
                          className="btn btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Reserve
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => remove(g.id)}
                            className="h-8 w-8 flex items-center justify-center border border-[var(--color-rule)] text-[var(--color-ink-2)] hover:border-[var(--color-ink)] transition-colors"
                            aria-label="Remove"
                          >
                            −
                          </button>
                          <span className="num text-[15px] w-6 text-center">{qty}</span>
                          <button
                            onClick={() => add(g.id)}
                            disabled={qty >= g.available}
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
                    Reserve gear from the list to submit a pickup request.
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
                        <span className="label">{l.item.sport}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="px-6 py-4 border-t border-[var(--color-rule)] space-y-3 text-[14px]">
                    <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                      <span>Total items</span>
                      <span className="num">{totalItems}</span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--color-ink-3)]">
                      <span>Max return window</span>
                      <span className="num">{totalReturnDays || 1} day{totalReturnDays > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-[var(--color-rule)]">
                    <label className="label block mb-2">Pickup date</label>
                    <input
                      type="date"
                      value={pickupDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setPickupDate(e.target.value)}
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
                      Free of charge. Bring your student ID to collect.
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