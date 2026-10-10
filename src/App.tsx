export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">

      {/* ── HEADER ── */}
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 h-20 flex items-center justify-between">

          {/* Logo — red mark, black wordmark */}
          <div className="flex items-center gap-4">
            <div className="h-6 w-6 bg-[var(--color-accent)] flex items-center justify-center">
              <span className="font-display text-white text-[13px] leading-none pt-px">C</span>
            </div>
            <span className="font-display text-[19px] tracking-tight">CampusFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a
              href="#"
              className="label label-accent border-b border-[var(--color-accent)] pb-1"
            >
              Facilities
            </a>
            <a href="#" className="label hover:text-[var(--color-ink)] transition">
              Bookings
            </a>
            <a href="#" className="label hover:text-[var(--color-ink)] transition">
              Assistant
            </a>
          </nav>

          <button className="btn btn-outline text-xs">Sign in</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-12 pt-24 pb-24">
        <div className="grid grid-cols-12 gap-12">

          <div className="col-span-12 lg:col-span-8 enter">
            <div className="flex items-center gap-4 mb-12">
              <span className="label label-accent">N° 01</span>
              <div className="w-12 h-px bg-[var(--color-accent-line)]" />
              <span className="label">Campus Facility System</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl">
              Every room.
              <br />
              <em className="font-display italic text-[var(--color-accent)]">Every</em>{' '}
              seat.
              <br />
              One system.
            </h1>

            <p className="mt-12 max-w-lg text-base text-[var(--color-ink-2)] leading-[1.7]">
              CampusFlow replaces WhatsApp groups and paper registers with a single
              intelligent booking layer — one that knows when a hall is filling up
              and reroutes you before you arrive.
            </p>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <button className="btn btn-accent">Book a facility</button>
              <button className="btn btn-ghost">Ask the assistant</button>
            </div>
          </div>

          {/* Right — stat block */}
          <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-[var(--color-rule)] lg:pl-12 enter enter-2">
            <span className="label">At a glance</span>

            <dl className="mt-8 divide-y divide-[var(--color-rule)]">
              {[
                { n: '49',  l: 'Facilities mapped' },
                { n: '08',  l: 'Categories' },
                { n: '20s', l: 'Avg. booking time' },
                { n: 'AI',  l: 'Rerouting engine' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex items-baseline justify-between py-5"
                >
                  <dd className="font-display text-4xl num leading-none">
                    {s.n}
                  </dd>
                  <dt className="label text-right max-w-[8rem]">{s.l}</dt>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section className="border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-24">

          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="label label-accent">N° 02 — Browse</span>
              <h2 className="mt-6 text-3xl md:text-5xl">
                Facilities by{' '}
                <em className="italic text-[var(--color-accent)]">category</em>
              </h2>
            </div>
            <button className="btn-link hidden md:inline-flex text-sm">
              View all 49 →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[var(--color-rule)]">
            {[
              { id: '01', name: 'Electronics',        count: 13, desc: 'Circuits, VLSI, embedded systems, RF & signals.' },
              { id: '02', name: 'Computing & AI',     count: 7,  desc: 'Data centre, cyber, robotics, intelligent systems.' },
              { id: '03', name: 'Energy & Materials', count: 11, desc: 'Solar, batteries, nanomaterials, green tech.' },
              { id: '04', name: 'Innovation',         count: 4,  desc: 'Makerspaces, startups, prototyping labs.' },
              { id: '05', name: 'Mechanical',         count: 6,  desc: 'Welding, forming, structural, chemical.' },
              { id: '06', name: 'General',            count: 8,  desc: 'Study halls, sports, dining, stores.' },
            ].map((c) => (
              <button
                key={c.id}
                className="group card-accent bg-[var(--color-card)] p-8 md:p-10 text-left border-r border-b border-[var(--color-rule)] transition-colors hover:bg-[var(--color-surface-low)]"
              >
                <div className="flex items-start justify-between mb-12">
                  <span className="label group-hover:text-[var(--color-accent)] transition-colors">
                    {c.id}
                  </span>
                  <span className="label num">
                    {String(c.count).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl group-hover:text-[var(--color-accent)] transition-colors">
                  {c.name}
                </h3>
                <p className="mt-4 text-sm text-[var(--color-ink-3)] leading-[1.7]">
                  {c.desc}
                </p>

                <span className="mt-10 inline-block label label-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASSISTANT ── */}
      <section className="border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-24">
          <div className="grid grid-cols-12 gap-12">

            <div className="col-span-12 lg:col-span-5">
              <span className="label label-accent">N° 03 — Assistant</span>
              <h2 className="mt-6 text-3xl md:text-5xl">
                Just ask.
                <br />
                <em className="italic text-[var(--color-ink-3)]">
                  in plain words.
                </em>
              </h2>
            </div>

            <div className="col-span-12 lg:col-span-7 lg:border-l lg:border-[var(--color-rule)] lg:pl-12">
              <div className="flex items-center gap-3 mb-10">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-40 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]" />
                </span>
                <span className="label label-accent">Live</span>
              </div>

              <blockquote className="font-display text-2xl md:text-[32px] leading-[1.35] text-[var(--color-ink-2)]">
                “I need a lab for 20 people
                <em className="italic text-[var(--color-ink)]">
                  {' '}tomorrow at 2 PM.
                </em>
                ”
              </blockquote>

              <div className="mt-10 flex flex-wrap gap-2">
                <span className="tag tag-accent">Lab · 20 seats</span>
                <span className="tag">Tomorrow · 14:00</span>
                <span className="tag">Electronics</span>
                <span className="tag">Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 bg-[var(--color-accent)]" />
            <span className="label label-ink">CampusFlow — 2026</span>
          </div>
          <span className="label">Built for campuses that move.</span>
        </div>
      </footer>
    </div>
  );
}