import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { FACILITIES, CATEGORIES } from '../data/facilities';

export default function FacilityDetail() {
  const { id } = useParams();
  const [requested, setRequested] = useState(false);
  const facility = FACILITIES.find((f) => f.id === Number(id));

  if (!facility) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <span className="label label-accent">404</span>
          <h1 className="mt-4 text-3xl">Facility not found</h1>
          <Link to="/facilities" className="btn-link text-sm inline-block mt-6">
            ← Back to facilities
          </Link>
        </div>
      </Layout>
    );
  }

  const category = CATEGORIES.find((c) => c.id === facility.category);

  return (
    <Layout>
      <section className="pt-10 pb-6">
        <Link to="/facilities" className="label hover:text-[var(--color-ink)] transition">
          ← All facilities
        </Link>
      </section>

      <section className="pb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="label label-accent num">{facility.code}</span>
          <span className="w-6 h-px bg-[var(--color-rule)]" />
          <span className="label">{category?.name}</span>
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
                <span className="w-6 h-px bg-[var(--color-accent)]" />
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
                    <span className="w-6 h-px bg-[var(--color-accent)]" />
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
                onClick={() => setRequested(true)}
                disabled={requested}
                className={`w-full text-sm ${
                  requested ? 'btn btn-outline pointer-events-none' : 'btn btn-accent'
                }`}
              >
                {requested ? '✓ Request submitted' : 'Request access'}
              </button>
              {requested && (
                <p className="text-[13px] text-[var(--color-ink-3)] text-center leading-relaxed">
                  Awaiting sponsor approval. Track in{' '}
                  <Link to="/requests" className="underline hover:text-[var(--color-ink)]">
                    My requests
                  </Link>.
                </p>
              )}
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
                  <dd>{category?.name}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--color-ink-3)]">Equipment</dt>
                  <dd className="num">{facility.equipment.length}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}