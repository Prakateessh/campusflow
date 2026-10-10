import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Home() {
  const stats = [
    { label: 'Total',     value: 12 },
    { label: 'Pending',   value: 3  },
    { label: 'Ongoing',   value: 2  },
    { label: 'Completed', value: 7  },
  ];

  const services = [
    { name: 'Lab access', desc: 'Request equipment, components, or a supervised slot.', to: '/facilities', image: '/lab.jpeg' },
    { name: 'Canteen',    desc: 'Pre-order meals for pickup at your chosen time.',     to: '/canteen',    image: '/canteen.jpeg' },
    { name: 'Library',    desc: 'Search the catalogue and renew books.',                to: '/library',    image: '/library.jpeg' },
    { name: 'Sports',     desc: 'Borrow rackets, balls, and other gear.',               to: '/sports',     image: '/sports.jpeg' },
    { name: 'Stores',     desc: 'Reserve stationery and daily essentials.',             to: '/store',      image: '/store.jpeg' },
  ];

  return (
    <Layout>
      {/* STATS */}
      <section className="pt-14 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-[var(--color-rule)]">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-[var(--color-card)] border-r border-b border-[var(--color-rule)] px-8 py-10"
            >
              <span className="label">{s.label}</span>
              <div className="mt-4 font-display text-4xl md:text-5xl num leading-none">
                {String(s.value).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="pb-24">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[var(--color-accent)]" />
            <h2 className="text-2xl md:text-3xl">Services</h2>
          </div>
          <span className="label">05 available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 border-t border-l border-[var(--color-rule)]">
          {services.map((s, i) => {
            const spanClass = i < 3 ? 'md:col-span-2' : 'md:col-span-3';
            return (
              <Link
                key={s.name}
                to={s.to}
                className={`group relative bg-[var(--color-card)] p-8 border-r border-b border-[var(--color-rule)] transition-colors overflow-hidden min-h-[320px] flex flex-col justify-between ${spanClass}`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundImage: `url(${s.image})` }}
                />
                <div className="absolute inset-0 bg-[var(--color-ink)]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex items-start justify-between">
                  <span className="label label-accent group-hover:text-white transition-colors num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[var(--color-ink-4)] group-hover:text-white transition-colors">
                    →
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl group-hover:text-white transition-colors">
                    {s.name}
                  </h3>
                  <p className="mt-3 text-[15px] text-[var(--color-ink-3)] group-hover:text-white/80 leading-relaxed transition-colors">
                    {s.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}